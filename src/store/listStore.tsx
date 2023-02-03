import { create } from 'zustand'
import { RouterInput } from '~/utils/trpc'
import { z } from 'zod'
import { AskKind } from '@prisma/client'

const orderBySchema = z.enum(['creation'])
const directionSchema = z.enum(['asc', 'desc'])
const filterForSchema = z.enum(['OPEN', 'SETTLED', 'CANCELED']).optional()
const askTypeSchema = z.enum(['PUBLIC', 'BUMP_PUBLIC', 'PRIVATE']).optional()

export const askListProps = z.object({
    filterFor: filterForSchema,
    orderBy: orderBySchema,
    orderByDirection: directionSchema,
    askKind: askTypeSchema,
    spaceName: z.string(),
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

type ListTemplate = 'newest' | 'public_settled' | 'default_template'

interface List {
    filterFor: FilterForInput
    orderBy: OrderByInput
    orderByDirection: OrderByDirectionInput
    askKind: AskKind | undefined
    spaceName: string
    setFilterFor: (filterFor: FilterForInput) => void
    setOrderBy: (orderBy: OrderByInput) => void
    setOrderByDirection: (orderByDirection: OrderByDirectionInput) => void
    searchTerm: string
    setSearchTerm: (searchTerm: string) => void
    unsetSearchTerm: () => void
    setTemplate: (template: ListTemplate) => void
}

export const useListStore = create<List>((set) => ({
    filterFor: undefined,
    orderBy: 'creation',
    orderByDirection: 'desc',
    askKind: undefined,
    spaceName: 'all',
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
            newest: () => {
                set({ filterFor: 'OPEN', orderBy: 'creation', orderByDirection: 'desc' })
            },
            public_settled: () => {
                set({
                    filterFor: 'SETTLED',
                    orderBy: 'creation',
                    orderByDirection: 'desc',
                    askKind: AskKind.PUBLIC,
                })
            },
            default_template: () => {
                set({ orderBy: 'creation', orderByDirection: 'desc', spaceName: 'all' })
            },
        }[template]
        fun()
    },
}))
