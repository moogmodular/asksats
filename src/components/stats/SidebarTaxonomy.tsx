import { trpc } from '~/utils/trpc'
import { TagPill } from '~/components/common/TagPill'
import React, { ChangeEvent, useState } from 'react'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import { Autocomplete, Checkbox, Link, TextField, Typography } from '@mui/material'
import { LinkBehaviour } from '~/components/common/LinkBehaviour'
import { SatoshiIcon } from '~/components/common/SatishiIcon'

interface SidebarTaxonomyProps {}

export const SidebarTaxonomy = ({}: SidebarTaxonomyProps) => {
    const { data: topTagsData } = trpc.taxonomy.topTags.useQuery()
    const { data: excludedTagsData } = trpc.taxonomy.excludedTagsForUser.useQuery()
    const excludeTagMutation = trpc.taxonomy.addExcludedTagForUser.useMutation()
    const unExcludeTagMutation = trpc.taxonomy.unExcludeTagForUser.useMutation()
    const { data: topSpacesData } = trpc.stats.topSpaces.useQuery()

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

    const handleSearchInput = async (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
        <div className={'flex flex-col gap-2 gap-6 pt-8'}>
            <div>
                <b>spaces:</b>
                <div className={'flex flex-col gap-1'}>
                    {topSpacesData?.map((space, index) => {
                        return (
                            <div
                                key={index}
                                className={'flex flex-row items-center gap-2 p-2 shadow-md hover:bg-gray-50'}
                            >
                                <Link
                                    component={LinkBehaviour}
                                    href={`/ask/timeline/${space.name}`}
                                    variant="body2"
                                    className={'grow'}
                                >
                                    {space.name}
                                </Link>
                                <div className={'flex w-48 flex-row items-center gap-1'}>
                                    <i>nsfw:</i>
                                    <b>{space.nsfw}</b>
                                    <SatoshiIcon />
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className={'emphasis-container'}>
                <b>top tags:</b>
                <div className={'flex flex-row gap-2'}>
                    {topTagsData?.map((tag, index) => {
                        return (
                            <div key={index} className={'flex flex-row items-center justify-between gap-1'}>
                                <TagPill key={tag.id} tagValue={tag.name} />
                                <div>{tag.askCount}</div>
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className={'emphasis-container overflow-x-auto'}>
                <b>my excluded tags:</b>
                <List>
                    {excludedTagsData?.map((tag, index) => {
                        return (
                            <ListItem key={index} disablePadding>
                                <ListItemButton>
                                    <ListItemIcon>
                                        <Checkbox checked={true} onChange={() => handleUncheckTag(tag.name)} />
                                    </ListItemIcon>
                                    <TagPill key={tag.id} tagValue={tag.name} />
                                </ListItemButton>
                            </ListItem>
                        )
                    })}
                </List>
                <Autocomplete
                    disablePortal
                    id="combo-box-demo"
                    options={possibleTags}
                    sx={{ width: 300 }}
                    renderInput={(params) => (
                        <TextField {...params} label="Add a tag" onChange={(e) => handleSearchInput(e)} />
                    )}
                    renderOption={(props, option) => {
                        return <Typography onClick={() => handleAddTag(option)}>{option}</Typography>
                    }}
                />
            </div>
        </div>
    )
}
