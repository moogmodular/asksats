import { trpc } from '~/utils/trpc'
import { TagPill } from '~/components/common/TagPill'
import { ChangeEvent, useState } from 'react'

interface SidebarTaxonomyProps {}

export const SidebarTaxonomy = ({}: SidebarTaxonomyProps) => {
    const { data: topTagsData } = trpc.taxonomy.topTags.useQuery()
    const { data: excludedTagsData } = trpc.taxonomy.excludedTagsForUser.useQuery()
    const excludeTagMutation = trpc.taxonomy.addExcludedTagForUser.useMutation()
    const unExcludeTagMutation = trpc.taxonomy.unExcludeTagForUser.useMutation()
    const utils = trpc.useContext()

    const [possibleTags, setPossibleTags] = useState<string[]>([])

    const handleUncheckTag = async (tagName: string) => {
        await unExcludeTagMutation.mutateAsync({ tagName })
        utils.taxonomy.invalidate()
    }

    const handleAddTag = async (tagName: string) => {
        await excludeTagMutation.mutateAsync({ tagName })
        utils.taxonomy.invalidate()
    }

    const handleSearchInput = async (e: ChangeEvent<HTMLInputElement>) => {
        const searchTerm = e.target.value
        console.log(searchTerm)
        await utils.taxonomy.searchTags.fetch({ search: searchTerm }).then((data) => {
            const tagResults = data.map((tag) => tag.name)
            const contains = tagResults.includes(searchTerm)
            if (!contains) {
                setPossibleTags([searchTerm, ...tagResults])
            } else {
                setPossibleTags(tagResults)
            }
        })
    }

    return (
        <div className={'flex flex-col'}>
            <div>
                top tags:
                <div>
                    {topTagsData?.map((tag, index) => {
                        return (
                            <div key={index} className={'flex flex-row items-center gap-1'}>
                                <TagPill key={tag.id} tagValue={tag.name} />
                                <div>{tag.askCount}</div>
                            </div>
                        )
                    })}
                </div>
            </div>
            <div>
                my excluded tags:
                <div className="overflow-x-auto">
                    <table className="table w-full">
                        <thead>
                            <tr>
                                <th></th>
                                <th>Tag name</th>
                            </tr>
                        </thead>
                        <tbody>
                            {excludedTagsData?.map((tag, index) => {
                                return (
                                    <tr key={index}>
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={true}
                                                onChange={() => handleUncheckTag(tag.name)}
                                                className="checkbox"
                                            />
                                        </td>
                                        <td>
                                            <TagPill key={tag.id} tagValue={tag.name} />
                                        </td>
                                    </tr>
                                )
                            })}
                            <tr>
                                <td>
                                    <input type="checkbox" checked={false} className="checkbox" />
                                </td>
                                <td>
                                    <div className="flex flex-row items-center gap-2">
                                        <input
                                            type="text"
                                            placeholder=""
                                            className="input-bordered input-primary input input-xs w-full lg:input-sm"
                                            onChange={(e) => handleSearchInput(e)}
                                        />
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="currentColor"
                                            className="h-4 w-4"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                                            />
                                        </svg>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <ul className="menu w-56 bg-base-100">
                        {possibleTags.map((tag, index) => {
                            return (
                                <li key={index} onClick={() => handleAddTag(tag)}>
                                    <a>{tag}</a>
                                </li>
                            )
                        })}
                    </ul>
                </div>
            </div>
        </div>
    )
}
