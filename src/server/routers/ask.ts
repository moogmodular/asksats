import { t } from '../trpc'
import { prisma } from '~/server/prisma'
import { isAuthed, isAuthedOrGuest } from '~/server/middlewares/authed'
import { createAskInput } from '~/components/ask/CreateAsk'
import { slugify } from '~/utils/string'
import { add } from 'date-fns'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { s3Client } from '~/server/service/s3-client'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { askListProps } from '~/store/listStore'
import { minBumpForAsk, userBalance } from '~/server/service/accounting'
import { TRPCError } from '@trpc/server'
import { DEFAULT_EXCLUDED_TAG } from '~/server/service/constants'
import { byAskKind, byTags, byUser, getAskStatus, getFilter, getOrder, getSearch } from '~/server/service/ask'

export const askRouter = t.router({
    myList: t.procedure.use(isAuthed).query(async ({ ctx, input }) => {
        return await prisma.ask.findMany({ where: { user: { id: ctx.user.id } } })
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
                        ...getFilter(input.filterFor),
                        ...byUser(input.userName),
                        ...(byAskKind(input.askKind) as Prisma.EnumAskKindFilter),
                        ...byTags(excludedTags ?? DEFAULT_EXCLUDED_TAG, ctx?.user?.role ?? 'USER'),
                    },
                    orderBy: getOrder(input.orderBy, input.orderByDirection),
                    take: input.pageSize + 1,
                    cursor: input.cursor ? { id: input.cursor } : undefined,
                    include: {
                        askContext: { include: { headerImage: true } },
                        bumps: true,
                        user: { select: { userName: true, publicKey: true } },
                        offer: true,
                        favouriteOffer: true,
                        tags: {
                            include: { tag: true },
                        },
                    },
                })
                .then((list) =>
                    list.map((ask) => {
                        const bumpSum = ask.bumps.reduce((acc, bump) => acc + bump.amount, 0)

                        return {
                            ...ask,
                            minBump: minBumpForAsk(bumpSum, ask.askKind),
                            status: getAskStatus(
                                ask.deadlineAt,
                                ask.acceptedDeadlineAt,
                                Boolean(ask.offer.length),
                                Boolean(ask.favouriteOffer),
                            ),
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
                            bumpSum: ask.bumps.reduce((acc, cur) => acc + cur.amount, 0),
                        },
                        offerCount: ask.offer.length,
                        status: ask.status,
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
            const { availableBalance } = await userBalance(prisma, ctx?.user?.id)
            if (availableBalance < input.amount) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: `Insufficient balance. Available: ${availableBalance} sats`,
                })
            }

            const allTags = await Promise.all(
                input.tags.map(async (tag) => {
                    const existingTag = await prisma.tag.findUnique({ where: { name: tag } })

                    if (existingTag) {
                        return existingTag
                    }

                    return await prisma.tag.create({ data: { name: tag } })
                }),
            )

            const deadlineAt = add(new Date(), input.untilClosed)
            const acceptedAfter = add(deadlineAt, input.acceptedAfterClosed)

            return prisma.ask.create({
                data: {
                    user: { connect: { id: ctx.user.id } },
                    askKind: input.askKind,
                    deadlineAt: deadlineAt,
                    acceptedDeadlineAt: acceptedAfter,
                    tags: {
                        createMany: {
                            data: allTags.map((tag) => {
                                return {
                                    tagId: tag!.id,
                                }
                            }),
                        },
                    },
                    bumps: {
                        create: {
                            bidder: { connect: { id: ctx.user.id } },
                            amount: input.amount,
                        },
                    },
                    askContext: {
                        create: {
                            title: input.title,
                            slug: slugify(input.title),
                            content: input.content,
                            headerImage: { connect: { id: input.headerImageId } },
                        },
                    },
                },
            })
        }),
    byContextSlug: t.procedure
        .use(isAuthed)
        .input(z.object({ slug: z.string() }))
        .query(async ({ ctx, input }) => {
            const askContext = await prisma.askContext.findUnique({
                where: { slug: input.slug },
                include: {
                    ask: {
                        include: {
                            user: true,
                            bumps: true,
                            offer: true,
                            favouriteOffer: true,
                            tags: { include: { tag: true } },
                        },
                    },
                    headerImage: true,
                },
            })

            const bumpSum = askContext?.ask?.bumps.reduce((acc, bump) => acc + bump.amount, 0) || 0

            return {
                ...askContext,
                ask: {
                    ...askContext?.ask,
                    minBump: minBumpForAsk(bumpSum, askContext?.ask?.askKind ?? 'PRIVATE'),
                    status: getAskStatus(
                        askContext?.ask.deadlineAt ?? new Date(),
                        askContext?.ask.acceptedDeadlineAt ?? new Date(),
                        Boolean(askContext?.ask.offer.length),
                        Boolean(askContext?.ask?.favouriteOffer),
                    ),
                    bumpSummary: askContext?.ask.bumps
                        .map((bump) => {
                            return {
                                amount: bump.amount,
                            }
                        })
                        .sort((a, b) => b.amount - a.amount),
                    bumps: {
                        bumpCount: askContext?.ask.bumps.length ?? 0,
                        bumpSum: askContext?.ask.bumps.reduce((acc, cur) => acc + cur.amount, 0) ?? 0,
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
