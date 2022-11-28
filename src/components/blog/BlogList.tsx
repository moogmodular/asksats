import { trpc } from '~/utils/trpc'
import { BlogItemView } from '~/components/blog/BlogItemView'
import useAuthStore from '~/store/useAuthStore'
import { CreateBlogItem } from '~/components/blog/CreateBlogItem'

interface BlogListProps {}

export const BlogList = ({}: BlogListProps) => {
    const { user } = useAuthStore()
    const { data: blogListData } = trpc.blog.listBlogItems.useQuery()

    return (
        <div
            className={
                'no-scrollbar flex max-h-screen w-full flex-col gap-2 overflow-x-hidden overflow-y-scroll overscroll-auto pb-12'
            }
        >
            {user?.role === 'ADMIN' ? <CreateBlogItem /> : null}
            {blogListData &&
                blogListData.map((blogItem, index) => {
                    return <BlogItemView key={index} blogItem={blogItem} />
                })}
        </div>
    )
}
