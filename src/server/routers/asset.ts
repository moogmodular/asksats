import { t } from '../trpc'
import { prisma } from '~/server/prisma'
import { isAuthed } from '~/server/middlewares/authed'
import { uploadedImageById } from '~/components/ask/CreateAsk'
import { DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { createPresignedPost } from '@aws-sdk/s3-presigned-post'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { s3Client } from '~/server/service/s3-client'
import { BlurLevels, createFilePair, preSignedUrl } from '~/components/offer/CreateOffer'
import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import FormData from 'form-data'
import { Buffer } from 'buffer'
import { z } from 'zod'

const doBlurredImage = async (imageBuffer: Buffer, blurLevel: BlurLevels) =>
    await sharp(imageBuffer)
        .blur(parseInt(blurLevel ?? '5'))
        .toBuffer()

const doCheckerImage = async (sourceImage: ArrayBuffer) => {
    const imageMetadata = await sharp(Buffer.from(sourceImage)).metadata()

    const imageBuffer = Buffer.from(sourceImage)
    let checkerBuffer

    await new Promise((resolve, reject) => {
        fs.readFile(path.join(process.cwd(), './src/assets/checker_obfuscation.png'), function (err, data) {
            checkerBuffer = data
            resolve(data)
        })
    })
    const cropped = await sharp(checkerBuffer)
        .resize(imageMetadata.width, imageMetadata.height, {
            fit: sharp.fit.inside,
            withoutEnlargement: true,
        })
        .toBuffer()
    return await sharp(imageBuffer)
        .composite([
            {
                input: cropped,
                tile: true,
                blend: 'atop',
            },
        ])
        .toBuffer()
}

export const assetRouter = t.router({
    uploadedImageById: t.procedure
        .use(isAuthed)
        .input(uploadedImageById)
        .query(async ({ ctx, input }) => {
            return await getSignedUrl(
                s3Client,
                new GetObjectCommand({ Bucket: `${process.env.DO_API_NAME}`, Key: `${ctx.user.id}/${input.imageId}` }),
            )
        }),
    deleteImagePair: t.procedure
        .use(isAuthed)
        .input(
            z.object({
                imagePairId: z.string(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const imagePair = await prisma.offerFilePair.findUnique({
                where: { id: input.imagePairId },
                include: { offerFile: true, obscureFile: true },
            })

            const paramsObscure = {
                Bucket: `${process.env.DO_API_NAME}`,
                Key: `${ctx.user.id}/${imagePair?.obscureFile.s3Key}`,
            }

            const paramsOffer = {
                Bucket: `${process.env.DO_API_NAME}`,
                Key: `${ctx.user.id}/${imagePair?.offerFile.s3Key}`,
            }

            await s3Client.send(new DeleteObjectCommand(paramsObscure))
            await s3Client.send(new DeleteObjectCommand(paramsOffer))

            await prisma.offerFilePair.delete({
                where: { id: input.imagePairId },
            })

            return true
        }),
    preSignedUrl: t.procedure.use(isAuthed).query(async ({ ctx, input }) => {
        const dbImage = await prisma.file.create({ data: {} })
        const imageKey = `${ctx.user.id}/${dbImage.id}`

        const uploadUrl = await createPresignedPost(s3Client, {
            Fields: {
                key: imageKey,
            },
            Conditions: [
                ['content-length-range', 0, 9999999],
                ['starts-with', '$Content-Type', 'image/'],
            ],
            Expires: 60,
            Bucket: `${process.env.DO_API_NAME}`,
            Key: imageKey,
        })

        await prisma.file.update({
            where: { id: dbImage.id },
            data: {
                s3Key: imageKey,
            },
        })

        return {
            imageId: dbImage.id,
            uploadUrl: uploadUrl,
        }
    }),
    preSignedUrlPair: t.procedure
        .use(isAuthed)
        .input(preSignedUrl)
        .query(async ({ ctx, input }) => {
            const filePair = await prisma.offerFilePair.create({
                data: {
                    user: {
                        connect: {
                            id: ctx.user.id,
                        },
                    },
                    offerFile: {
                        create: {},
                    },
                    obscureFile: {
                        create: {},
                    },
                    fileName: 'input.fileName',
                    obscureMethod: input.obscureMethod,
                },
                include: {
                    offerFile: true,
                    obscureFile: true,
                },
            })

            const imageKey = `${ctx.user.id}/${filePair.offerFile.id}`

            const uploadUrl = await createPresignedPost(s3Client, {
                Fields: {
                    key: imageKey,
                },
                Conditions: [
                    ['content-length-range', 0, 9999999],
                    ['starts-with', '$Content-Type', 'image/'],
                ],
                Expires: 60,
                Bucket: `${process.env.DO_API_NAME}`,
                Key: imageKey,
            })

            await prisma.file.update({
                where: { id: filePair.offerFile.id },
                data: {
                    s3Key: imageKey,
                },
            })

            return {
                filePairId: filePair.id,
                offerFileId: filePair.offerFile.id,
                obscureFileId: filePair.obscureFile.id,
                offerFileUploadUrl: uploadUrl,
            }
        }),
    doFilePair: t.procedure
        .use(isAuthed)
        .input(createFilePair)
        .mutation(async ({ ctx, input }) => {
            const uploadedImageUrl = await getSignedUrl(
                s3Client,
                new GetObjectCommand({
                    Bucket: `${process.env.DO_API_NAME}`,
                    Key: `${ctx.user.id}/${input.offerFileId}`,
                }),
            )

            const filePair = await prisma.offerFilePair.findUnique({ where: { offerFileId: input.offerFileId } })

            const sourceImage = await fetch(uploadedImageUrl, { method: 'GET' }).then((res) => res.arrayBuffer())
            const imageBuffer = Buffer.from(sourceImage)

            const obfuscatedImage = {
                BLUR: await doBlurredImage(imageBuffer, input.blurLevel ?? '5'),
                CHECKER: await doCheckerImage(sourceImage),
                NONE: sourceImage,
            }[filePair?.obscureMethod ?? 'BLUR']

            const blurredDbImage = await prisma.offerFilePair
                .findUnique({ where: { offerFileId: input.offerFileId } })
                .obscureFile()
            const blurredImageKey = `${ctx.user.id}/${blurredDbImage?.id}`

            const uploadUrl = await createPresignedPost(s3Client, {
                Fields: {
                    key: blurredImageKey,
                },
                Conditions: [
                    ['content-length-range', 0, 6292],
                    ['starts-with', '$Content-Type', 'image/'],
                ],
                Expires: 60,
                Bucket: `${process.env.DO_API_NAME}`,
                Key: blurredImageKey,
            })

            await prisma.file.update({
                where: { id: blurredDbImage?.id },
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

            await fetch(uploadUrl.url.replace('//', '//artisats.'), {
                method: 'POST',
                body: formData as unknown as BodyInit,
            })

            return filePair
        }),
    myFiles: t.procedure.use(isAuthed).query(async ({ ctx }) => {
        return await prisma.offerFilePair
            .findMany({
                where: {
                    user: {
                        id: ctx.user.id,
                    },
                },
                include: {
                    offerContext: {
                        include: {
                            offer: {
                                include: {
                                    ask: {
                                        include: {
                                            askContext: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            })
            .then(async (res) => {
                return await Promise.all(
                    res.map(async (filePair) => {
                        return {
                            ...filePair,
                            offerFile: {
                                url: await getSignedUrl(
                                    s3Client,
                                    new GetObjectCommand({
                                        Bucket: `${process.env.DO_API_NAME}`,
                                        Key: `${ctx.user.id}/${filePair?.offerFileId}`,
                                    }),
                                ),
                            },
                            obscureFile: {
                                url: await getSignedUrl(
                                    s3Client,
                                    new GetObjectCommand({
                                        Bucket: `${process.env.DO_API_NAME}`,
                                        Key: `${ctx.user.id}/${filePair?.obscureFileId}`,
                                    }),
                                ),
                            },
                        }
                    }),
                )
            })
    }),
    filePairById: t.procedure
        .use(isAuthed)
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            return await prisma.offerFilePair.findUnique({ where: { id: input.id } }).then(async (filePair) => {
                return {
                    ...filePair,
                    offerFile: {
                        url: await getSignedUrl(
                            s3Client,
                            new GetObjectCommand({
                                Bucket: `${process.env.DO_API_NAME}`,
                                Key: `${ctx.user.id}/${filePair?.offerFileId}`,
                            }),
                        ),
                    },
                    obscureFile: {
                        url: await getSignedUrl(
                            s3Client,
                            new GetObjectCommand({
                                Bucket: `${process.env.DO_API_NAME}`,
                                Key: `${ctx.user.id}/${filePair?.obscureFileId}`,
                            }),
                        ),
                    },
                }
            })
        }),
})
