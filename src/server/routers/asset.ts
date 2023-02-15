import { t } from '../trpc'
import { prisma } from '~/server/prisma'
import { isAuthed } from '~/server/middlewares/authed'
import { uploadedImageById } from '~/components/ask/CreateAsk'
import { DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { createPresignedPost } from '@aws-sdk/s3-presigned-post'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { s3Client } from '~/server/service/s3-client'
import { z } from 'zod'

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
    preSignedPair: t.procedure.use(isAuthed).mutation(async ({ ctx, input }) => {
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
                obscureMethod: 'input.obscureMethod',
            },
            include: {
                offerFile: true,
                obscureFile: true,
            },
        })

        const originalImageKey = `${ctx.user.id}/${filePair.offerFile.id}`
        const obscureImageKey = `${ctx.user.id}/${filePair.obscureFile.id}`

        const offerUploadUrl = await createPresignedPost(s3Client, {
            Fields: {
                key: originalImageKey,
            },
            Conditions: [
                ['content-length-range', 0, 9999999],
                ['starts-with', '$Content-Type', 'image/'],
            ],
            Expires: 60,
            Bucket: `${process.env.DO_API_NAME}`,
            Key: originalImageKey,
        })
        const obscuredUploadUrl = await createPresignedPost(s3Client, {
            Fields: {
                key: obscureImageKey,
            },
            Conditions: [
                ['content-length-range', 0, 9999999],
                ['starts-with', '$Content-Type', 'image/'],
            ],
            Expires: 60,
            Bucket: `${process.env.DO_API_NAME}`,
            Key: obscureImageKey,
        })

        await prisma.file.update({
            where: { id: filePair.offerFile.id },
            data: {
                s3Key: originalImageKey,
            },
        })
        await prisma.file.update({
            where: { id: filePair.obscureFile.id },
            data: {
                s3Key: obscureImageKey,
            },
        })

        return {
            filePairId: filePair.id,
            originalImageUploadUrl: offerUploadUrl,
            obscuredImageUploadUrl: obscuredUploadUrl,
        }
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
