import { generateOpenApiDocument } from 'trpc-openapi'
import { appRouter } from '~/server/routers/_app'

export const openApiDocument = generateOpenApiDocument(appRouter, {
    title: 'AsksSats API',
    description: 'OpenAPI compliant REST API for ASKSats',
    version: '0.0.1',
    baseUrl: `${process.env.COMPOSITE_DOMAIN}/api`,
    docsUrl: `${process.env.COMPOSITE_DOMAIN}/api/docs`,
})
