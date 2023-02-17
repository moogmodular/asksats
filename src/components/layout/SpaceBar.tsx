import { RouterOutput, trpc } from '~/utils/trpc'
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Autocomplete,
    Avatar,
    Button,
    CircularProgress,
    IconButton,
    TextField,
    Tooltip,
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd'
import { useActionStore } from '~/store/actionStore'
import { SubHeaderToolbarHeader } from '~/components/layout/SubHeaderToolbar'
import ArrowDropDownCircleIcon from '@mui/icons-material/ArrowDropDownCircle'
import useMediaQuery from '@mui/material/useMediaQuery'
import EditIcon from '@mui/icons-material/Edit'
import { useStore } from 'zustand'
import { authedUserStore } from '~/store/authedUserStore'
import ExplicitIcon from '@mui/icons-material/Explicit'
import NoAdultContentIcon from '@mui/icons-material/NoAdultContent'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import { IconPropertyDisplay } from '~/components/common/IconPropertyDisplay'
import { format } from 'date-fns'
import { standardDateFormat } from '~/utils/date'
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled'
import { SPACE_CREATION_COST, SPACE_OWNER } from '~/server/service/constants'
import InfoIcon from '@mui/icons-material/Info'

type Space = RouterOutput['space']['list'][0]
type SpaceWithImage = RouterOutput['space']['spaceInfo']

