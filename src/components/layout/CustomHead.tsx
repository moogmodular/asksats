import React from 'react'
import Head from 'next/head'
import { useOGDHeaderStore } from '~/store/ogdHeaderStore'

export const CustomHead = () => {
    const {
        headerProps: { url, imageUrl, title, description },
    } = useOGDHeaderStore()

    return (
        <Head>
            <title>{title}</title>
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={imageUrl} />
            <meta property="og:url" content={url} />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={imageUrl} />
        </Head>
    )
}
