import { t } from '../trpc'
import { z } from 'zod'
import { prisma } from '~/server/prisma'
import { editUserInput } from '~/components/modal/EditUser'
import { TRPCError } from '@trpc/server'
import { isAuthed } from '~/server/middlewares/authed'
import { userBalance } from '~/server/service/accounting'
import { sendMessageToPubKey } from '~/server/service/nostr'
import jwt from 'jsonwebtoken'

export const userRouter = t.router({
    getMe: t.procedure.use(isAuthed).query(async ({ ctx }) => {
        const tokenUser = ctx.user
        try {
            const user = await prisma.user.findUnique({
                where: {
                    id: tokenUser?.id,
                },
            })
            return {
                ...user,
                balance: await userBalance(user?.id ?? ''),
            }
        } catch (error) {
            throw new TRPCError({
                code: 'UNAUTHORIZED',
                message: 'User not found.',
            })
        }
    }),
    listLatest: t.procedure
        .input(
            z.object({
                limit: z.number().min(1).max(100),
            }),
        )
        .query(async ({ input }) => {
            return await prisma.user.findMany({
                take: input.limit,
                orderBy: { createdAt: 'desc' },
            })
        }),
    edit: t.procedure
        .use(isAuthed)
        .input(editUserInput)
        .mutation(async ({ input, ctx }) => {
            const updatedUser = await prisma.user
                .update({
                    where: { id: ctx.user.id },
                    data: {
                        userName: input.userName,
                        profileImage: input.base64EncodedImage,
                        bio: input.bio,
                        nostrPubKey: input.nostrPubKey,
                    },
                })
                .catch((error) => {
                    throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
                })

            if (updatedUser.nostrPubKey && !ctx.user.nostrPubKey) {
                void sendMessageToPubKey(
                    updatedUser.nostrPubKey,
                    `Welcome to AtriSats.com ${updatedUser.userName}.\nYou can follow us on @ArtiSats.com.\nYou will now receive notifications when anything happens to your aks, asks that you bumped and asks that you offered for.`,
                )
            }

            const updatedUserNoImage = {
                ...updatedUser,
                profileImage: undefined,
            }

            return {
                user: {
                    ...updatedUser,
                    balance: await userBalance(updatedUser?.id ?? ''),
                },
                token: jwt.sign({ ...updatedUserNoImage }, process.env.JWT_SECRET ?? ''),
            }
        }),
    deleteMe: t.procedure.use(isAuthed).mutation(async ({ ctx }) => {
        return await prisma.user
            .delete({
                where: { id: ctx.user.id },
            })
            .catch((error) => {
                throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
            })
    }),
})
