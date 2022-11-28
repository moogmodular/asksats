import useListStore from '~/store/listStore'
import { useEffect, useState } from 'react'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { useRouter } from 'next/router'

interface SubHeaderToolbarHeaderProps {}

export const SubHeaderToolbarHeader = ({}: SubHeaderToolbarHeaderProps) => {
    const { setFilterFor, setOrderBy, setOrderByDirection, setSearchTerm, orderBy, filterFor, setTemplate } =
        useListStore()

    const router = useRouter()
    const [hideForSingle, setHideForSingle] = useState(false)
    const [parent] = useAutoAnimate<HTMLDivElement>()

    const userNameFromPath = (path: any): string => {
        return path.split('/')[2]
    }

    useEffect(() => {
        const path = userNameFromPath(router.asPath)
        if (path === 'single') {
            setHideForSingle(true)
        } else {
            setHideForSingle(false)
        }
    }, [router])

    return (
        <>
            {!hideForSingle ? (
                <div ref={parent} className={'flex h-full cursor-pointer flex-col flex-wrap gap-2'}>
                    <div className="flex flex-row items-center gap-2">
                        <input
                            type="text"
                            placeholder=""
                            className="input-bordered input-primary input input-xs w-full lg:input-sm"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="h-4 w-4"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                            />
                        </svg>
                    </div>
                    <div className={'mr-1 flex flex-row gap-1'}>
                        <button className={'btn-xs btn'} onClick={() => setTemplate('newest')}>
                            new
                        </button>
                        <button className={'btn-xs btn'} onClick={() => setTemplate('public_settled')}>
                            public settled
                        </button>
                        <button className={'btn-xs btn'} onClick={() => setTemplate('ending_soon')}>
                            ending
                        </button>
                    </div>
                    <div className={'flex flex-row'}>
                        <div className="dropdown">
                            <label tabIndex={0} className="btn-xs btn m-1">
                                {filterFor}
                            </label>
                            <ul tabIndex={0} className="dropdown-content menu rounded-box bg-base-100 p-2">
                                <li>
                                    <a onClick={() => setFilterFor('all')}>All</a>
                                </li>
                                <li>
                                    <a onClick={() => setFilterFor('active')}>Active</a>
                                </li>
                                <li>
                                    <a onClick={() => setFilterFor('pending_acceptance')}>Acceptance pending</a>
                                </li>
                                <li>
                                    <a onClick={() => setFilterFor('settled')}>Settled</a>
                                </li>
                                <li>
                                    <a onClick={() => setFilterFor('expired')}>Expired</a>
                                </li>
                            </ul>
                        </div>
                        <div className="dropdown">
                            <label tabIndex={0} className="btn-xs btn m-1">
                                {orderBy}
                            </label>
                            <ul tabIndex={0} className="dropdown-content menu rounded-box bg-base-100 p-2 shadow">
                                <li>
                                    <a onClick={() => setOrderBy('deadline')}>Deadline</a>
                                </li>
                                <li>
                                    <a onClick={() => setOrderBy('acceptance')}>Acceptance</a>
                                </li>
                                <li>
                                    <a onClick={() => setOrderBy('creation')}>Creation</a>
                                </li>
                            </ul>
                        </div>
                        <div className="dropdown">
                            <label tabIndex={0} className="btn-xs btn m-1">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="h-4 w-4"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5"
                                    />
                                </svg>
                            </label>
                            <ul tabIndex={0} className="dropdown-content menu rounded-box bg-base-100 p-2 shadow">
                                <li>
                                    <a onClick={() => setOrderByDirection('asc')}>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="currentColor"
                                            className="h-4 w-4"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0l-3.75-3.75M17.25 21L21 17.25"
                                            />
                                        </svg>
                                    </a>
                                </li>
                                <li>
                                    <a onClick={() => setOrderByDirection('desc')}>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="currentColor"
                                            className="h-4 w-4"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25-.75L17.25 9m0 0L21 12.75M17.25 9v12"
                                            />
                                        </svg>
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            ) : null}
        </>
    )
}
