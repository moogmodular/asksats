import { AskKind, PrismaClient } from '@prisma/client'
import { randomBytes } from 'crypto'
import { faker } from '@faker-js/faker'
import { add, sub } from 'date-fns'
import secp256k1 from 'secp256k1'
import { adjectives, animals, colors, Config, uniqueNamesGenerator } from 'unique-names-generator'
import { markdown } from './seed/markdown'
const bip39 = require('bip39')
import { wallets } from './seed/wallets'
const BitcoinWIF = require('bitcoin-wif')

const prisma = new PrismaClient()

const slugify = (title: string) => {
    const a = 'àáäâãåèéëêìíïîòóöôùúüûñçßÿœæŕśńṕẃǵǹḿǘẍźḧ·/_,:;'
    const b = 'aaaaaaeeeeiiiioooouuuuncsyoarsnpwgnmuxzh------'
    const p = new RegExp(a.split('').join('|'), 'g')
    return (
        title
            .toString()
            .toLowerCase()
            .replace(/\s+/g, '-') // Replace spaces with -
            .replace(p, (c) => b.charAt(a.indexOf(c))) // Replace special characters in a with b
            .replace(/&/g, '-and-') // Replace & with ‘and’
            .replace(/[^\w-]+/g, '') // Remove all non-word characters such as spaces or tabs
            .replace(/--+/g, '-') // Replace multiple — with single -
            .replace(/^-+/, '') // Trim — from start of text
            .replace(/-+$/, '') +
        '-' +
        Date.now() +
        Math.floor(Math.random() * 1000)
    ) // Trim — from end of text
}

export const k1 = () => {
    return randomBytes(32).toString('hex')
}

export const getSigAndKey = (cb: { k1: string }, privateKey: string) => {
    const { publicKey, exportedSignature } = signMessageWithWallet(cb.k1, privateKey)
    const sig = Buffer.from(exportedSignature).toString('hex')
    const key = Buffer.from(publicKey).toString('hex')
    return { sig, key }
}

const signMessageWithWallet = (message: string, privateKey: string) => {
    const msg = Buffer.from(message, 'hex')
    const privateBuffer = Buffer.from(privateKey, 'hex')

    const publicKey = secp256k1.publicKeyCreate(privateBuffer)
    const signature = secp256k1.ecdsaSign(msg, privateBuffer).signature
    const exportedSignature = secp256k1.signatureExport(signature)

    return {
        publicKey,
        exportedSignature,
    }
}

const defaultUserData = async () => {
    const customConfig: Config = {
        dictionaries: [adjectives, colors, animals],
        separator: '',
        length: 3,
        style: 'capital',
    }
    const randomName: string = uniqueNamesGenerator(customConfig)

    // const response = await fetch('https://picsum.photos/250')
    // const image = await fetch(response.url)
    //     .then((r) => r.arrayBuffer())
    //     .then((b) => Buffer.from(b).toString('base64'))
    return {
        randomName,
        image: 'data:image/jpeg;base64,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',
    }
}

const getRandomAskKind = () => {
    const kinds = ['PUBLIC', 'PRIVATE', 'BUMP_PUBLIC']
    return kinds[randomIntFromTo(0, 2)] as AskKind
}

const randomDate = (start: Date, end: Date) =>
    new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))

const randomIntFromTo = (from: number, to: number) => Math.floor(Math.random() * (to - from + 1) + from)

function getIdOfOtherUser(index: number, newUsers: Awaited<any>[]) {
    return index !== 0 ? newUsers?.[index - 1]?.id ?? '' : newUsers?.[newUsers.length - 1]?.id ?? ''
}

