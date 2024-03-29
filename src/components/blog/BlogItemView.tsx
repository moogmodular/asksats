import { MDRender } from '~/components/common/MDRender'
import { RouterOutput } from '~/utils/trpc'
import { CreateBlogItem } from '~/components/blog/CreateBlogItem'
import { useBlogUXStore } from '~/store/blogUXStore'
import { format } from 'date-fns'
import { standardDateFormat } from '~/utils/date'
import { Button } from '@mui/material'

type BlogItemViewInput = RouterOutput['blog']['listBlogItems'][0]

interface BlogItemViewProps {
    blogItem: BlogItemViewInput
}

export const BlogItemView = ({ blogItem }: BlogItemViewProps) => {
    const { currentOpenModalId, setCurrentOpenModalId } = useBlogUXStore()

    return (
        <div className={'content-block'}>
            {blogItem.title && <h1 className={'py-2 text-3xl'}>{blogItem.title}</h1>}
            <div className={'flex flex-col'}>
                <i>author: {blogItem.user.userName}</i>
                <i>created: {format(blogItem.createdAt ?? 0, standardDateFormat)}</i>
            </div>
            <div className={'py-6'}>
                <MDRender content={blogItem.body ?? ''} />
            </div>
            <div className={'flex flex-col gap-2'}>
                {blogItem.children && blogItem.children.length > 0
                    ? blogItem.children.map((comment, index) => {
                          return (
                              <div key={index}>
                                  <BlogItemView blogItem={comment} />
                              </div>
                          )
                      })
                    : null}
            </div>
            {currentOpenModalId === blogItem.id ? (
                <CreateBlogItem parentId={blogItem.id} />
            ) : (
                <Button variant={'contained'} component="div" onClick={() => setCurrentOpenModalId(blogItem.id)}>
                    Add comment
                </Button>
            )}
        </div>
    )
}