export const SpaceBar = ({}) => {
    const utils = trpc.useContext()
    const { setCurrentModal, editSpace } = useActionStore()

    const { user } = useStore(authedUserStore)

    const matches = useMediaQuery('(min-width:1024px)')

    const [expanded, setExpanded] = useState(false)

    const [open, setOpen] = useState(false)
    const [options, setOptions] = useState<Pick<Space, 'name' | 'nsfw'>[]>([])
    const [value, setValue] = useState<Pick<Space, 'name' | 'nsfw'> | undefined>({ name: 'all', nsfw: false })
    const [inputValue, setInputValue] = useState('')

    const [spaceInfo, setSpaceInfo] = useState<SpaceWithImage | undefined>(undefined)

    const router = useRouter()
    const loading = open && options.length === 0

    const toggleAccordion = () => {
        setExpanded(!expanded)
    }

    useEffect(() => {
        let active = true

        if (!loading) {
            return undefined
        }

        utils.space.list.fetch().then((data) => {
            if (active) {
                setOptions([{ name: 'all', nsfw: false }, ...data])
            }
        })

        return () => {
            active = false
        }
    }, [loading])

    useEffect(() => {
        if (!open) {
            setOptions([])
        }
    }, [open])

    useEffect(() => {
        setValue({ name: router.query.space as string, nsfw: false })
        if (router.query.space === undefined || router.query.space === 'all') {
            setExpanded(false)

            setSpaceInfo({ name: 'all', nsfw: false, description: '', headerImageId: '', headerImageUrl: '' })
        } else {
            utils.space.spaceInfo.fetch({ spaceName: router.query.space as string }).then((data) => {
                setSpaceInfo(data)
            })
        }
    }, [router.query.space])

    const handleEditSpace = async (spaceId: string) => {
        editSpace(spaceId)
    }

    return (
        <Accordion expanded={expanded}>
            <AccordionSummary
                sx={{ cursor: 'unset !important' }}
                expandIcon={
                    spaceInfo?.name === 'all' ? null : (
                        <ArrowDropDownCircleIcon
                            fontSize={'large'}
                            color={'primary'}
                            style={{ cursor: 'pointer' }}
                            onClick={() => toggleAccordion()}
                        />
                    )
                }
                className={'flex flex-row  p-2'}
                aria-controls="panel1bh-content"
                id="panel1bh-header"
            >
                <div className={'flex grow flex-row items-center'}>
                    <Autocomplete
                        value={value}
                        disableClearable={true}
                        onChange={(event: any, newValue: Pick<Space, 'name' | 'nsfw'> | null) => {
                            if (!newValue) return
                            setValue(newValue)
                            void router.push(`/ask/timeline/${newValue.name}`)
                        }}
                        size="small"
                        isOptionEqualToValue={(option, value) => option.name === value.name}
                        open={open}
                        onOpen={() => {
                            setOpen(true)
                        }}
                        onClose={() => {
                            setOpen(false)
                        }}
                        getOptionLabel={(option) => option.name}
                        inputValue={inputValue}
                        onInputChange={(event, newInputValue) => {
                            setInputValue(newInputValue)
                        }}
                        id="controllable-states-demo"
                        options={options}
                        sx={{ width: 300 }}
                        renderOption={(props, option, { selected }) => (
                            <li
                                {...props}
                                className={'flex cursor-pointer flex-row justify-center justify-between p-2'}
                            >
                                <div>{option.name}</div>
                                <div>
                                    {option.nsfw ? (
                                        <Tooltip title={'This space is nsfw'}>
                                            <ExplicitIcon color={'warning'} />
                                        </Tooltip>
                                    ) : (
                                        <Tooltip title={'This space is sfw'}>
                                            <NoAdultContentIcon color={'info'} />
                                        </Tooltip>
                                    )}
                                </div>
                            </li>
                        )}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Space"
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                        <>
                                            {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                            {params.InputProps.endAdornment}
                                        </>
                                    ),
                                }}
                            />
                        )}
                    />
                    <Tooltip title={'Create a space'}>
                        <IconButton
                            color="primary"
                            id="select-quick-edit"
                            component="label"
                            onClick={(e) => setCurrentModal('createSpace')}
                        >
                            <PlaylistAddIcon fontSize={'medium'} color={'primary'} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip
                        title={`creating a space costs ${SPACE_CREATION_COST} but space creators/mods get a cut of [total bounty * ${SPACE_OWNER}] of the bounty`}
                    >
                        <InfoIcon />
                    </Tooltip>
                </div>

                {matches ? <SubHeaderToolbarHeader /> : null}
            </AccordionSummary>
            <AccordionDetails>
                {spaceInfo && (
                    <div className={'flex flex-col gap-4'}>
                        <img src={spaceInfo.headerImageUrl} className={'h-96 object-cover'} />
                        <div className={'flex flex-row justify-between gap-4'}>
                            <div className={'flex flex-col'}>
                                <div className={'text-2xl'}>{spaceInfo.name}</div>
                            </div>
                            <div className={'flex flex-row items-center gap-4'}>
                                {user?.id === spaceInfo.creatorId && (
                                    <Button
                                        id="cancel-ask-button"
                                        variant="contained"
                                        color="info"
                                        component="div"
                                        size={'small'}
                                        onClick={() => handleEditSpace(spaceInfo.id ?? '')}
                                        startIcon={<EditIcon />}
                                    >
                                        edit
                                    </Button>
                                )}
                                {spaceInfo.nsfw ? (
                                    <Tooltip title={'This space is nsfw'}>
                                        <ExplicitIcon color={'warning'} />
                                    </Tooltip>
                                ) : (
                                    <Tooltip title={'This space is sfw'}>
                                        <NoAdultContentIcon color={'info'} />
                                    </Tooltip>
                                )}
                                <div className={'text-lg'}>
                                    <div className={'flex flex-row gap-2'}>
                                        {spaceInfo.creator && (
                                            <Avatar alt="User avatar" src={spaceInfo.creator.profileImage ?? ''} />
                                        )}
                                        <div className={'flex flex-col'}>
                                            <IconPropertyDisplay
                                                identifier={'userName'}
                                                value={spaceInfo.creator?.userName}
                                                link={true}
                                            >
                                                <AccountCircleIcon fontSize={'small'} />
                                            </IconPropertyDisplay>
                                            <IconPropertyDisplay
                                                identifier={'createdAt'}
                                                value={format(spaceInfo.createdAt ?? 0, standardDateFormat)}
                                            >
                                                <PlayCircleFilledIcon fontSize={'small'} />
                                            </IconPropertyDisplay>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={'flex flex-row justify-between'}>
                            <div className={'text-lg'}>{spaceInfo.description}</div>
                        </div>
                    </div>
                )}
            </AccordionDetails>
        </Accordion>
    )
}
