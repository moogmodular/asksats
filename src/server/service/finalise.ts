import { prisma } from '~/server/prisma'
import { MSATS_UNIT_FACTOR, PAYOUT_FACTOR } from '~/server/service/constants'
import { TRPCError } from '@trpc/server'
import { getK1Hash } from '~/server/service/lnurl'
import { slugify } from '~/utils/string'
import { AskKind } from '@prisma/client'

export const doSettleAskBalanceTransaction = async (askId: string, offerId: string, offererId: string) =>
    await prisma.$transaction(async (tx) => {
        const ask = await tx.ask.update({
            where: {
                id: askId,
            },
            data: {
                askStatus: 'SETTLED',
                settledForOffer: {
                    connect: {
                        id: offerId,
                    },
                },
            },
            include: {
                bumps: true,
            },
        })

        const bounty = (ask?.bumps?.reduce((acc, bump) => acc + bump.amount, 0) || 0) * PAYOUT_FACTOR

        const payers = await Promise.all(
            ask?.bumps?.map(async (bump) => {
                return await tx.user.update({
                    where: { id: bump.bidderId ?? '' },
                    data: {
                        lockedBalance: {
                            decrement: bump.amount,
                        },
                    },
                })
            }),
        )

        const recipient = await tx.user.update({
            where: { id: offererId },
            data: {
                balance: {
                    increment: bounty,
                },
            },
        })

        return { ask, bounty, payers, recipient }
    })

export const doCanceleAskBalanceTransaction = async (askId: string) =>
    await prisma.$transaction(async (tx) => {
        const ask = await tx.ask.update({
            where: { id: askId },
            data: {
                askStatus: 'CANCELED',
            },
            include: {
                bumps: true,
            },
        })

        const payers = await Promise.all(
            ask?.bumps?.map(async (bump) => {
                return await tx.user.update({
                    where: { id: bump.bidderId ?? '' },
                    data: {
                        lockedBalance: {
                            decrement: bump.amount,
                        },
                        balance: {
                            increment: bump.amount,
                        },
                    },
                })
            }),
        )

        return { ask, payers }
    })

export const doCreateAskBalanceTransaction = async (
    askKind: AskKind,
    space: string,
    tags: { id: string }[],
    userId: string,
    amount: number,
    title: string,
    content: string,
    headerImageId?: string,
) =>
    await prisma.$transaction(async (tx) => {
        const ask = await tx.ask.create({
            data: {
                user: { connect: { id: userId } },
                askKind: askKind,
                space: {
                    connect: {
                        name: space,
                    },
                },
                askStatus: 'OPEN',
                tags: {
                    createMany: {
                        data: tags.map((tag) => {
                            return {
                                tagId: tag!.id,
                            }
                        }),
                    },
                },
                bumps: {
                    create: {
                        bidder: { connect: { id: userId } },
                        amount: amount * MSATS_UNIT_FACTOR,
                    },
                },
                askContext: {
                    create: {
                        title: title,
                        slug: slugify(title),
                        content: content,
                        headerImage: headerImageId ? { connect: { id: headerImageId } } : undefined,
                    },
                },
            },
            include: {
                askContext: true,
            },
        })

        const bumper = await tx.user.update({
            where: { id: userId },
            data: {
                balance: {
                    decrement: amount * MSATS_UNIT_FACTOR,
                },
                lockedBalance: {
                    increment: amount * MSATS_UNIT_FACTOR,
                },
            },
        })

        return { ask, bumper }
    })

export const doBumpBalanceTransaction = async (askId: string, userId: string, amount: number) =>
    await prisma.$transaction(async (tx) => {
        const ask = await tx.ask.update({
            where: { id: askId },
            data: {
                bumps: {
                    create: {
                        bidder: { connect: { id: userId } },
                        amount: amount * MSATS_UNIT_FACTOR,
                    },
                },
            },
        })

        if (!ask) {
            throw new TRPCError({ code: 'BAD_REQUEST', message: 'bump failed' })
        }

        const bumper = await tx.user.update({
            where: { id: userId },
            data: {
                balance: {
                    decrement: amount * MSATS_UNIT_FACTOR,
                },
                lockedBalance: {
                    increment: amount * MSATS_UNIT_FACTOR,
                },
            },
        })

        return { ask, bumper }
    })

export const doInvoiceBalanceTransaction = async (transactionId: string, targetAmountMSats: number) =>
    await prisma.$transaction(async (tx) => {
        const transaction = await tx.transaction.update({
            where: { id: transactionId },
            data: {
                mSatsSettled: targetAmountMSats,
                confirmedAt: new Date(),
                transactionStatus: 'SETTLED',
            },
        })

        if (!transaction || !transaction.userId || !transaction.mSatsSettled) {
            throw new TRPCError({ code: 'BAD_REQUEST', message: 'transaction failed' })
        }

        const recipient = await tx.user.update({
            where: { id: transaction.userId },
            data: {
                balance: {
                    increment: transaction.mSatsSettled,
                },
            },
        })

        return { recipient, transaction }
    })

export const doWithdrawalBalanceTransaction = async (k1: string, targetAmountMSats: string, feeMSats: string) =>
    await prisma.$transaction(async (tx) => {
        const transaction = await tx.transaction.update({
            where: { k1Hash: getK1Hash(k1) },
            data: {
                transactionStatus: 'SETTLED',
                mSatsTarget: parseInt(targetAmountMSats),
                mSatsSettled: parseInt(targetAmountMSats) - parseInt(feeMSats),
                confirmedAt: new Date(),
            },
        })

        if (!transaction || !transaction.userId || !transaction.mSatsSettled) {
            throw new TRPCError({ code: 'BAD_REQUEST', message: 'transaction failed' })
        }

        const withdrawnFrom = await tx.user.update({
            where: { id: transaction.userId },
            data: {
                balance: {
                    decrement: transaction.mSatsSettled,
                },
            },
        })

        return { withdrawnFrom, transaction }
    })
