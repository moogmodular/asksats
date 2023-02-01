import { useState } from 'react'
import { SidebarStats } from '~/components/stats/SidebarStats'
import { SidebarTaxonomy } from '~/components/stats/SidebarTaxonomy'
import { SidebarMyStats } from '~/components/stats/SidebarMyStats'
import { SidebarAbout } from '~/components/stats/SidebarAbout'
import { Tabs } from '@mui/material'
import Tab from '@mui/material/Tab'

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
        <div className={'no-scrollbar flex flex-col justify-center gap-2 overflow-y-scroll text-btcgrey'}>
            <div className={'grow'}>
                <Tabs
                    value={currentTab}
                    variant={'fullWidth'}
                    onChange={(event, value) => setCurrentTab(value)}
                    aria-label="basic tabs example"
                >
                    <Tab id={'sidebar-tabs-stats'} value={'stats'} label="Stats" />
                    <Tab id={'sidebar-tabs-taxonomy'} value={'taxonomy'} label="Taxonomy" />
                    <Tab id={'sidebar-tabs-myStats'} value={'myStats'} label="My Stats" />
                    <Tab id={'sidebar-tabs-about'} value={'about'} label="About" />
                </Tabs>
                {
                    {
                        stats: <SidebarStats />,
                        about: <SidebarAbout />,
                        taxonomy: <SidebarTaxonomy />,
                        myStats: <SidebarMyStats />,
                    }[currentTab]
                }
            </div>
        </div>
    )
}
