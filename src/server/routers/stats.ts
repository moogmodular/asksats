import { t } from '../trpc'
import { prisma } from '~/server/prisma'
import { isAuthed } from '~/server/middlewares/authed'
import { MSATS_UNIT_FACTOR } from '~/server/service/constants'

export const statsRouter = t.router({
    oldestTopBountyNotSettled: t.procedure.query(async ({ ctx }) => {
        const openAsks = await prisma.ask.findMany({
            where: { askStatus: 'OPEN' },
            orderBy: { createdAt: 'desc' },
            include: {
                askContext: true,
                bumps: true,
                offer: true,
            },
        })
        return openAsks
            .map((ask) => {
                return {
                    ...ask,
                    bumpSum: ask.bumps.reduce((acc, bump) => acc + bump.amount / MSATS_UNIT_FACTOR, 0),
                    offerCount: ask.offer.length,
                    bumpCount: ask.bumps.length,
                }
            })
            .sort((a, b) => b.bumpSum - a.bumpSum)
            .slice(0, 5)
    }),
    topEarners: t.procedure.query(async ({ ctx }) => {
        const topEarners = await prisma.user.findMany({
            where: { offers: { some: { ask: { askStatus: 'SETTLED' } } } },
            include: { offers: { include: { ask: { include: { bumps: true } } } } },
        })

        return topEarners
            .map((user) => {
                const relevantOffers = user.offers.filter((offer) => offer.favouritedById)
                return {
                    ...user,
                    totalEarned: relevantOffers
                        .map((offer) =>
                            offer?.ask?.bumps.reduce((acc, bump) => acc + bump.amount / MSATS_UNIT_FACTOR, 0),
                        )
                        .reduce((acc, bump) => (acc ?? 0) + (bump ?? 0), 0),
                }
            })
            .sort((a, b) => (a.totalEarned ?? 0) - (b.totalEarned ?? 0))
            .slice(0, 3)
    }),
    topSpenders: t.procedure.query(async ({ ctx }) => {
        const test = await prisma.user.findMany({
            where: { asks: { some: { askStatus: 'SETTLED' } } },
            include: { offers: true, bumps: true },
        })
        return test
            .map((user) => {
                return {
                    userName: user.userName,
                    publicKey: user.publicKey,
                    createdAt: user.createdAt,
                    totalEarned: user.bumps.reduce((acc, offer) => acc + offer.amount / MSATS_UNIT_FACTOR, 0),
                }
            })
            .sort((a, b) => b.totalEarned - a.totalEarned)
            .slice(0, 3)
    }),
    biggestGrossingAsks: t.procedure.query(async ({ ctx }) => {
        const test = await prisma.ask.findMany({
            where: { askStatus: 'SETTLED' },
            include: { bumps: true, askContext: true, offer: true },
        })
        return test
            .map((ask) => {
                return {
                    ...ask,
                    name: ask?.askContext?.title,
                    grossed: ask.bumps.reduce((acc, offer) => acc + offer.amount / MSATS_UNIT_FACTOR, 0),
                    offerCount: ask.offer.length,
                    bumpCount: ask.bumps.length,
                }
            })
            .sort((a, b) => b.grossed - a.grossed)
            .slice(0, 3)
    }),
    myStats: t.procedure.use(isAuthed).query(async ({ ctx }) => {
        const user = await prisma.user.findUnique({
            where: { id: ctx.user.id },
            include: {
                asks: { where: { askStatus: 'SETTLED' } },
                offers: {
                    where: { ask: { askStatus: 'SETTLED' } },
                    include: { ask: { include: { bumps: true } }, favouritedBy: true },
                },
                bumps: true,
            },
        })

        const myAsks = await prisma.ask.findMany({
            where: { userId: ctx.user.id },
        })

        const myOffers = await prisma.offer.findMany({
            where: { authorId: ctx.user.id },
        })

        return {
            userName: user?.userName,
            publicKey: user?.publicKey,
            totalEarned: user?.offers
                .filter((filter) => !filter.favouritedBy)
                .reduce(
                    (acc, offer) =>
                        acc +
                        (offer?.ask?.bumps.reduce((acc, offer) => acc + offer.amount / MSATS_UNIT_FACTOR ?? 0, 0) ?? 0),
                    0,
                ),
            totalSpent: user?.bumps.reduce((acc, offer) => acc + offer.amount / MSATS_UNIT_FACTOR, 0),
            totalAsks: myAsks.length,
            settledAsks: user?.asks.length,
            totalOffers: myOffers.length,
            settledOffers: user?.offers.length,
        }
    }),
    siteStats: t.procedure.query(async ({ ctx }) => {
        const userCount = await prisma.user.count()
        const askCount = await prisma.ask.count()
        const offerCount = await prisma.offer.count()
        const bumps = await prisma.bump.findMany()

        return {
            userCount,
            askCount,
            offerCount,
            bumpCount: bumps.length,
            totalEarned: bumps.reduce((acc, offer) => acc + offer.amount / MSATS_UNIT_FACTOR, 0),
        }
    }),
})
