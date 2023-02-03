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
    spaces: {
        label: 'Spaces',
    },
    about: {
        label: 'About',
    },
}

type Tab = keyof typeof tabs

export const Sidebar = ({}: SidebarProps) => {
    const [currentTab, setCurrentTab] = useState<Tab>('stats')

    return (
        <div className={'flex flex-col justify-center gap-2 text-btcgrey'}>
            <div className={'grow'}>
                <Tabs
                    value={currentTab}
                    variant={'fullWidth'}
                    onChange={(event, value) => setCurrentTab(value)}
                    aria-label="basic tabs example"
                >
                    <Tab id={'sidebar-tabs-stats'} value={'stats'} label="Stats" />
                    <Tab id={'sidebar-tabs-spaces'} value={'spaces'} label="Spaces" />
                    <Tab id={'sidebar-tabs-myStats'} value={'myStats'} label="My Stats" />
                    <Tab id={'sidebar-tabs-about'} value={'about'} label="About" />
                </Tabs>
                {
                    {
                        stats: <SidebarStats />,
                        about: <SidebarAbout />,
                        spaces: <SidebarTaxonomy />,
                        myStats: <SidebarMyStats />,
                    }[currentTab]
                }
            </div>
        </div>
    )
}
