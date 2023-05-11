import { t } from '../trpc'
import { prisma } from '~/server/prisma'
import { TRPCError } from '@trpc/server'
import { encodedUrl, getK1Hash, k1 } from '~/server/service/lnurl'
import { z } from 'zod'
import { decodePaymentRequest, subscribeToPayViaRequest } from 'lightning'
import { lnd } from '~/server/service/lnd'
import {
    MIN_WITHDRAWAL_FLOOR,
    MSATS_UNIT_FACTOR,
    SINGLE_TRANSACTION_CAP,
    TRANSACTION_MAX_AGE,
} from '~/server/service/constants'
import {
    belowWithdrawalLimit,
    recentSettledTransaction,
    recentWithdrawal,
    userBalance,
} from '~/server/service/accounting'
import { isAuthed } from '~/server/middlewares/authed'
import { doWithdrawalBalanceTransaction } from '~/server/service/finalise'

export const withdrawalRouter = t.router({
    getWithdrawalUrl: t.procedure.use(isAuthed).query(async ({ ctx }) => {
        if (await recentWithdrawal(prisma, ctx.user.id)) {
            throw new TRPCError({ code: 'FORBIDDEN', message: 'last withdrawal too recent' })
        }

        const secret = k1()
        const currentBalance = await userBalance(ctx.user.id)
        const maxAmount = Math.floor(Math.min(currentBalance.availableBalance, SINGLE_TRANSACTION_CAP))

        const encoded = encodedUrl(`${process.env.LN_WITH_CREATE_URL}`, 'withdrawRequest', secret)

        const k1Hash = getK1Hash(secret)

        await prisma.transaction.create({
            data: {
                k1Hash: k1Hash,
                userId: ctx.user.id,
                transactionStatus: 'PENDING',
                transactionKind: 'WITHDRAWAL',
                maxAgeSeconds: TRANSACTION_MAX_AGE,
                mSatsTarget: maxAmount * MSATS_UNIT_FACTOR,
                bolt11: encoded,
                description: '',
                lndId: k1Hash,
                hash: k1Hash,
            },
        })

        return { secret, encoded }
    }),
    createWithdrawal: t.procedure
        .meta({ openapi: { method: 'GET', path: '/create-withdrawal' } })
        .input(
            z.object({
                k1: z.string(),
            }),
        )
        .output(z.any())
        .query(async ({ ctx, input }) => {
            const { k1 } = input
            let reason
            try {
                const lnWithdrawal = await prisma.transaction.findFirst({
                    where: {
                        k1Hash: getK1Hash(k1),
                        createdAt: {
                            gt: new Date(new Date().setHours(new Date().getHours() - 1)),
                        },
                    },
                })
                if (lnWithdrawal) {
                    const user = await prisma.user.findUnique({
                        where: { id: lnWithdrawal.userId! },
                        include: { transaction: true },
                    })
                    const maxAmount = user ? await userBalance(user?.id).then((balance) => balance.availableBalance) : 0
                    const cappedAmount = Math.min(maxAmount, SINGLE_TRANSACTION_CAP)
                    if (maxAmount) {
                        const lnUrlWithdrawal = {
                            tag: 'withdrawRequest',
                            callback: `${process.env.LN_WITH_DO_URL}`,
                            k1: k1,
                            defaultDescription: `Withdrawal for @${user?.userName} on ${
                                process.env.DOMAIN
                            } for maximum ${maxAmount - 1}`,
                            minWithdrawable: MIN_WITHDRAWAL_FLOOR * MSATS_UNIT_FACTOR,
                            maxWithdrawable: cappedAmount * MSATS_UNIT_FACTOR - 1000,
                        }
                        await prisma.transaction.update({
                            where: { id: lnWithdrawal.id },
                            data: {
                                description: lnUrlWithdrawal.defaultDescription,
                            },
                        })
                        return lnUrlWithdrawal
                    } else {
                        reason = 'user not found'
                    }
                } else {
                    reason = 'withdrawal not found'
                }
            } catch (error) {
                reason = 'internal server error'
            }

            throw new TRPCError({ code: 'BAD_REQUEST', message: reason })
        }),
    doWithdrawal: t.procedure
        .meta({ openapi: { method: 'GET', path: '/do-withdrawal' } })
        .input(
            z.object({
                pr: z.string(),
                k1: z.string(),
            }),
        )
        .output(z.any())
        .query(async ({ ctx, input }) => {
            const { k1, pr } = input
            const lnWithdrawal = await prisma.transaction.findUnique({ where: { k1Hash: getK1Hash(k1) } })
            if (!lnWithdrawal) {
                throw new TRPCError({ code: 'BAD_REQUEST', message: 'invalid k1' })
            }
            const user = await prisma.user.findUnique({ where: { id: lnWithdrawal.userId ?? '' } })
            if (!user) {
                throw new TRPCError({ code: 'BAD_REQUEST', message: 'user not found' })
            }

            if (!(await belowWithdrawalLimit(prisma, user.id))) {
                throw new TRPCError({ code: 'FORBIDDEN', message: 'too many pending invoices' })
            }

            if (await recentSettledTransaction(prisma, user.id, 'WITHDRAWAL')) {
                throw new TRPCError({ code: 'FORBIDDEN', message: 'last withdrawal too recent' })
            }

            let decoded: any
            try {
                decoded = await decodePaymentRequest({ lnd, request: pr })
            } catch (error) {
                throw new TRPCError({ code: 'UNAUTHORIZED', message: 'could not decode invoice' })
            }

            if (decoded.mtokens > SINGLE_TRANSACTION_CAP * MSATS_UNIT_FACTOR) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: `you can only withdraw up to ${SINGLE_TRANSACTION_CAP} in a single transaction`,
                })
            }

            if (!decoded.mtokens || Number(decoded.mtokens) <= 0) {
                throw new TRPCError({ code: 'BAD_REQUEST', message: 'your invoice must specify an amount' })
            }

            const maxAmount = user ? await userBalance(user?.id).then((balance) => balance.availableBalance) : 0

            if (!maxAmount) {
                return new TRPCError({ code: 'BAD_REQUEST', message: 'user not found' })
            }

            if (decoded.mtokens > maxAmount * MSATS_UNIT_FACTOR) {
                return { status: 'ERROR', reason: 'insufficient balance' }
            }

            const sub = await subscribeToPayViaRequest({
                lnd,
                request: pr,
                max_fee: Number(10),
                pathfinding_timeout: 60000,
            })

            return await new Promise((resolve, reject) => {
                sub.once('confirmed', async (payment) => {
                    console.log('payment', payment)
                    await doWithdrawalBalanceTransaction(k1, payment.mtokens, payment.fee_mtokens)
                    resolve({ status: 'OK' })
                })

                sub.once('failed', async (payment) => {
                    console.log('failed payment', payment)
                    resolve({ status: 'ERROR', reason: 'failed payment' })
                })
            })
        }),
    wasWithdrawalSettled: t.procedure
        .use(isAuthed)
        .input(
            z.object({
                k1: z.string(),
            }),
        )
        .query(async ({ ctx, input }) => {
            const lnWithdrawal = await prisma.transaction.findUnique({
                where: { k1Hash: getK1Hash(input.k1) },
                select: { transactionStatus: true },
            })

            if (!lnWithdrawal) {
                return { transactionStatus: 'CREATION_PENDING' }
            } else {
                return { transactionStatus: lnWithdrawal.transactionStatus }
            }
        }),
})
