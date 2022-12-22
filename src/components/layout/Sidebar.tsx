import { SubHeaderToolbarHeader } from '~/components/layout/SubHeaderToolbar'
import { useState } from 'react'
import { SidebarStats } from '~/components/stats/SidebarStats'
import { SidebarTaxonomy } from '~/components/stats/SidebarTaxonomy'
import { SidebarMyStats } from '~/components/stats/SidebarMyStats'
import { SidebarAbout } from '~/components/stats/SidebarAbout'
import { Box, Tabs } from '@mui/material'
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

const a11yProps = (index: number) => ({
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
})

export const Sidebar = ({}: SidebarProps) => {
    const [currentTab, setCurrentTab] = useState<Tab>('stats')

    return (
        <div className={'no-scrollbar flex h-full flex-col justify-center gap-2 overflow-y-scroll'}>
            <SubHeaderToolbarHeader />
            <div className={'grow'}>
                <Tabs
                    value={currentTab}
                    variant={'fullWidth'}
                    onChange={(event, value) => setCurrentTab(value)}
                    aria-label="basic tabs example"
                >
                    <Tab value={'stats'} label="Stats" />
                    <Tab value={'taxonomy'} label="Taxonomy" />
                    <Tab value={'myStats'} label="My Stats" />
                    <Tab value={'about'} label="About" />
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
