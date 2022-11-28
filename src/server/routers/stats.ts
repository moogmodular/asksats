import { t } from '../trpc'
import { prisma } from '~/server/prisma'
import { ACTIVE_SELECT, SETTLED_SELECT } from '~/server/service/selects'

export const statsRouter = t.router({
    endingSoon: t.procedure.query(async ({ ctx }) => {
        return await prisma.ask.findMany({
            where: ACTIVE_SELECT,
            orderBy: { deadlineAt: 'asc' },
            include: { askContext: true },
            take: 5,
        })
    }),
    topEarners: t.procedure.query(async ({ ctx }) => {
        const test = await prisma.user.findMany({
            where: { asks: { some: SETTLED_SELECT } },
            include: { offers: true, bumps: true },
        })
        return test
            .map((user) => {
                return {
                    userName: user.userName,
                    publicKey: user.publicKey,
                    totalEarned: user.bumps.reduce((acc, offer) => acc + offer.amount, 0),
                }
            })
            .sort((a, b) => b.totalEarned - a.totalEarned)
    }),
    topSpenders: t.procedure.query(async ({ ctx }) => {
        const test = await prisma.user.findMany({
            where: { offers: { some: { ask: SETTLED_SELECT } } },
            include: { offers: true, bumps: true },
        })
        return test
            .map((user) => {
                return {
                    userName: user.userName,
                    publicKey: user.publicKey,
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
})
