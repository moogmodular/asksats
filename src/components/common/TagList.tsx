import { RouterOutput } from '~/utils/trpc'
import { TagPill } from '~/components/common/TagPill'

type TagOutput = RouterOutput['ask']['list']['items'][0]['tags']

interface TagListProps {
    tags: TagOutput
}

export const TagList = ({ tags }: TagListProps) => {
    return (
        <div className={'flex flex-row flex-wrap gap-2'}>
            {tags.map((tag) => {
                return <TagPill key={tag.tag.id} tagValue={tag.tag.name} />
            })}
        </div>
    )
}
