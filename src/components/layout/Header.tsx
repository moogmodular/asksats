import useAuthStore from '~/store/useAuthStore'
import { useEffect, useRef, useState } from 'react'
import { IconPropertyDisplay } from '~/components/common/IconPropertyDisplay'
import autoAnimate from '@formkit/auto-animate'
import useActionStore from '~/store/actionStore'
import Link from 'next/link'

interface HeaderProps {}

export const Header = ({}: HeaderProps) => {
    const { setCurrentModal } = useActionStore()
    const { user, logout } = useAuthStore()

    const [balanceHover, setBalanceHover] = useState(false)

    const parent = useRef(null)

    useEffect(() => {
        parent.current && autoAnimate(parent.current)
    }, [parent])

    const handleLogout = () => {
        logout()
    }

    return (
        <div className={'primary-container h-12 grow text-sm lg:h-full'}>
            {user ? (
                <div className={'flex w-full flex-row justify-center justify-between'}>
                    <div>
                        {user.profileImage ? (
                            <button
                                className={'tooltip'}
                                onClick={() => setCurrentModal('editUser')}
                                id={'button-edit-profile'}
                                data-tip="Edit profile"
                            >
                                <img
                                    className="mr-2 h-6 w-6 rounded-global xl:h-10 xl:w-10"
                                    src={user.profileImage}
                                    alt={`profile image of ${user.userName}`}
                                />
                            </button>
                        ) : (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="mr-2 h-6 w-6 xl:h-10 xl:w-10"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                                />
                            </svg>
                        )}
                    </div>

                    <div className={'flex hidden max-w-xs flex-row gap-2 2xl:block'}>
                        <div>
                            <IconPropertyDisplay identifier={'publicKey'} value={user.publicKey?.slice(0, 12) + '...'}>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="h-3 w-3"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-4.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"
                                    />
                                </svg>
                            </IconPropertyDisplay>
                            <IconPropertyDisplay identifier={'userName'} value={'@' + user.userName}>
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
                                        d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-4 0 3 3 0 016 0z"
                                    />
                                </svg>
                            </IconPropertyDisplay>
                        </div>
                    </div>
                    <div className={'flex flex-row items-center'}>
                        <button className={'tooltip'} data-tip="My asks">
                            <Link className={'flex items-center'} href={`/ask/user/${user.userName}`}>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="h-4 w-4 xl:h-6 xl:w-6"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M6 6.878V6a2.25 2.25 0 012.25-2.25h7.5A2.25 2.25 0 0118 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 004.5 9v.878m13.5-3A2.25 2.25 0 0119.5 9v.878m0 0a2.246 2.246 0 00-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0121 12v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6c0-.98.626-1.813 1.5-2.122"
                                    />
                                </svg>
                            </Link>
                        </button>
                        <button className={'tooltip'} data-tip="My bumps">
                            <Link className={'flex items-center'} href={`/ask/bumps`}>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="h-4 w-4 xl:h-6 xl:w-6"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z"
                                    />
                                </svg>
                            </Link>
                        </button>
                        <button className={'tooltip'} data-tip="My offers">
                            <Link className={'flex items-center'} href={`/ask/offers`}>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="h-4 w-4 xl:h-6 xl:w-6"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
                                    />
                                </svg>
                            </Link>
                        </button>
                    </div>
                    <div className={'flex flex-row'}>
                        <div
                            className={'flex flex-col items-center'}
                            onMouseEnter={() => setBalanceHover(true)}
                            onMouseLeave={() => setBalanceHover(false)}
                            ref={parent}
                        >
                            <button
                                className={'tooltip'}
                                onClick={() => setCurrentModal('transact')}
                                id={'button-transact'}
                                data-tip="Transact"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    className={`${balanceHover ? 'h-4 w-6 xl:h-6 xl:w-10' : 'h-6 w-6 xl:h-10 xl:w-10'}`}
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm0 18v-1.511h-.5v1.511h-1v-1.511h-2.484l.25-1.489h.539c.442 0 .695-.425.695-.854v-4.444c0-.416-.242-.702-.683-.702h-.817v-1.5h2.5v-1.5h1v1.5h.5v-1.5h1v1.526c2.158.073 3.012.891 3.257 1.812.29 1.09-.429 2.005-1.046 2.228.75.192 1.789.746 1.789 2.026 0 1.742-1.344 2.908-4 2.908v1.5h-1zm-.5-5.503v2.503c1.984 0 3.344-.188 3.344-1.258 0-1.148-1.469-1.245-3.344-1.245zm0-.997c1.105 0 2.789-.078 2.789-1.25 0-1-1.039-1.25-2.789-1.25v2.5z" />
                                </svg>

                                {balanceHover ? (
                                    <div className={'flex flex-row gap-1'}>
                                        <p id="header-available-balance" className={'text-xs'}>
                                            {user.balance.availableBalance}
                                        </p>
                                        <p id="header-locked-balance" className={'text-xs'}>
                                            {user.balance.lockedBalance}
                                        </p>
                                    </div>
                                ) : null}
                            </button>
                        </div>

                        <button
                            className={'tooltip'}
                            onClick={() => setCurrentModal('createAsk')}
                            id={'create-ask-button'}
                            data-tip="Create new ask"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="ml-2 h-6 w-6 xl:h-10 xl:w-10"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                        </button>
                        <button className={'tooltip'} onClick={handleLogout} id={'logout-button'} data-tip="Logout">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="yellow"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="ml-2 h-6 w-6 xl:h-10 xl:w-10"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                                />
                            </svg>
                        </button>
                        <button className={'tooltip'} id={'open-authenticate-button'} data-tip="Blog">
                            <Link href={`/ask/blog`}>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="h-6 w-6"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
                                    />
                                </svg>
                            </Link>
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    className={'tooltip'}
                    onClick={() => setCurrentModal('authenticate')}
                    id={'open-authenticate-button'}
                    data-tip="Authenticate"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="ml-auto h-6 w-6 xl:h-10 xl:w-10"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                        />
                    </svg>
                </button>
            )}
        </div>
    )
}
