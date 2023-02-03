import { t } from '../trpc'
import { prisma } from '~/server/prisma'
import { isAuthed, isAuthedOrGuest } from '~/server/middlewares/authed'
import { createAskInput } from '~/components/ask/CreateAsk'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { s3Client } from '~/server/service/s3-client'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { askListProps } from '~/store/listStore'
import { minBumpForAsk, userBalance } from '~/server/service/accounting'
import { TRPCError } from '@trpc/server'
import { ASK_EDITABLE_TIME, DEFAULT_EXCLUDED_TAG, MSATS_UNIT_FACTOR } from '~/server/service/constants'
import { byAskKind, byTags, byUser, getOrder, getSearch } from '~/server/service/ask'
import { AskStatus } from '~/components/ask/Ask'
import {
    doCanceleAskBalanceTransaction,
    doCreateAskBalanceTransaction,
    doSettleAskBalanceTransaction,
} from '~/server/service/finalise'
import { editAskInput } from '~/components/ask/EditAsk'
import { add, isFuture } from 'date-fns'

const byAskStatus = (status?: AskStatus) => {
    return status
        ? {
              askStatus: status,
          }
        : {}
}

const bySpace = (space = 'all') => {
    return space === 'all'
        ? {}
        : {
              spaceName: space,
          }
}

export const askRouter = t.router({
    myList: t.procedure.use(isAuthed).query(async ({ ctx, input }) => {
        const myAsks = await prisma.ask.findMany({
            where: { user: { id: ctx.user.id } },
            include: { askContext: true, bumps: true, offer: true },
        })
        return myAsks.map((ask) => {
            return {
                ...ask,
                bumpSum: ask.bumps.reduce((acc, bump) => acc + bump.amount / MSATS_UNIT_FACTOR, 0),
                offerCount: ask.offer.length,
                bumpCount: ask.bumps.length,
            }
        })
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
                        ...bySpace(input.spaceName),
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
                        space: {
                            select: { name: true },
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
                        editable:
                            isFuture(add(ask.createdAt, { seconds: ASK_EDITABLE_TIME })) &&
                            ask.askStatus === 'OPEN' &&
                            ask?.userId === ctx?.user?.id,
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
    getAskContext: t.procedure
        .use(isAuthed)
        .input(z.object({ askId: z.string() }))
        .query(async ({ ctx, input }) => {
            const ask = await prisma.ask.findUnique({
                where: {
                    id: input.askId,
                },
                include: {
                    tags: {
                        include: { tag: true },
                    },
                    askContext: {
                        include: {
                            headerImage: true,
                        },
                    },
                },
            })

            return {
                ask: ask,
                ...ask?.askContext,
                headerImageUrl: ask?.askContext?.headerImage?.s3Key
                    ? await getSignedUrl(
                          s3Client,
                          new GetObjectCommand({
                              Bucket: `${process.env.DO_API_NAME}`,
                              Key: ask.askContext.headerImage.s3Key,
                          }),
                      )
                    : '',
            }
        }),
    edit: t.procedure
        .use(isAuthed)
        .input(editAskInput)
        .mutation(async ({ ctx, input }) => {
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

            const askCheck = await prisma.ask.findUnique({
                where: {
                    id: input.askId,
                },
            })

            if (askCheck?.userId !== ctx?.user?.id) {
                throw new TRPCError({ code: 'BAD_REQUEST', message: 'not your ask' })
            }

            if (!askCheck) {
                throw new TRPCError({ code: 'BAD_REQUEST', message: 'ask not found' })
            }

            if (!isFuture(add(askCheck?.createdAt, { seconds: ASK_EDITABLE_TIME })) && askCheck?.askStatus === 'OPEN') {
                throw new TRPCError({ code: 'BAD_REQUEST', message: 'ask not editable' })
            }

            await prisma.ask.update({
                where: {
                    id: input.askId,
                },
                data: {
                    tags: {
                        deleteMany: {},
                    },
                },
            })

            const ask = await prisma.ask.update({
                where: {
                    id: input.askId,
                },
                data: {
                    tags: {
                        createMany: {
                            data: allTags.map((tag) => {
                                return {
                                    tagId: tag!.id,
                                }
                            }),
                        },
                    },
                },
                include: {
                    askContext: true,
                },
            })

            return await prisma.askContext.update({
                where: {
                    id: ask?.askContext?.id ?? '',
                },
                data: {
                    content: input.content,
                    headerImageId: input.headerImageId,
                },
            })
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

            const space = await prisma.space.findUnique({
                where: {
                    name: input.space,
                },
            })

            if (!space) {
                throw new TRPCError({ code: 'BAD_REQUEST', message: 'space not found' })
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
                space.name,
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
                        space: true,
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
                editable:
                    isFuture(add(askContext?.ask?.createdAt ?? new Date(), { seconds: ASK_EDITABLE_TIME })) &&
                    askContext?.ask?.askStatus === 'OPEN' &&
                    askContext?.ask?.userId === ctx?.user?.id,
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
