import { trpc } from '~/utils/trpc'
import { TagPill } from '~/components/common/TagPill'

interface SidebarMyStatsProps {}

export const SidebarMyStats = ({}: SidebarMyStatsProps) => {
    const { data: topTagsData } = trpc.taxonomy.topTags.useQuery()

    return <div className={'flex flex-col'}>MY STATS</div>
}
