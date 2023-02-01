import { t } from '../trpc'
import { prisma } from '~/server/prisma'
import { isAuthed, isAuthedOrGuest } from '~/server/middlewares/authed'
import { createAskInput } from '~/components/ask/CreateAsk'
import { slugify } from '~/utils/string'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { s3Client } from '~/server/service/s3-client'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { askListProps } from '~/store/listStore'
import { minBumpForAsk, userBalance } from '~/server/service/accounting'
import { TRPCError } from '@trpc/server'
import { DEFAULT_EXCLUDED_TAG, MSATS_UNIT_FACTOR, PAYOUT_FACTOR } from '~/server/service/constants'
import { byAskKind, byTags, byUser, getOrder, getSearch } from '~/server/service/ask'
import { AskStatus } from '~/components/ask/Ask'
import {
    doCanceleAskBalanceTransaction,
    doCreateAskBalanceTransaction,
    doSettleAskBalanceTransaction,
} from '~/server/service/finalise'

const byAskStatus = (status?: AskStatus) => {
    return status
        ? {
              askStatus: status,
          }
        : {}
}

export const askRouter = t.router({
    myList: t.procedure.use(isAuthed).query(async ({ ctx, input }) => {
        return await prisma.ask.findMany({ where: { user: { id: ctx.user.id } } })
    }),
    cancel: t.procedure
        .use(isAuthed)
        .input(
            z.object({
                askId: z.string(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const askToCancel = await prisma.ask.findUnique({
                where: { id: input.askId },
                include: {
                    user: true,
                },
            })

            if (!askToCancel) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'Ask not found',
                })
            }

            if (askToCancel.user?.id !== ctx.user.id) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'You cannot cancel this ask',
                })
            }

            if (askToCancel.askStatus !== 'OPEN') {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'This ask is not open',
                })
            }

            return await doCanceleAskBalanceTransaction(input.askId)
        }),
    settleAsk: t.procedure
        .use(isAuthed)
        .input(
            z.object({
                offerId: z.string(),
                askId: z.string(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const user = await prisma.user.findUnique({
                where: {
                    id: ctx.user.id,
                },
            })

            const askToSettle = await prisma.ask.findUnique({
                where: {
                    id: input.askId,
                },
                include: {
                    offer: true,
                    user: true,
                },
            })

            if (user?.id !== askToSettle?.user?.id) {
                throw new TRPCError({ code: 'BAD_REQUEST', message: 'not your ask' })
            }

            if (!askToSettle) {
                throw new TRPCError({ code: 'BAD_REQUEST', message: 'ask not found' })
            }

            if (askToSettle.userId !== ctx.user.id) {
                throw new TRPCError({ code: 'BAD_REQUEST', message: 'not your ask' })
            }

            const targetOfferIsInAsk = askToSettle.offer.find((o) => o.id === input.offerId)

            if (!targetOfferIsInAsk) {
                throw new TRPCError({ code: 'BAD_REQUEST', message: 'offer not found' })
            }

            if (askToSettle.askStatus !== 'OPEN') {
                throw new TRPCError({ code: 'BAD_REQUEST', message: 'ask not open' })
            }

            const offerer = await prisma.offer.findUnique({
                where: {
                    id: input.offerId,
                },
            })

            if (!offerer || !offerer.authorId) {
                throw new TRPCError({ code: 'BAD_REQUEST', message: 'offer not found' })
            }

            return await doSettleAskBalanceTransaction(input.askId, input.offerId, offerer.authorId)
        }),
    list: t.procedure
        .use(isAuthedOrGuest)
        .input(askListProps)
        .query(async ({ ctx, input }) => {
            const excludedTags = ctx?.user
                ? await prisma.user.findUnique({ where: { id: ctx?.user?.id } }).excludedTags()
                : undefined

            const listWithStatus = await prisma.ask
                .findMany({
                    where: {
                        ...getSearch(input.searchTerm),
                        ...byAskStatus(input.filterFor),
                        ...byUser(input.userName),
                        ...(byAskKind(input.askKind) as Prisma.EnumAskKindFilter),
                        ...byTags(excludedTags ?? DEFAULT_EXCLUDED_TAG, ctx?.user?.role ?? 'USER', input.tagName),
                    },
                    orderBy: getOrder(input.orderBy, input.orderByDirection),
                    take: input.pageSize + 1,
                    cursor: input.cursor ? { id: input.cursor } : undefined,
                    include: {
                        askContext: { include: { headerImage: true } },
                        bumps: true,
                        user: { select: { userName: true, publicKey: true, profileImage: true } },
                        offer: true,
                        settledForOffer: true,
                        tags: {
                            include: { tag: true },
                        },
                    },
                })
                .then((list) =>
                    list.map((ask) => {
                        const bumpSum = ask.bumps.reduce((acc, bump) => acc + bump.amount / MSATS_UNIT_FACTOR, 0)

                        return {
                            ...ask,
                            minBump: minBumpForAsk(bumpSum, ask.askKind),
                        }
                    }),
                )

            let nextCursor
            if (listWithStatus.length > input.pageSize) {
                const nextItem = listWithStatus.pop()
                nextCursor = nextItem!.id
            }

            const items = await Promise.all(
                listWithStatus.map(async (ask) => {
                    return {
                        ...ask,
                        bumps: {
                            bumpCount: ask.bumps.length,
                            bumpSum: ask.bumps.reduce((acc, cur) => acc + cur.amount / MSATS_UNIT_FACTOR, 0),
                        },
                        offerCount: ask.offer.length,
                        askContext: {
                            ...ask.askContext,
                            headerImageUrl: ask?.askContext?.headerImage?.s3Key
                                ? await getSignedUrl(
                                      s3Client,
                                      new GetObjectCommand({
                                          Bucket: `${process.env.DO_API_NAME}`,
                                          Key: ask.askContext.headerImage.s3Key,
                                      }),
                                  )
                                : '',
                        },
                    }
                }),
            )

            return {
                items,
                nextCursor,
            }
        }),
    create: t.procedure
        .use(isAuthed)
        .input(createAskInput)
        .mutation(async ({ ctx, input }) => {
            const { availableBalance } = await userBalance(ctx?.user?.id)
            if (availableBalance < input.amount) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: `Insufficient balance. Available: ${availableBalance} sats`,
                })
            }

            const allTags = input.tags
                ? await Promise.all(
                      input.tags.map(async (tag) => {
                          const existingTag = await prisma.tag.findUnique({ where: { name: tag } })

                          if (existingTag) {
                              return existingTag
                          }

                          return await prisma.tag.create({ data: { name: tag } })
                      }),
                  )
                : []

            return await doCreateAskBalanceTransaction(
                input.askKind,
                allTags,
                ctx.user.id,
                input.amount,
                input.title,
                input.content,
                input.headerImageId,
            )
        }),
    byContextSlug: t.procedure.input(z.object({ slug: z.string() })).query(async ({ ctx, input }) => {
        const askContext = await prisma.askContext.findUnique({
            where: { slug: input.slug },
            include: {
                ask: {
                    include: {
                        user: true,
                        bumps: true,
                        offer: true,
                        settledForOffer: true,
                        tags: { include: { tag: true } },
                    },
                },
                headerImage: true,
            },
        })

        const bumpSum = askContext?.ask?.bumps.reduce((acc, bump) => acc + bump.amount / MSATS_UNIT_FACTOR, 0) || 0

        return {
            ...askContext,
            ask: {
                ...askContext?.ask,
                minBump: minBumpForAsk(bumpSum, askContext?.ask?.askKind ?? 'PRIVATE'),
                bumpSummary: askContext?.ask.bumps
                    .map((bump) => {
                        return {
                            amount: bump.amount / MSATS_UNIT_FACTOR,
                        }
                    })
                    .sort((a, b) => b.amount - a.amount),
                bumps: {
                    bumpCount: askContext?.ask.bumps.length ?? 0,
                    bumpSum: askContext?.ask.bumps.reduce((acc, cur) => acc + cur.amount / MSATS_UNIT_FACTOR, 0) ?? 0,
                },
                offerCount: askContext?.ask.offer.length,
            },
            headerImageUrl: askContext?.headerImage?.s3Key
                ? await getSignedUrl(
                      s3Client,
                      new GetObjectCommand({
                          Bucket: `${process.env.DO_API_NAME}`,
                          Key: askContext?.headerImage.s3Key,
                      }),
                  )
                : '',
        }
    }),
})
