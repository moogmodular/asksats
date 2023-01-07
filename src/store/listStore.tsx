import create from 'zustand'
import { RouterInput } from '~/utils/trpc'
import { z } from 'zod'
import { AskKind } from '@prisma/client'

const filterForSchema = z.enum(['active', 'pending_acceptance', 'settled', 'expired', 'all'])
const orderBySchema = z.enum(['deadline', 'acceptance', 'creation'])
const directionSchema = z.enum(['asc', 'desc'])
const askTypeSchema = z.enum(['PUBLIC', 'BUMP_PUBLIC', 'PRIVATE']).nullish()

export const askListProps = z.object({
    filterFor: filterForSchema,
    orderBy: orderBySchema,
    orderByDirection: directionSchema,
    askKind: askTypeSchema,
    searchTerm: z.string(),
    pageSize: z.number(),
    withoutFavouritesOnly: z.boolean().nullish(),
    cursor: z.string().nullish(),
    userName: z.string().nullish(),
    tagName: z.string().nullish(),
})

export type FilterForInput = RouterInput['ask']['list']['filterFor']
export type OrderByInput = RouterInput['ask']['list']['orderBy']
export type OrderByDirectionInput = RouterInput['ask']['list']['orderByDirection']

type ListTemplate = 'ending_soon' | 'newest' | 'public_settled' | 'not_favourited' | 'default_template'

interface List {
    filterFor: FilterForInput
    orderBy: OrderByInput
    orderByDirection: OrderByDirectionInput
    askKind: AskKind | undefined
    withoutFavouritesOnly: boolean
    setFilterFor: (filterFor: FilterForInput) => void
    setOrderBy: (orderBy: OrderByInput) => void
    setOrderByDirection: (orderByDirection: OrderByDirectionInput) => void
    searchTerm: string
    setSearchTerm: (searchTerm: string) => void
    unsetSearchTerm: () => void
    setTemplate: (template: ListTemplate) => void
}

const useListStore = create<List>((set) => ({
    filterFor: 'all',
    orderBy: 'creation',
    orderByDirection: 'desc',
    askKind: undefined,
    withoutFavouritesOnly: false,
    setFilterFor: (filterFor: FilterForInput) => {
        set({ filterFor: filterFor })
    },
    setOrderBy: (orderBy: OrderByInput) => {
        set({ orderBy: orderBy })
    },
    setOrderByDirection: (orderByDirection: OrderByDirectionInput) => {
        set({ orderByDirection: orderByDirection })
    },
    searchTerm: '',
    setSearchTerm: (searchTerm: string) => {
        set({ searchTerm: searchTerm })
    },
    unsetSearchTerm: () => {
        set({ searchTerm: '' })
    },
    setTemplate: (template: ListTemplate) => {
        const fun = {
            ending_soon: () => {
                set({ filterFor: 'active', orderBy: 'deadline', orderByDirection: 'asc', withoutFavouritesOnly: false })
            },
            newest: () => {
                set({ filterFor: 'all', orderBy: 'creation', orderByDirection: 'desc', withoutFavouritesOnly: false })
            },
            public_settled: () => {
                set({
                    filterFor: 'settled',
                    orderBy: 'creation',
                    orderByDirection: 'desc',
                    askKind: AskKind.PUBLIC,
                    withoutFavouritesOnly: true,
                })
            },
            not_favourited: () => {
                set({ filterFor: 'active', orderBy: 'creation', orderByDirection: 'desc', withoutFavouritesOnly: true })
            },
            default_template: () => {
                set({ filterFor: 'all', orderBy: 'creation', orderByDirection: 'desc', withoutFavouritesOnly: false })
            },
        }[template]
        fun()
    },
}))

export default useListStore
