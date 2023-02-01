import { t } from '../trpc'
import { prisma } from '~/server/prisma'
import { isAuthed } from '~/server/middlewares/authed'
import { createBumpForAsk } from '~/components/ask/AskPreview'
import { minBumpForAsk, userBalance } from '~/server/service/accounting'
import { TRPCError } from '@trpc/server'
import { doBumpBalanceTransaction } from '~/server/service/finalise'
import { MSATS_UNIT_FACTOR } from '~/server/service/constants'

export const bumpRouter = t.router({
    createForAsk: t.procedure
        .use(isAuthed)
        .input(createBumpForAsk)
        .mutation(async ({ ctx, input }) => {
            const { availableBalance } = await userBalance(ctx?.user?.id)
            if (availableBalance < input.amount) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: `Insufficient balance. Available: ${availableBalance} sats`,
                })
            }
            const ask = await prisma.ask.findUnique({ where: { id: input.askId }, include: { bumps: true } })
            if (ask?.askKind === 'PRIVATE') {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: `Cannot bump private asks`,
                })
            }

            const bumpSum = ask?.bumps.reduce((acc, bump) => acc + bump.amount / MSATS_UNIT_FACTOR, 0)
            const minBump = minBumpForAsk(bumpSum ?? 100, ask?.askKind ?? 'PUBLIC')

            if (input.amount < minBump) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: `Bump amount must be at least ${minBump} sats`,
                })
            }

            return await doBumpBalanceTransaction(input.askId, ctx.user.id, input.amount)
        }),
    myBumps: t.procedure.use(isAuthed).query(async ({ ctx, input }) => {
        return await prisma.bump.findMany({
            where: { bidderId: ctx.user.id },
            include: { ask: { include: { askContext: true } } },
        })
    }),
})
