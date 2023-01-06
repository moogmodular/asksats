import { t } from '../trpc'
import { prisma } from '~/server/prisma'
import { ACTIVE_SELECT, SETTLED_SELECT } from '~/server/service/selects'
import { isAuthed } from '~/server/middlewares/authed'
import { getAskStatus } from '~/server/service/ask'

export const statsRouter = t.router({
    endingSoon: t.procedure.query(async ({ ctx }) => {
        return await prisma.ask
            .findMany({
                where: ACTIVE_SELECT,
                orderBy: { deadlineAt: 'asc' },
                include: { askContext: true, offer: true, favouriteOffer: true },
                take: 5,
            })
            .then((list) =>
                list.map((ask) => {
                    return {
                        ...ask,
                        status: getAskStatus(
                            ask.deadlineAt,
                            ask.acceptedDeadlineAt,
                            Boolean(ask.offer.length),
                            Boolean(ask.favouriteOffer),
                        ),
                    }
                }),
            )
    }),
    topEarners: t.procedure.query(async ({ ctx }) => {
        const topEarners = await prisma.user.findMany({
            where: { offers: { some: { ask: SETTLED_SELECT } } },
            include: { offers: { include: { ask: { include: { bumps: true } } } } },
        })

        return topEarners.map((user) => {
            const relevantOffers = user.offers.filter((offer) => offer.favouritedById)
            return {
                ...user,
                totalEarned: relevantOffers
                    .map((offer) => offer?.ask?.bumps.reduce((acc, bump) => acc + bump.amount, 0))
                    .reduce((acc, bump) => (acc ?? 0) + (bump ?? 0), 0),
            }
        })
    }),
    topSpenders: t.procedure.query(async ({ ctx }) => {
        const test = await prisma.user.findMany({
            where: { asks: { some: SETTLED_SELECT } },
            include: { offers: true, bumps: true },
        })
        return test
            .map((user) => {
                return {
                    userName: user.userName,
                    publicKey: user.publicKey,
                    createdAt: user.createdAt,
                    totalEarned: user.bumps.reduce((acc, offer) => acc + offer.amount, 0),
                }
            })
            .sort((a, b) => b.totalEarned - a.totalEarned)
    }),
    biggestGrossingAsks: t.procedure.query(async ({ ctx }) => {
        const test = await prisma.ask.findMany({
            where: SETTLED_SELECT,
            include: { bumps: true, askContext: true },
        })
        return test
            .map((ask) => {
                return {
                    ...ask,
                    name: ask?.askContext?.title,
                    grossed: ask.bumps.reduce((acc, offer) => acc + offer.amount, 0),
                }
            })
            .sort((a, b) => b.grossed - a.grossed)
    }),
    myStats: t.procedure.use(isAuthed).query(async ({ ctx }) => {
        const user = await prisma.user.findUnique({
            where: { id: ctx.user.id },
            include: {
                asks: { where: SETTLED_SELECT },
                offers: {
                    where: { ask: SETTLED_SELECT },
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
                    (acc, offer) => acc + (offer?.ask?.bumps.reduce((acc, offer) => acc + offer.amount ?? 0, 0) ?? 0),
                    0,
                ),
            totalSpent: user?.bumps.reduce((acc, offer) => acc + offer.amount, 0),
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
            totalEarned: bumps.reduce((acc, offer) => acc + offer.amount, 0),
        }
    }),
})
