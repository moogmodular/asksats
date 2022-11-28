import { trpc } from '~/utils/trpc'
import { CommentDisplay } from '~/components/comments/CommentDisplay'

interface CommentListProps {
    askId: string
}

export const CommentList = ({ askId }: CommentListProps) => {
    const { data: commentsForAsk } = trpc.comment.commentTreeForAsk.useQuery({ askId })

    return (
        <div className={'flex flex-col gap-1'}>
            {commentsForAsk &&
                commentsForAsk.map((comment) => {
                    return <CommentDisplay key={comment.id} comment={comment} />
                })}
        </div>
    )
}
