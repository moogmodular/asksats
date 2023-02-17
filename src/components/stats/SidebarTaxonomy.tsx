import { trpc } from '~/utils/trpc'
import React from 'react'
import { Link, Tooltip } from '@mui/material'
import { LinkBehaviour } from '~/components/common/LinkBehaviour'
import NoAdultContentIcon from '@mui/icons-material/NoAdultContent'
import ExplicitIcon from '@mui/icons-material/Explicit'

interface SidebarTaxonomyProps {}

export const SidebarTaxonomy = ({}: SidebarTaxonomyProps) => {
    const { data: topSpacesData } = trpc.stats.topSpaces.useQuery()

    return (
        <div className={'flex flex-col gap-2 gap-6 pt-8'}>
            <div>
                <b>spaces:</b>
                <div className={'flex flex-col gap-1'}>
                    {topSpacesData?.map((space, index) => {
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
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
