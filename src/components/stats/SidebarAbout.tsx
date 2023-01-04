import { trpc } from '~/utils/trpc'
import { MDRender } from '~/components/common/MDRender'

interface SidebarAboutProps {}

export const SidebarAbout = ({}: SidebarAboutProps) => {
    const { data } = trpc.staticData.aboutMessage.useQuery()
    return (
        <div className={'prose flex flex-col pt-8'}>
            <h2>About:</h2>
            {/*TODO: is there a way to make this smaller, looks weird on*/}
            {data && <MDRender content={data.message} />}
        </div>
    )
}
