import { AskKind, PrismaClient } from '@prisma/client'
import { differenceInSeconds, sub } from 'date-fns'
import {
    BUMP_PUBLIC_MIN_BUMP_FACTOR,
    GLOBAL_MIN_BUMP_SATS,
    INVOICE_LIMIT,
    MSATS_UNIT_FACTOR,
    TRANSACTION_FREQUENCY_SECONDS_LIMIT_IN,
    TRANSACTION_FREQUENCY_SECONDS_LIMIT_OUT,
    TRANSACTION_MAX_AGE,
    WITHDRAWAL_LIMIT,
} from '~/server/service/constants'
import { prisma } from '~/server/prisma'

export const userBalance = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    })
    return {
        availableBalance: Math.floor((user?.balance ?? 0) / MSATS_UNIT_FACTOR),
        lockedBalance: Math.floor((user?.lockedBalance ?? 0) / MSATS_UNIT_FACTOR),
    }
}

export const belowWithdrawalLimit = async (prisma: PrismaClient, userId: string) => {
    const count = await prisma.transaction.count({
        where: {
            userId,
            transactionKind: 'WITHDRAWAL',
            transactionStatus: { not: 'SETTLED' },
            createdAt: { gt: sub(new Date(), { seconds: TRANSACTION_MAX_AGE }) },
        },
    })

    return count < WITHDRAWAL_LIMIT
}

export const belowInvoiceLimit = async (prisma: PrismaClient, userId: string) => {
    const count = await prisma.transaction.count({
        where: {
            userId,
            transactionKind: 'INVOICE',
            transactionStatus: { not: 'SETTLED' },
            createdAt: { gt: sub(new Date(), { seconds: TRANSACTION_MAX_AGE }) },
        },
    })

    return count < INVOICE_LIMIT
}

export const recentSettledTransaction = async (
    prisma: PrismaClient,
    userId: string,
    transactionKind: 'INVOICE' | 'WITHDRAWAL',
) => {
    return prisma.transaction
        .findMany({
            where: {
                userId,
                transactionKind: transactionKind,
                transactionStatus: 'SETTLED',
            },
            orderBy: {
                createdAt: 'desc',
            },
        })
        .then((transactions) => {
            const lastTransaction = transactions[0]
            return lastTransaction
                ? differenceInSeconds(new Date(), lastTransaction.createdAt) <
                      (transactionKind === 'WITHDRAWAL'
                          ? TRANSACTION_FREQUENCY_SECONDS_LIMIT_OUT
                          : TRANSACTION_FREQUENCY_SECONDS_LIMIT_IN)
                : false
        })
}

export const minBumpForAsk = (sum: number, askKind: AskKind) => {
    return Math.floor(
        {
            PUBLIC: GLOBAL_MIN_BUMP_SATS,
            PRIVATE: GLOBAL_MIN_BUMP_SATS,
            BUMP_PUBLIC: sum * BUMP_PUBLIC_MIN_BUMP_FACTOR,
        }[askKind],
    )
}
