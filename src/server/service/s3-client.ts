import { S3Client } from '@aws-sdk/client-s3'

export const s3Client = new S3Client({
    endpoint: `${process.env.DO_API_ENDPOINT}`,
    forcePathStyle: false,
    region: 'fra1',
    credentials: {
        accessKeyId: `${process.env.DO_API_KEY}`,
        secretAccessKey: `${process.env.DO_API_SECRET}`,
    },
})
