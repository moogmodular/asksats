import { t } from '../trpc'
import { prisma } from '~/server/prisma'
import { createSpaceInput } from '~/components/ask/CreateSpace'
import { isAuthed } from '~/server/middlewares/authed'
import { userBalance } from '~/server/service/accounting'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { SPACE_CREATION_COST } from '~/server/service/constants'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { s3Client } from '~/server/service/s3-client'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { editSpaceInput } from '~/components/ask/EditSpace'

export const spaceRouter = t.router({
    list: t.procedure.query(async ({ ctx }) => {
        return await prisma.space.findMany({ orderBy: { createdAt: 'desc' } })
    }),
    editSpace: t.procedure
        .use(isAuthed)
        .input(editSpaceInput)
        .mutation(async ({ ctx, input }) => {
            const space = await prisma.space.findUnique({ where: { id: input.spaceId } })
            if (space?.creatorId !== ctx.user.id) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'You are not the creator of this space',
                })
            }
            return await prisma.space.update({
                where: { id: input.spaceId },
                data: {
                    description: input.description,
                    nsfw: input.nsfw,
                    headerImage: input.headerImageId ? { connect: { id: input.headerImageId } } : undefined,
                },
            })
        }),
    spaceInfo: t.procedure.input(z.object({ spaceName: z.string() })).query(async ({ ctx, input }) => {
        const space = await prisma.space.findUnique({
            where: { name: input.spaceName },
            include: { headerImage: true },
        })
        return {
            ...space,
            headerImageUrl: space?.headerImage?.s3Key
                ? await getSignedUrl(
                      s3Client,
                      new GetObjectCommand({
                          Bucket: `${process.env.DO_API_NAME}`,
                          Key: space.headerImage.s3Key,
                      }),
                  )
                : '',
        }
    }),
    spaceInfoById: t.procedure.input(z.object({ spaceId: z.string() })).query(async ({ ctx, input }) => {
        const space = await prisma.space.findUnique({
            where: { id: input.spaceId },
            include: { headerImage: true },
        })
        return {
            ...space,
            headerImageUrl: space?.headerImage?.s3Key
                ? await getSignedUrl(
                      s3Client,
                      new GetObjectCommand({
                          Bucket: `${process.env.DO_API_NAME}`,
                          Key: space.headerImage.s3Key,
                      }),
                  )
                : '',
        }
    }),
    create: t.procedure
        .use(isAuthed)
        .input(createSpaceInput)
        .mutation(async ({ ctx, input }) => {
            const balance = await userBalance(ctx.user.id)

            if (balance.availableBalance < SPACE_CREATION_COST) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'You need at least ${SPACE_CREATION_COST} satoshis to create a space',
                })
            }

            return await prisma.space.create({
                data: {
                    name: input.name,
                    description: input.description,
                    nsfw: input.nsfw,
                    headerImage: input.headerImageId ? { connect: { id: input.headerImageId } } : undefined,
                    creator: { connect: { id: ctx.user.id } },
                },
            })
        }),
    mySpaces: t.procedure.use(isAuthed).query(async ({ ctx }) => {
        return await prisma.space.findMany({
            where: {
                creatorId: ctx.user.id,
            },
        })
    }),
})
