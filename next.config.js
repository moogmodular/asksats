// @ts-check
/* eslint-disable @typescript-eslint/no-var-requires */
const { env } = require('./src/server/env')

/**
 * Don't be scared of the generics here.
 * All they do is to give us autocompletion when using this.
 *
 * @template {import('next').NextConfig} T
 * @param {T} config - A generic parameter that flows through to the return type
 * @constraint {{import('next').NextConfig}}
 */
function getConfig(config) {
    return config
}

const corsHeaders = [
    {
        key: 'Access-Control-Allow-Origin',
        value: '*',
    },
    {
        key: 'Access-Control-Allow-Methods',
        value: 'GET, HEAD, OPTIONS',
    },
]

/**
 * @link https://nextjs.org/docs/api-reference/next.config.js/introduction
 */
module.exports = getConfig({
    /**
     * Dynamic configuration available for the browser and server.
     * Note: requires `ssr: true` or a `getInitialProps` in `_app.tsx`
     * @link https://nextjs.org/docs/api-reference/next.config.js/runtime-configuration
     */
    publicRuntimeConfig: {
        NODE_ENV: env.NODE_ENV,
    },
    transpilePackages: ['FilerobotImageEditor'],
    typescript: {
        ignoreBuildErrors: true,
    },
    async headers() {
        return [
            {
                source: '/.well-known',
                headers: [...corsHeaders],
            },
        ]
    },
    async redirects() {
        return [
            {
                source: '/',
                destination: '/ask/timeline/all',
                permanent: true,
            },
        ]
    },
    async rewrites() {
        return [
            {
                source: '/.well-known/nostr.json',
                destination: '/api/nostr/nipfive',
            },
            {
                source: '/ask/single/:slug',
                destination: '/',
            },
            {
                source: '/ask/user/:userName',
                destination: '/',
            },
            {
                source: '/ask/tag/:tag',
                destination: '/',
            },
            {
                source: '/ask/blog',
                destination: '/',
            },
            {
                source: '/ask/timeline/:space',
                destination: '/',
            },
        ]
    },
})
