import { SubHeaderToolbarHeader } from '~/components/layout/SubHeaderToolbar'
import { useState } from 'react'
import { SidebarStats } from '~/components/layout/SidebarStats'
import { SidebarTaxonomy } from '~/components/layout/SidebarTaxonomy'
import { SidebarMyStats } from '~/components/layout/SidebarMyStats'
import { SidebarAbout } from '~/components/layout/SidebarAbout'

interface SidebarProps {}

const tabs = {
    stats: {
        label: 'Stats',
    },
    myStats: {
        label: 'My Stats',
    },
    taxonomy: {
        label: 'Taxonomy',
    },
    about: {
        label: 'About',
    },
}

type Tab = keyof typeof tabs

export const Sidebar = ({}: SidebarProps) => {
    const [currentTab, setCurrentTab] = useState<Tab>('stats')

    return (
        <div className={'no-scrollbar flex flex-col justify-center gap-2 overflow-y-scroll'}>
            <SubHeaderToolbarHeader />
            <div className="divider"></div>
            <div className="tabs w-full">
                {Object.entries(tabs).map((tab, index) => {
                    return tab[0] === currentTab ? (
                        <a
                            onClick={() => setCurrentTab(tab[0] as Tab)}
                            className="tab tab-bordered tab-active tab-md md:tab-lg"
                        >
                            {tab[1].label}
                        </a>
                    ) : (
                        <a onClick={() => setCurrentTab(tab[0] as Tab)} className="tab tab-bordered tab-md md:tab-lg">
                            {tab[1].label}
                        </a>
                    )
                })}
            </div>
            {
                {
                    stats: <SidebarStats />,
                    about: <SidebarAbout />,
                    taxonomy: <SidebarTaxonomy />,
                    myStats: <SidebarMyStats />,
                }[currentTab]
            }
        </div>
    )
}
