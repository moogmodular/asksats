import { t } from '../trpc'
import { prisma } from '~/server/prisma'
import { userBalance } from '~/server/service/accounting'
import { isAuthed } from '~/server/middlewares/authed'
import { z } from 'zod'

export const accountingRouter = t.router({
    myBalance: t.procedure.use(isAuthed).query(async ({ ctx }) => {
        return await userBalance(prisma, ctx?.user?.id)
    }),
    transactions: t.procedure.use(isAuthed).query(async ({ ctx }) => {
        return await prisma.transaction.findMany({
            where: { userId: ctx?.user?.id },
            orderBy: { createdAt: 'desc' },
        })
    }),
    balanceForUser: t.procedure
        .use(isAuthed)
        .input(z.object({ userId: z.string() }))
        .query(async ({ ctx, input }) => {
            const balance = await userBalance(prisma, input.userId)
            return balance
        }),
})
