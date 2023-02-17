import { trpc } from '~/utils/trpc'
import { Button, Tabs, Tooltip, Typography } from '@mui/material'
import { useStore } from 'zustand'
import { authedUserStore } from '~/store/authedUserStore'
import Tab from '@mui/material/Tab'

import React from 'react'
import { useActionStore } from '~/store/actionStore'
import Link from 'next/link'
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined'
import QueueOutlinedIcon from '@mui/icons-material/QueueOutlined'
import HandshakeOutlinedIcon from '@mui/icons-material/HandshakeOutlined'
import PermMediaOutlinedIcon from '@mui/icons-material/PermMediaOutlined'
import QueryStatsIcon from '@mui/icons-material/QueryStats'
import PublicIcon from '@mui/icons-material/Public'
import { TransactionList } from '~/components/common/TransactionList'
import EditIcon from '@mui/icons-material/Edit'
import { SatoshiIcon } from '~/components/common/SatishiIcon'
import { LinkBehaviour } from '~/components/common/LinkBehaviour'
import PointOfSaleIcon from '@mui/icons-material/PointOfSale'
import { FileList } from '~/components/FileList'
import { OfferList } from '~/components/ask/OfferList'
import { BumpList } from '~/components/ask/BumpList'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'
import ExplicitIcon from '@mui/icons-material/Explicit'
import NoAdultContentIcon from '@mui/icons-material/NoAdultContent'

interface TabPanelProps {
    children?: React.ReactNode
    index: number
    value: number
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`vertical-tabpanel-${index}`}
            aria-labelledby={`vertical-tab-${index}`}
            {...other}
            className={'no-scrollbar max-h-[65vh] overflow-y-auto'}
        >
            {value === index && <Typography>{children}</Typography>}
        </div>
    )
}

interface SidebarMyStatsProps {}

export const SidebarMyStats = ({}: SidebarMyStatsProps) => {
    const { data: myStatsData } = trpc.stats.myStats.useQuery()
    const { data: myBalanceData } = trpc.accounting.myBalance.useQuery()
    const { data: mySpacesData } = trpc.space.mySpaces.useQuery()
    const { data: myAsksData } = trpc.ask.myList.useQuery()
    const { editSpace } = useActionStore()

    const [value, setValue] = React.useState(0)

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue)
    }

    const { user } = useStore(authedUserStore)

    const handleEditSpace = async (spaceId: string) => {
        editSpace(spaceId)
    }

    return (
        <div>
            <Tabs value={value} onChange={handleChange} aria-label="icon tabs example" variant="fullWidth">
                <Tab
                    icon={
                        <Tooltip title={'my stats'}>
                            <QueryStatsIcon fontSize={'medium'} color={'btcgrey'} />
                        </Tooltip>
                    }
                    aria-label="stats"
                />
                <Tab
                    icon={
                        <Tooltip title={'my spaces'}>
                            <PublicIcon fontSize={'medium'} color={'btcgrey'} />
                        </Tooltip>
                    }
                    aria-label="spaces"
                />
                <Tab
                    icon={
                        <Tooltip title={'my transactions'}>
                            <PointOfSaleIcon fontSize={'medium'} color={'btcgrey'} />
                        </Tooltip>
                    }
                    aria-label="transactions"
                />
                <Tab
                    icon={
                        <Tooltip title={'my asks'}>
                            <QueueOutlinedIcon fontSize={'medium'} color={'btcgrey'} />
                        </Tooltip>
                    }
                    aria-label="asks"
                />
                <Tab
                    icon={
                        <Tooltip title={'my bumps'}>
                            <RocketLaunchOutlinedIcon fontSize={'medium'} color={'btcgrey'} />
                        </Tooltip>
                    }
                    aria-label="bumps"
                />
                <Tab
                    icon={
                        <Tooltip title={'my offers'}>
                            <HandshakeOutlinedIcon fontSize={'medium'} color={'btcgrey'} />
                        </Tooltip>
                    }
                    aria-label="offers"
                />
                <Tab
                    icon={
                        <Tooltip title={'my files'}>
                            <PermMediaOutlinedIcon fontSize={'medium'} color={'btcgrey'} />
                        </Tooltip>
                    }
                    aria-label="files"
                />
            </Tabs>
            <TabPanel value={value} index={0}>
                <div className={'break-all text-center'}>
                    {myBalanceData && (
                        <div>
                            <p>
                                My available balance is <b>{myBalanceData.availableBalance}</b> and my balance locked up
                                as bumps is <b>{myBalanceData.lockedBalance}</b>.
                            </p>
                        </div>
                    )}
                </div>
                <div className={'break-all text-center'}>
                    {myStatsData && (
                        <div>
                            <p>
                                My username is <b>@{myStatsData.userName}</b> and my public key is <br />
                                <b>{myStatsData.publicKey}</b>.<br /> I have earned <b>{myStatsData.totalEarned}</b> and
                                spent <b>{myStatsData.totalSpent}</b> on ArtiSats. I have placed{' '}
                                <b>{myStatsData.totalAsks}</b> asks and made <b>{myStatsData.totalOffers}</b> offers. I
                                have settled <b>{myStatsData.settledAsks}</b> asks and have won{' '}
                                <b>{myStatsData.settledOffers}</b> settled offers.
                            </p>
                        </div>
                    )}
                </div>
            </TabPanel>
            <TabPanel value={value} index={1}>
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
                                        {space.nsfw ? (
                                            <Tooltip title={'This space is nsfw'}>
                                                <ExplicitIcon color={'warning'} />
                                            </Tooltip>
                                        ) : (
                                            <Tooltip title={'This space is sfw'}>
                                                <NoAdultContentIcon color={'info'} />
                                            </Tooltip>
                                        )}
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
            </TabPanel>
            <TabPanel value={value} index={2}>
                <TransactionList />
            </TabPanel>
            <TabPanel value={value} index={3}>
                <div>
                    <b>open tasks with high bounties:</b>
                    <div className={'flex flex-col gap-1'}>
                        {myAsksData?.map((ask, index) => {
                            return (
                                <div
                                    key={index}
                                    className={'flex flex-row items-center gap-2 p-2 shadow-md hover:bg-gray-50'}
                                >
                                    <Link
                                        component={LinkBehaviour}
                                        href={`/ask/single/${ask?.askContext?.slug ?? ''}`}
                                        variant="body2"
                                        className={'grow'}
                                    >
                                        {ask?.askContext?.title}
                                    </Link>
                                    <div className={'flex w-48 flex-row items-center gap-1'}>
                                        <i>Sum:</i>
                                        <b>{ask.bumpSum}</b>
                                        <SatoshiIcon />
                                    </div>
                                    <div className={'flex w-12 flex-row items-center gap-1'}>
                                        <b>{ask.bumpCount}</b>
                                        <RocketLaunchOutlinedIcon color={'success'} />
                                    </div>
                                    <div className={'flex w-12 flex-row items-center gap-1'}>
                                        <b>{ask.offerCount}</b>
                                        <LocalOfferIcon color={'success'} />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </TabPanel>
            <TabPanel value={value} index={4}>
                <BumpList />
            </TabPanel>
            <TabPanel value={value} index={5}>
                <OfferList />
            </TabPanel>
            <TabPanel value={value} index={6}>
                <FileList />
            </TabPanel>
        </div>
    )
}
