import useAuthStore from '~/store/useAuthStore'
import { useEffect, useRef } from 'react'
import { IconPropertyDisplay } from '~/components/common/IconPropertyDisplay'
import autoAnimate from '@formkit/auto-animate'
import useActionStore from '~/store/actionStore'
import Link from 'next/link'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import KeyIcon from '@mui/icons-material/Key'
import CurrencyBitcoinIcon from '@mui/icons-material/CurrencyBitcoin'
import AddIcon from '@mui/icons-material/Add'
import BoltIcon from '@mui/icons-material/Bolt'
import BookIcon from '@mui/icons-material/Book'
import OfflineBoltOutlinedIcon from '@mui/icons-material/OfflineBoltOutlined'
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined'
import { Avatar, IconButton, Tooltip } from '@mui/material'
import useMediaQuery from '@mui/material/useMediaQuery'
import useNodeConnectionStore from '~/store/nodeConnectionStore'

interface HeaderProps {}

export const Header = ({}: HeaderProps) => {
    const { setCurrentModal } = useActionStore()
    const { user, logout } = useAuthStore()
    const { connectionAddress } = useNodeConnectionStore()

    const matches = useMediaQuery('(min-width:600px)')
    const parent = useRef(null)

    useEffect(() => {
        parent.current && autoAnimate(parent.current)
    }, [parent])

    const handleLogout = () => {
        logout()
    }

    return (
        <div className={'grow text-sm lg:h-full'}>
            {user ? (
                <div className={'flex w-full flex-row items-center justify-between'}>
                    <div className={'flex flex-row items-center gap-2'}>
                        {user.profileImage ? (
                            <Tooltip title="Edit profile">
                                <Avatar
                                    id={'button-edit-profile'}
                                    onClick={() => setCurrentModal('editUser')}
                                    alt={`profile image of ${user.userName}`}
                                    src={user.profileImage}
                                />
                            </Tooltip>
                        ) : (
                            <AccountCircleOutlinedIcon fontSize={'small'} />
                        )}

                        <div className={'flex hidden max-w-xs flex-col content-center truncate 2xl:flex'}>
                            <IconPropertyDisplay identifier={'publicKey'} value={user.publicKey?.slice(0, 12) + '...'}>
                                <KeyIcon fontSize={'small'} />
                            </IconPropertyDisplay>
                            <IconPropertyDisplay identifier={'userName'} value={'@' + user.userName}>
                                <AccountCircleIcon fontSize={'small'} />
                            </IconPropertyDisplay>
                        </div>
                    </div>
                    <div className={'flex flex-row'}>
                        <Tooltip title="Blog">
                            <IconButton color="primary" id={'open-authenticate-button'}>
                                <Link href={`/ask/blog`}>
                                    <BookIcon fontSize={`${matches ? 'large' : 'small'}`} />
                                </Link>
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Transact">
                            <span>
                                <IconButton
                                    color="primary"
                                    disabled={!connectionAddress}
                                    onClick={() => setCurrentModal('transact')}
                                    id={'button-transact'}
                                >
                                    <CurrencyBitcoinIcon fontSize={`${matches ? 'large' : 'small'}`} />
                                </IconButton>
                            </span>
                        </Tooltip>
                        <Tooltip title="Create new ask">
                            <IconButton
                                color="primary"
                                onClick={() => setCurrentModal('createAsk')}
                                id={'create-ask-button'}
                            >
                                <AddIcon fontSize={`${matches ? 'large' : 'small'}`} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Unauthenticate">
                            <IconButton color="primary" onClick={handleLogout} id={'logout-button'}>
                                <BoltIcon fontSize={`${matches ? 'large' : 'small'}`} color={'primary'} />
                            </IconButton>
                        </Tooltip>
                    </div>
                </div>
            ) : (
                <Tooltip title="Authenticate">
                    <IconButton onClick={() => setCurrentModal('authenticate')} id={'open-authenticate-button'}>
                        <OfflineBoltOutlinedIcon fontSize={`${matches ? 'large' : 'small'}`} />
                    </IconButton>
                </Tooltip>
            )}
        </div>
    )
}
