import { create } from 'zustand'

interface CustomHeadProps {
    title: string
    description: string
    imageUrl: string
    url: string
}

interface Header {
    headerProps: CustomHeadProps
    setHeaderProps: (props: CustomHeadProps) => void
}

export const useOGDHeaderStore = create<Header>((set) => ({
    headerProps: {
        title: 'ArtiSats.com',
        description: 'Trade images for sats.',
        imageUrl: '/artisats_big_logo.svg',
        url: 'https://artisats.com',
    },
    setHeaderProps: (props: CustomHeadProps) => {
        set({ headerProps: props })
    },
}))
