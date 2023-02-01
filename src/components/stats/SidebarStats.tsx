import { Link } from '@mui/material'
import { trpc } from '~/utils/trpc'
import { IconPropertyDisplay } from '~/components/common/IconPropertyDisplay'
import { SatoshiIcon } from '~/components/common/SatishiIcon'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import { LinkBehaviour } from '~/components/common/LinkBehaviour'
import { CreateOffer } from '~/components/offer/CreateOffer'
import React from 'react'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined'

interface SidebarStatsProps {}

export const SidebarStats = ({}: SidebarStatsProps) => {
    const { data: oldestTopBountyNotSettledData } = trpc.stats.oldestTopBountyNotSettled.useQuery()
    const { data: topEarnersData } = trpc.stats.topEarners.useQuery()
    const { data: topSpendersData } = trpc.stats.topSpenders.useQuery()
    const { data: biggestGrossingAsksData } = trpc.stats.biggestGrossingAsks.useQuery()
    const { data: siteStatsData } = trpc.stats.siteStats.useQuery()

    return (
        <div className={'flex flex-col gap-6 pt-8'}>
            <div>
                <b>site:</b>
                <div>
                    {siteStatsData && (
                        <p>
                            This site has a total of <b>{siteStatsData.userCount} users</b>, that requested{' '}
                            <b>{siteStatsData.askCount} asks</b>, provided <b>{siteStatsData.offerCount} offers</b> that
                            were bumped with <b>{siteStatsData.bumpCount} bumps</b> with a potential value of{' '}
                            <b>{siteStatsData.totalEarned}</b>{' '}
                            <span>
                                <SatoshiIcon />
                            </span>
                            .
                        </p>
                    )}
                </div>
            </div>
            <div>
                <b>open tasks with high bounties:</b>
                <div className={'flex flex-col gap-1'}>
                    {oldestTopBountyNotSettledData?.map((ask, index) => {
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
            <div>
                <b>by gross:</b>
                <div>
                    {biggestGrossingAsksData?.map((ask, index) => {
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
                                <div className={'flex w-48 flex-row items-center'}>
                                    <i>Sum:</i>
                                    <b>{ask.grossed}</b>
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
            <div className={'flex flex-col gap-1 lg:flex-row'}>
                <div className={'emphasis-container lg:w-1/2'}>
                    <b>top earners:</b>
                    <div>
                        {topEarnersData?.map((user, index) => {
                            return (
                                <div key={index} className={'flex flex-row items-center gap-1'}>
                                    <div className={'grow'}>
                                        <IconPropertyDisplay identifier={'userName'} value={user.userName} link={true}>
                                            <AccountCircleIcon fontSize={'small'} />
                                        </IconPropertyDisplay>
                                    </div>
                                    <div className={'flex flex-row items-center'}>
                                        {user.totalEarned}
                                        <SatoshiIcon />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
                <div className={'emphasis-container lg:w-1/2'}>
                    <b>top spenders:</b>
                    <div>
                        {topSpendersData?.map((user, index) => {
                            return (
                                <div key={index} className={'flex flex-row items-center gap-1'}>
                                    <div className={'grow'}>
                                        <IconPropertyDisplay identifier={'userName'} value={user.userName} link={true}>
                                            <AccountCircleIcon fontSize={'small'} />
                                        </IconPropertyDisplay>
                                    </div>
                                    <div className={'flex flex-row items-center'}>
                                        {user.totalEarned}
                                        <SatoshiIcon />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}
