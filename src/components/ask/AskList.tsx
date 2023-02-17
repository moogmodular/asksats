import { trpc } from '~/utils/trpc'
import { AskPreview } from '~/components/ask/AskPreview'
import { useListStore } from '~/store/listStore'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'
import { useBottomScrollListener } from 'react-bottom-scroll-listener'
import { Button } from '@mui/material'

interface AskListProps {}

export const AskList = ({}: AskListProps) => {
    const { filterFor, orderBy, orderByDirection, searchTerm } = useListStore()

    const router = useRouter()
    const [userName, setUserName] = useState<string | undefined>(undefined)
    const [space, setSpace] = useState<string>('all')

    const handleLoadMore = useCallback(() => {
        infiniteQuery.fetchNextPage()
    }, [])

    const containerRef = useBottomScrollListener<HTMLDivElement>(handleLoadMore)

    const infiniteQuery = trpc.ask.list.useInfiniteQuery(
        {
            filterFor,
            orderBy,
            orderByDirection,
            searchTerm,
            spaceName: space,
            userName,
            pageSize: 9,
        },
        {
            getNextPageParam: (lastPage) => lastPage.nextCursor,
        },
    )

    const pathType = (path: any): string => {
        return path.split('/')[2]
    }

    const identifierFromPath = (path: any): string => {
        return path.split('/')[3]
    }

    useEffect(() => {
        const type = pathType(router.asPath)
        if (type === 'user') {
            const un = identifierFromPath(router.asPath)
            setUserName(un)
        } else if (type === 'timeline') {
            const space = identifierFromPath(router.asPath)
            setUserName(undefined)
            setSpace(space)
        } else {
            setUserName(undefined)
        }

        infiniteQuery.refetch()
    }, [router, filterFor, orderBy, orderByDirection, searchTerm, userName])

    return (
        <div
            ref={containerRef}
            className={
                'no-scrollbar grid max-h-screen w-full grid-cols-1 gap-6 overflow-x-hidden overflow-y-scroll overscroll-auto pb-12 md:grid-cols-2 lg:gap-6 2xl:grid-cols-3'
            }
        >
            {infiniteQuery?.data?.pages.map((item) => {
                return item.items.map((ask, index) => {
                    return <AskPreview key={ask.id} ask={ask} index={index} />
                })
            })}
            <Button variant="contained" component="div" onClick={() => handleLoadMore()}>
                load more...
            </Button>
        </div>
    )
}