async function main() {
    await Promise.all([
        await prisma.ask.deleteMany(),
        await prisma.tag.deleteMany(),
        await prisma.askContext.deleteMany(),
        await prisma.offer.deleteMany(),
        await prisma.offerContext.deleteMany(),
        await prisma.offerFilePair.deleteMany(),
        await prisma.file.deleteMany(),
        await prisma.user.deleteMany(),
        await prisma.bump.deleteMany(),
        await prisma.transaction.deleteMany(),
    ])

    const userNumber = [1, 2, 3, 4]

    const btcWIF = new BitcoinWIF('testnet')

    await Promise.all(
        ['nsfw', 'photo', 'sketch', 'logo', 'drawing', 'hi-rez', 'color-palette'].map(async (tagName) => {
            return await prisma.tag.create({ data: { name: tagName } })
        }),
    )

    const newUsers = await Promise.all(
        wallets.map(async (wallet, index) => {
            const seed = await bip39.mnemonicToSeed(wallet.mnemonic).then((value: Buffer) => value.toString('hex'))
            const privateKey = btcWIF.privateKey(seed)
            const { randomName, image } = await defaultUserData()
            const { sig, key } = getSigAndKey({ k1: k1() }, privateKey)
            return await prisma.user.create({
                data: {
                    profileImage: image,
                    userName: randomName,
                    publicKey: key,
                    excludedTags: { connectOrCreate: { where: { name: 'nsfw' }, create: { name: 'nsfw' } } },
                    bio: faker.lorem.paragraph(3),
                },
            })
        }),
    )

    const freshTags = await prisma.tag.findMany()

    await Promise.all(
        newUsers.map(async (user, index) => {
            const transactionIn = await prisma.transaction.create({
                data: {
                    user: {
                        connect: {
                            id: user.id,
                        },
                    },
                    k1Hash: k1(),
                    mSatsSettled: 200000000,
                    lndId: k1(),
                    mSatsTarget: 200000000,
                    bolt11: 'bolt11',
                    maxAgeSeconds: 3600,
                    hash: k1(),
                    transactionKind: 'INVOICE',
                    description: 'description',
                    transactionStatus: 'SETTLED',
                },
            })

            const transactionIn2 = await prisma.transaction.create({
                data: {
                    user: {
                        connect: {
                            id: user.id,
                        },
                    },
                    k1Hash: k1(),
                    mSatsSettled: 300000000,
                    lndId: k1(),
                    mSatsTarget: 300000000,
                    bolt11: 'bolt11',
                    maxAgeSeconds: 3600,
                    hash: k1(),
                    transactionKind: 'INVOICE',
                    description: 'description',
                    transactionStatus: 'SETTLED',
                },
            })

            const transactionOut = await prisma.transaction.create({
                data: {
                    user: {
                        connect: {
                            id: user.id,
                        },
                    },
                    k1Hash: k1(),
                    mSatsSettled: 150000000,
                    lndId: k1(),
                    mSatsTarget: 150000000,
                    bolt11: 'bolt11',
                    maxAgeSeconds: 3600,
                    hash: k1(),
                    transactionKind: 'WITHDRAWAL',
                    description: 'description',
                    transactionStatus: 'SETTLED',
                },
            })
        }),
    )

    newUsers.map(async (user, index) => {
        const titleExpired = 'This is an Expired Ask Title'
        const amountExpired = 15000
        const theNowExpired = new Date()
        const createdInThePastExpired = sub(theNowExpired, {
            days: 9,
            hours: randomIntFromTo(1, 10),
            minutes: randomIntFromTo(1, 60),
        })
        const expiredInThePastExpired = add(createdInThePastExpired, { days: 1 })
        const acceptedInThePastExpired = add(expiredInThePastExpired, { hours: 3 })

        const expiredAsk = await prisma.ask.create({
            data: {
                user: { connect: { id: user.id } },
                tags: {
                    createMany: {
                        data: [
                            { tagId: freshTags[0]!.id },
                            { tagId: freshTags[2]!.id },
                            { tagId: freshTags[4]!.id },
                            { tagId: freshTags[6]!.id },
                        ],
                    },
                },
                askContext: {
                    create: {
                        title: titleExpired,
                        content: markdown[0]!.content!,
                        headerImage: {
                            create: {
                                s3Key: 'test/testimage.png',
                            },
                        },
                        slug: slugify(titleExpired),
                    },
                },
                createdAt: createdInThePastExpired,
                deadlineAt: expiredInThePastExpired,
                acceptedDeadlineAt: acceptedInThePastExpired,
                askKind: getRandomAskKind(),
                bumps: {
                    create: {
                        bidder: { connect: { id: user.id } },
                        amount: amountExpired,
                    },
                },
            },
        })

        const titleActive = 'This is an Active Title Ask' + index
        const amountActive = 25000
        const theNowActive = new Date()
        const createdInThePastActive = sub(theNowActive, {
            days: 2,
            hours: randomIntFromTo(1, 10),
            minutes: randomIntFromTo(1, 60),
        })
        const expiredInThePastActive = add(createdInThePastActive, { days: 6 })
        const acceptedInThePastActive = add(expiredInThePastActive, { hours: 3 })

        const activeAsk = await prisma.ask.create({
            data: {
                user: { connect: { id: user.id } },
                tags: {
                    createMany: {
                        data: [
                            { tagId: freshTags[1]!.id },
                            { tagId: freshTags[3]!.id },
                            { tagId: freshTags[5]!.id },
                            { tagId: freshTags[0]!.id },
                        ],
                    },
                },
                askContext: {
                    create: {
                        title: titleActive,
                        content: markdown[0]!.content!,
                        headerImage: {
                            create: {
                                s3Key: 'test/testimage.png',
                            },
                        },
                        slug: slugify(titleActive),
                    },
                },
                createdAt: createdInThePastActive,
                deadlineAt: expiredInThePastActive,
                acceptedDeadlineAt: acceptedInThePastActive,
                askKind: getRandomAskKind(),
                bumps: {
                    create: {
                        bidder: { connect: { id: user.id } },
                        amount: amountActive,
                    },
                },
            },
        })

        const titlePending = 'This is a Pending Acceptance Ask'
        const amountPending = 6000
        const theNowPending = new Date()
        const createdInThePastPending = sub(theNowPending, {
            days: 2,
            minutes: randomIntFromTo(1, 60),
        })
        const expiredInThePastPending = add(createdInThePastPending, { days: 2 })
        const acceptedInThePastPending = add(expiredInThePastPending, { hours: 3 })

        const pendingAsk = await prisma.ask.create({
            data: {
                user: { connect: { id: user.id } },
                tags: {
                    createMany: {
                        data: [
                            { tagId: freshTags[2]!.id },
                            { tagId: freshTags[4]!.id },
                            { tagId: freshTags[6]!.id },
                            { tagId: freshTags[1]!.id },
                        ],
                    },
                },
                askContext: {
                    create: {
                        title: titlePending,
                        content: markdown[0]!.content!,
                        headerImage: {
                            create: {
                                s3Key: 'test/testimage.png',
                            },
                        },
                        slug: slugify(titlePending),
                    },
                },
                createdAt: createdInThePastPending,
                deadlineAt: expiredInThePastPending,
                acceptedDeadlineAt: acceptedInThePastPending,
                askKind: getRandomAskKind(),
                bumps: {
                    create: {
                        bidder: { connect: { id: user.id } },
                        amount: amountPending,
                    },
                },
                offer: {
                    create: {
                        author: {
                            connect: {
                                id: getIdOfOtherUser(index, newUsers),
                            },
                        },
                        offerContext: {
                            create: {
                                content: markdown[0]!.content!,
                                filePairs: {
                                    create: {
                                        fileName: 'testfile.txt',
                                        user: {
                                            connect: {
                                                id: getIdOfOtherUser(index, newUsers),
                                            },
                                        },
                                        obscureFile: {
                                            create: {
                                                s3Key: 'test/testimage.png',
                                            },
                                        },
                                        offerFile: {
                                            create: {
                                                s3Key: 'test/testimage.png',
                                            },
                                        },
                                        obscureMethod: 'BLUR',
                                    },
                                },
                            },
                        },
                    },
                },
            },
        })

        const titleSettled = 'This is a Settled Ask'
        const amountSettled = 3000
        const theNowSettled = new Date()
        const createdInThePastSettled = sub(theNowSettled, {
            days: 2,
            minutes: randomIntFromTo(1, 60),
        })
        const expiredInThePastSettled = add(createdInThePastSettled, { days: 1, hours: 21 })
        const acceptedInThePastSettled = add(theNowPending, { hours: 3 })

        const newOffer1 = await prisma.offer.create({
            data: {
                author: {
                    connect: {
                        id: getIdOfOtherUser(index, newUsers),
                    },
                },
                offerContext: {
                    create: {
                        content: markdown[0]!.content!,

                        filePairs: {
                            create: {
                                user: {
                                    connect: {
                                        id: getIdOfOtherUser(index, newUsers),
                                    },
                                },
                                fileName: 'testfile.txt',
                                obscureFile: {
                                    create: {
                                        s3Key: 'test/testimage.png',
                                    },
                                },
                                offerFile: {
                                    create: {
                                        s3Key: 'test/testimage.png',
                                    },
                                },
                                obscureMethod: 'BLUR',
                            },
                        },
                    },
                },
            },
        })

        const newOffer2 = await prisma.offer.create({
            data: {
                author: {
                    connect: {
                        id: getIdOfOtherUser(index, newUsers),
                    },
                },
                offerContext: {
                    create: {
                        content: markdown[0]!.content!,

                        filePairs: {
                            create: {
                                user: {
                                    connect: {
                                        id: getIdOfOtherUser(index, newUsers),
                                    },
                                },
                                fileName: 'testfile.txt',
                                obscureFile: {
                                    create: {
                                        s3Key: 'test/testimage.png',
                                    },
                                },
                                offerFile: {
                                    create: {
                                        s3Key: 'test/testimage.png',
                                    },
                                },
                                obscureMethod: 'BLUR',
                            },
                        },
                    },
                },
            },
        })

        const newOffer3 = await prisma.offer.create({
            data: {
                author: {
                    connect: {
                        id: getIdOfOtherUser(index, newUsers),
                    },
                },
                offerContext: {
                    create: {
                        content: markdown[0]!.content!,
                        filePairs: {
                            create: {
                                user: {
                                    connect: {
                                        id: getIdOfOtherUser(index, newUsers),
                                    },
                                },
                                fileName: 'testfile.txt',
                                obscureFile: {
                                    create: {
                                        s3Key: 'test/testimage.png',
                                    },
                                },
                                offerFile: {
                                    create: {
                                        s3Key: 'test/testimage.png',
                                    },
                                },
                                obscureMethod: 'BLUR',
                            },
                        },
                    },
                },
            },
        })

        const settledAsk = await prisma.ask.create({
            data: {
                user: { connect: { id: user.id } },
                tags: {
                    createMany: {
                        data: [
                            { tagId: freshTags[3]!.id },
                            { tagId: freshTags[5]!.id },
                            { tagId: freshTags[0]!.id },
                            { tagId: freshTags[2]!.id },
                        ],
                    },
                },
                askContext: {
                    create: {
                        title: titleSettled,
                        content: markdown[0]!.content!,
                        headerImage: {
                            create: {
                                s3Key: 'test/testimage.png',
                            },
                        },
                        slug: slugify(titleSettled),
                    },
                },
                createdAt: createdInThePastSettled,
                deadlineAt: expiredInThePastSettled,
                acceptedDeadlineAt: acceptedInThePastSettled,
                askKind: getRandomAskKind(),
                bumps: {
                    create: {
                        bidder: { connect: { id: user.id } },
                        amount: amountSettled,
                    },
                },
                offer: {
                    connect: [{ id: newOffer1.id }, { id: newOffer2.id }, { id: newOffer3.id }],
                },
                favouriteOffer: {
                    connect: { id: newOffer1.id },
                },
            },
        })
    })
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
