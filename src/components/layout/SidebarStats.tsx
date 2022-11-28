import Link from 'next/link'
import { trpc } from '~/utils/trpc'
import { Countdown } from '~/components/common/Countdown'
import { SubHeaderToolbarHeader } from '~/components/layout/SubHeaderToolbar'
import { TagPill } from '~/components/common/TagPill'
import { useState } from 'react'

interface SidebarStatsProps {}

export const SidebarStats = ({}: SidebarStatsProps) => {
    const { data: endingSoonData } = trpc.stats.endingSoon.useQuery()
    const { data: topEarnersData } = trpc.stats.topEarners.useQuery()
    const { data: topSpendersData } = trpc.stats.topSpenders.useQuery()
    const { data: biggestGrossingAsksData } = trpc.stats.biggestGrossingAsks.useQuery()
    const { data: topTagsData } = trpc.taxonomy.topTags.useQuery()

    return (
        <div className={'flex flex-col'}>
            <div>
                ending soon:{' '}
                <div>
                    {endingSoonData?.map((ask, index) => {
                        return (
                            <div key={index} className={'flex flex-row items-center gap-1'}>
                                <Link href={`/ask/single/${ask?.askContext?.slug ?? ''}`}>
                                    <div className={'link'}>{ask?.askContext?.title}</div>
                                </Link>
                                <Countdown endDate={ask.deadlineAt ?? new Date()} />
                            </div>
                        )
                    })}
                </div>
            </div>
            <div>
                by gross:{' '}
                <div>
                    {biggestGrossingAsksData?.map((ask, index) => {
                        return (
                            <div key={index} className={'flex flex-row items-center gap-1'}>
                                <Link href={`/ask/single/${ask?.askContext?.slug ?? ''}`}>
                                    <div className={'link'}>{ask?.askContext?.title}</div>
                                </Link>
                                <div>{ask.grossed}</div>
                            </div>
                        )
                    })}
                </div>
            </div>
            <div>
                top tags:{' '}
                <div>
                    {topTagsData?.map((tag, index) => {
                        return (
                            <div key={index} className={'flex flex-row items-center gap-1'}>
                                <TagPill key={tag.id} tagValue={tag.name} />
                                <div>{tag.askCount}</div>
                            </div>
                        )
                    })}
                </div>
            </div>
            <div>
                top earners:{' '}
                <div>
                    {topEarnersData?.map((user, index) => {
                        return (
                            <div key={index} className={'flex flex-row items-center gap-1'}>
                                <div>{user.userName}</div>
                                <div>{user.totalEarned}</div>
                            </div>
                        )
                    })}
                </div>
            </div>
            <div>
                top spenders:{' '}
                <div>
                    {topSpendersData?.map((user, index) => {
                        return (
                            <div key={index} className={'flex flex-row items-center gap-1'}>
                                <div>{user.userName}</div>
                                <div>{user.totalEarned}</div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
