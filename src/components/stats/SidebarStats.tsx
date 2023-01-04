import { Link } from '@mui/material'
import { trpc } from '~/utils/trpc'
import { CountdownDisplay } from '~/components/common/CountdownDisplay'
import { CountdownProgress } from '~/components/common/CountdownProgress'
import { IconPropertyDisplay } from '~/components/common/IconPropertyDisplay'
import { intervalToDuration } from 'date-fns'
import { SatoshiIcon } from '~/components/common/SatishiIcon'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import { LinkBehaviour } from '~/components/common/LinkBehaviour'

interface SidebarStatsProps {}

export const SidebarStats = ({}: SidebarStatsProps) => {
    const { data: endingSoonData } = trpc.stats.endingSoon.useQuery()
    const { data: topEarnersData } = trpc.stats.topEarners.useQuery()
    const { data: topSpendersData } = trpc.stats.topSpenders.useQuery()
    const { data: biggestGrossingAsksData } = trpc.stats.biggestGrossingAsks.useQuery()
    const { data: siteStatsData } = trpc.stats.siteStats.useQuery()

    return (
        <div className={'flex flex-col gap-6 pt-8'}>
            <div className={'emphasis-container'}>
                <b>ending soon:</b>
                <div className={'flex flex-col gap-1'}>
                    {endingSoonData?.map((ask, index) => {
                        return (
                            <div key={index} className={'flex flex-row items-center gap-4'}>
                                <Link
                                    component={LinkBehaviour}
                                    href={`/ask/single/${ask?.askContext?.slug ?? ''}`}
                                    variant="body2"
                                    className={'w-2/5'}
                                >
                                    {ask?.askContext?.title}
                                </Link>
                                <div className={'w-1/5 text-center'}>
                                    <CountdownDisplay endDate={ask.deadlineAt ?? new Date()} />
                                </div>
                                <div className={'hidden w-2/5 border-r border-l border-black lg:block'}>
                                    <CountdownProgress
                                        creationDate={ask.createdAt}
                                        endDate={ask.deadlineAt}
                                        acceptedDate={ask.acceptedDeadlineAt}
                                        status={ask.status}
                                    />
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
            <div className={'emphasis-container'}>
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
            <div className={'emphasis-container'}>
                <b>by gross:</b>
                <div>
                    {biggestGrossingAsksData?.map((ask, index) => {
                        return (
                            <div key={index} className={'flex flex-row items-center gap-1'}>
                                <Link
                                    component={LinkBehaviour}
                                    href={`/ask/single/${ask?.askContext?.slug ?? ''}`}
                                    variant="body2"
                                    className={'w-2/5'}
                                >
                                    {ask?.askContext?.title}
                                </Link>
                                <div className={'flex flex-row items-center'}>
                                    {ask.grossed}
                                    <SatoshiIcon />
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
