import { t } from '../trpc'
import { prisma } from '~/server/prisma'
import { isAuthed } from '~/server/middlewares/authed'
import { uploadedImageById } from '~/components/ask/CreateAsk'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { createPresignedPost } from '@aws-sdk/s3-presigned-post'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { s3Client } from '~/server/service/s3-client'
import { BlurLevels, createFilePair } from '~/components/offer/CreateOffer'
import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import FormData from 'form-data'
import { Buffer } from 'buffer'

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
    doFilePair: t.procedure
        .use(isAuthed)
        .input(createFilePair)
        .query(async ({ ctx, input }) => {
            const uploadedImageUrl = await getSignedUrl(
                s3Client,
                new GetObjectCommand({
                    Bucket: `${process.env.DO_API_NAME}`,
                    Key: `${ctx.user.id}/${input.file.id}`,
                }),
            )

            const sourceImage = await fetch(uploadedImageUrl, { method: 'GET' }).then((res) => res.arrayBuffer())
            const imageBuffer = Buffer.from(sourceImage)

            const obfuscatedImage = {
                BLUR: doBlurredImage(imageBuffer, input.blurLevel ?? '5'),
                CHECKER: doCheckerImage(sourceImage),
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
                offerFile: { connect: { id: input.file.id } },
                obscureFile: { connect: { id: blurredDbImage.id } },
            }
        }),
})
