import { t } from '../trpc'
import { prisma } from '~/server/prisma'
import { isAuthed } from '~/server/middlewares/authed'
import { createOfferForAskInput } from '~/components/offer/CreateOffer'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { s3Client } from '~/server/service/s3-client'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import sharp from 'sharp'
import { createPresignedPost } from '@aws-sdk/s3-presigned-post'
import FormData from 'form-data'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import * as fs from 'fs'
import path from 'path'
import { getAskStatus } from '~/server/service/ask'

export const offerRouter = t.router({
    create: t.procedure
        .use(isAuthed)
        .input(createOfferForAskInput)
        .mutation(async ({ ctx, input }) => {
            const ask = await prisma.ask
                .findUnique({
                    where: { id: input.askId },
                    include: {
                        askContext: { include: { headerImage: true } },
                        bumps: true,
                        user: { select: { userName: true, publicKey: true } },
                        offer: true,
                        favouriteOffer: true,
                        tags: {
                            include: { tag: true },
                        },
                    },
                })
                .then((ask) => {
                    return ask
                        ? {
                              ...ask,
                              status: getAskStatus(
                                  ask.deadlineAt,
                                  ask.acceptedDeadlineAt,
                                  Boolean(ask.offer.length),
                                  Boolean(ask.favouriteOffer),
                              ),
                          }
                        : undefined
                })

            if (ask?.userId === ctx?.user?.id) {
                throw new Error('You cannot create an offer for your own ask')
            }

            if (ask?.status !== 'active') {
                throw new Error('This ask si not active')
            }

            const imagePairs = await Promise.all(
                input.files.map(async (file) => {
                    const uploadedImageUrl = await getSignedUrl(
                        s3Client,
                        new GetObjectCommand({
                            Bucket: `${process.env.DO_API_NAME}`,
                            Key: `${ctx.user.id}/${file.id}`,
                        }),
                    )

                    const sourceImage = await fetch(uploadedImageUrl, { method: 'GET' }).then((res) =>
                        res.arrayBuffer(),
                    )

                    const imageMetadata = await sharp(Buffer.from(sourceImage)).metadata()

                    const imageBuffer = Buffer.from(sourceImage)
                    let checkerBuffer

                    await new Promise((resolve, reject) => {
                        fs.readFile(
                            path.join(process.cwd(), './src/assets/checker_obfuscation.png'),
                            function (err, data) {
                                checkerBuffer = data
                                resolve(data)
                            },
                        )
                    })

                    const cropped = await sharp(checkerBuffer)
                        .resize(imageMetadata.width, imageMetadata.height, {
                            fit: sharp.fit.inside,
                            withoutEnlargement: true,
                        })
                        .toBuffer()

                    const obfuscatedImage = {
                        BLUR: await sharp(imageBuffer)
                            .blur(parseInt(input.blurLevel ?? '5'))
                            .toBuffer(),
                        CHECKER: await sharp(imageBuffer)
                            .composite([
                                {
                                    input: cropped,
                                    tile: true,
                                    blend: 'atop',
                                },
                            ])
                            .toBuffer(),
                    }[input.obscureMethod]

                    const blurredDbImage = await prisma.file.create({ data: {} })
                    const blurredImageKey = `${ctx.user.id}/${blurredDbImage.id}`

                    const uploadUrl = await createPresignedPost(s3Client, {
                        Fields: {
                            key: blurredImageKey,
                        },
                        Conditions: [
                            ['content-length-range', 0, 9999999],
                            ['starts-with', '$Content-Type', 'image/'],
                        ],
                        Expires: 60,
                        Bucket: `${process.env.DO_API_NAME}`,
                        Key: blurredImageKey,
                    })

                    await prisma.file.update({
                        where: { id: blurredDbImage.id },
                        data: {
                            s3Key: blurredImageKey,
                        },
                    })

                    const ulData = { ...uploadUrl.fields, 'Content-Type': 'image/', file: obfuscatedImage } as Record<
                        string,
                        any
                    >

                    const formData = new FormData()
                    for (const name in ulData) {
                        formData.append(name, ulData[name])
                    }

                    await fetch(uploadUrl.url.replace('//', '//asksats.'), {
                        method: 'POST',
                        body: formData as unknown as BodyInit,
                    })

                    return {
                        fileName: 'test',
                        offerFile: { connect: { id: file.id } },
                        obscureFile: { connect: { id: blurredDbImage.id } },
                    }
                }),
            )

            return prisma.offer.create({
                data: {
                    ask: { connect: { id: input.askId } },
                    author: { connect: { id: ctx.user.id } },
                    offerContext: {
                        create: {
                            content: input.content,
                            filePairs: {
                                create: imagePairs,
                            },
                            obscureMethod: input.obscureMethod,
                        },
                    },
                },
            })
        }),
    listForAsk: t.procedure
        .use(isAuthed)
        .input(z.object({ askId: z.string() }))
        .query(async ({ ctx, input }) => {
            const ask = await prisma.ask
                .findUnique({
                    where: { id: input.askId },
                    include: {
                        offer: true,
                        favouriteOffer: true,
                        bumps: true,
                    },
                })
                .then((ask) => {
                    return ask
                        ? {
                              ...ask,
                              status: getAskStatus(
                                  ask.deadlineAt,
                                  ask.acceptedDeadlineAt,
                                  Boolean(ask.offer.length),
                                  Boolean(ask.favouriteOffer),
                              ),
                          }
                        : undefined
                })

            const offersForAsk = await prisma.offer.findMany({
                where: { askId: input.askId },
                include: {
                    offerContext: { include: { filePairs: { include: { offerFile: true, obscureFile: true } } } },
                },
                orderBy: { createdAt: 'desc' },
            })

            return await Promise.all(
                offersForAsk.map(async (offer) => {
                    const conditionIsMyOffer = offer.authorId === ctx.user.id

                    const isAskSettled = ask?.status === 'settled'
                    const isBumpPublic = ask?.askKind === 'BUMP_PUBLIC'
                    const haveIBumped = ask?.bumps.some((bump) => bump.bidderId === ctx.user.id)
                    const isTheFavouriteOffer = ask?.favouriteOffer?.id === offer.id

                    const conditionIsSettledBumpPublicAndIHaveBumped =
                        isBumpPublic && haveIBumped && isAskSettled && isTheFavouriteOffer

                    const isPublic = ask?.askKind === 'PUBLIC'

                    const conditionIsSettledAndPublic = isAskSettled && isPublic && isTheFavouriteOffer

                    const isPrivate = ask?.askKind === 'PRIVATE'
                    const isMyAsk = ask?.userId === ctx.user.id

                    const conditionIsSettledAndPrivateAndICreatedAsk =
                        isAskSettled && isPrivate && isMyAsk && isTheFavouriteOffer

                    const finalBumpRevealCondition =
                        conditionIsMyOffer ||
                        conditionIsSettledBumpPublicAndIHaveBumped ||
                        conditionIsSettledAndPublic ||
                        conditionIsSettledAndPrivateAndICreatedAsk

                    return {
                        ...offer,
                        forSettledAsk: isAskSettled,
                        offerContext: {
                            ...offer.offerContext,
                            filePairs: offer?.offerContext
                                ? await Promise.all(
                                      offer?.offerContext?.filePairs.map(async (pair) => {
                                          return {
                                              id: pair.id,
                                              offerFileUrl: finalBumpRevealCondition
                                                  ? pair.offerFile.s3Key
                                                      ? await getSignedUrl(
                                                            s3Client,
                                                            new GetObjectCommand({
                                                                Bucket: `${process.env.DO_API_NAME}`,
                                                                Key: pair.offerFile.s3Key,
                                                            }),
                                                        )
                                                      : ''
                                                  : '',
                                              obscureFileUrl: pair.obscureFile.s3Key
                                                  ? await getSignedUrl(
                                                        s3Client,
                                                        new GetObjectCommand({
                                                            Bucket: `${process.env.DO_API_NAME}`,
                                                            Key: pair.obscureFile.s3Key,
                                                        }),
                                                    )
                                                  : '',
                                          }
                                      }),
                                  )
                                : [],
                        },
                    }
                }),
            )
        }),
    setFavoutieForAsk: t.procedure
        .use(isAuthed)
        .input(z.object({ askId: z.string(), offerId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const ask = await prisma.ask.findUnique({ where: { id: input.askId } })

            if (ask?.userId !== ctx?.user?.id) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: `You cannot set a favourite for an ask that is not yours`,
                })
            }

            return await prisma.ask.update({
                where: { id: input.askId },
                data: {
                    favouriteOffer: { connect: { id: input.offerId } },
                },
            })
        }),
    myOffers: t.procedure.use(isAuthed).query(async ({ ctx, input }) => {
        return await prisma.offer.findMany({
            where: { author: { id: ctx.user.id } },
            include: { ask: { include: { askContext: true } } },
        })
    }),
})
