import { trpc } from '~/utils/trpc'
import { TransactionList } from '~/components/common/TransactionList'
import { Button, IconButton, Tooltip } from '@mui/material'
import Link from 'next/link'
import QueueOutlinedIcon from '@mui/icons-material/QueueOutlined'
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined'
import HandshakeOutlinedIcon from '@mui/icons-material/HandshakeOutlined'
import PermMediaOutlinedIcon from '@mui/icons-material/PermMediaOutlined'
import { useStore } from 'zustand'
import { authedUserStore } from '~/store/authedUserStore'
import { LinkBehaviour } from '~/components/common/LinkBehaviour'
import { SatoshiIcon } from '~/components/common/SatishiIcon'
import EditIcon from '@mui/icons-material/Edit'

import React from 'react'
import { useActionStore } from '~/store/actionStore'

interface SidebarMyStatsProps {}

export const SidebarMyStats = ({}: SidebarMyStatsProps) => {
    const { data: myStatsData } = trpc.stats.myStats.useQuery()
    const { data: myBalanceData } = trpc.accounting.myBalance.useQuery()
    const { data: mySpacesData } = trpc.space.mySpaces.useQuery()
    const { editSpace } = useActionStore()

    const { user } = useStore(authedUserStore)

    const handleEditSpace = async (spaceId: string) => {
        editSpace(spaceId)
    }

    return (
        <div className={'flex flex-col gap-2 pt-8'}>
            <div className={'flex flex-row items-center'}>
                <Tooltip title="My asks">
                    <IconButton>
                        <Link className={'flex items-center'} href={`/ask/user/${user?.userName}`}>
                            <QueueOutlinedIcon fontSize={'medium'} color={'btcgrey'} />
                        </Link>
                    </IconButton>
                </Tooltip>
                <Tooltip title="My bumps">
                    <IconButton>
                        <Link className={'flex items-center'} href={`/ask/bumps`}>
                            <RocketLaunchOutlinedIcon fontSize={'medium'} color={'btcgrey'} />
                        </Link>
                    </IconButton>
                </Tooltip>
                <Tooltip title="My offers">
                    <IconButton>
                        <Link className={'flex items-center'} href={`/ask/offers`}>
                            <HandshakeOutlinedIcon fontSize={'medium'} color={'btcgrey'} />
                        </Link>
                    </IconButton>
                </Tooltip>
                <Tooltip title="My files">
                    <IconButton id={'files-button'}>
                        <Link href={`/ask/files`}>
                            <PermMediaOutlinedIcon fontSize={'medium'} color={'btcgrey'} />
                        </Link>
                    </IconButton>
                </Tooltip>
            </div>
            <div className={'emphasis-container break-all text-center'}>
                {myStatsData && (
                    <div>
                        <p>
                            My username is <b>@{myStatsData.userName}</b> and my public key is <br />
                            <b>{myStatsData.publicKey}</b>.<br /> I have earned <b>{myStatsData.totalEarned}</b> and
                            spent <b>{myStatsData.totalSpent}</b> on ArtiSats. I have placed{' '}
                            <b>{myStatsData.totalAsks}</b> asks and made <b>{myStatsData.totalOffers}</b> offers. I have
                            settled <b>{myStatsData.settledAsks}</b> asks and have won{' '}
                            <b>{myStatsData.settledOffers}</b> settled offers.
                        </p>
                    </div>
                )}
            </div>
            <div className={'emphasis-container break-all text-center'}>
                {myBalanceData && (
                    <div>
                        <p>
                            My available balance is <b>{myBalanceData.availableBalance}</b> and my balance locked up as
                            bumps is <b>{myBalanceData.lockedBalance}</b>.
                        </p>
                    </div>
                )}
            </div>
            <div>
                <b>my spaces:</b>
                <div className={'flex flex-col gap-1'}>
                    {mySpacesData?.map((space, index) => {
                        return (
                            <div
                                key={index}
                                className={'flex flex-row items-center gap-2 p-2 shadow-md hover:bg-gray-50'}
                            >
                                <Link
                                    component={LinkBehaviour}
                                    href={`/ask/timeline/${space.name}`}
                                    variant="body2"
                                    className={'grow'}
                                >
                                    {space.name}
                                </Link>
                                <div className={'flex w-48 flex-row items-center gap-1'}>
                                    <i>nsfw:</i>
                                    <b>{space.nsfw}</b>
                                    <SatoshiIcon />
                                </div>
                                <Button
                                    id="cancel-ask-button"
                                    variant="contained"
                                    color="info"
                                    component="div"
                                    size={'small'}
                                    onClick={() => handleEditSpace(space.id)}
                                    startIcon={<EditIcon />}
                                >
                                    edit
                                </Button>
                            </div>
                        )
                    })}
                </div>
            </div>
            <div className={'emphasis-container'}>
                <TransactionList />
            </div>
        </div>
    )
}
