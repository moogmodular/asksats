import Link from 'next/link'
import { trpc } from '~/utils/trpc'
import { Countdown } from '~/components/common/Countdown'
import { SubHeaderToolbarHeader } from '~/components/layout/SubHeaderToolbar'
import { TagPill } from '~/components/common/TagPill'
import { useState } from 'react'

interface SidebarAboutProps {}

export const SidebarAbout = ({}: SidebarAboutProps) => {
    return (
        <div className={'prose flex flex-col'}>
            <h2>About:</h2>

            <p>Aks sats is a Layer 3 Custodial Image (and soon other media) sharing platform where users can </p>
        </div>
    )
}
