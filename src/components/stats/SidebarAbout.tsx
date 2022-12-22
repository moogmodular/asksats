import { trpc } from '~/utils/trpc'
import { MDRender } from '~/components/common/MDRender'

interface SidebarAboutProps {}

export const SidebarAbout = ({}: SidebarAboutProps) => {
    const { data } = trpc.staticData.aboutMessage.useQuery()
    return (
        <div className={'prose flex flex-col'}>
            <h2>About:</h2>

            {data && <MDRender content={data.message} />}
        </div>
    )
}
