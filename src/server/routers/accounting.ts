import { t } from '../trpc'
import { prisma } from '~/server/prisma'
import { userBalance } from '~/server/service/accounting'
import { isAuthed } from '~/server/middlewares/authed'
import { z } from 'zod'
import { MSATS_UNIT_FACTOR } from '~/server/service/constants'

export const accountingRouter = t.router({
    myBalance: t.procedure.use(isAuthed).query(async ({ ctx }) => {
        return await userBalance(ctx?.user?.id)
    }),
    transactions: t.procedure.use(isAuthed).query(async ({ ctx }) => {
        return await prisma.transaction
            .findMany({
                where: { userId: ctx?.user?.id },
                orderBy: { createdAt: 'desc' },
                select: {
                    mSatsSettled: true,
                    transactionStatus: true,
                    transactionKind: true,
                    createdAt: true,
                },
            })
            .then((transactions) => {
                return transactions.map((transaction) => {
                    return {
                        ...transaction,
                        mSatsSettled: transaction?.mSatsSettled ?? 0 / MSATS_UNIT_FACTOR,
                    }
                })
            })
    }),
    balanceForUser: t.procedure
        .use(isAuthed)
        .input(z.object({ userId: z.string() }))
        .query(async ({ ctx, input }) => {
            const balance = await userBalance(input.userId)
            return balance
        }),
})
