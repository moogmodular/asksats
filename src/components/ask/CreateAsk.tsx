import { z } from 'zod'
import { useZodForm } from '~/utils/useZodForm'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { $createParagraphNode, $createTextNode, $getRoot, EditorState, EditorThemeClasses } from 'lexical'
import { ChangeEvent, SyntheticEvent, useEffect, useRef, useState } from 'react'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { $rootTextContent } from '@lexical/text'
import { MDRender } from '~/components/common/MDRender'
import { RouterInput, RouterOutput, trpc } from '~/utils/trpc'
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary'
import { useActionStore } from '~/store/actionStore'
import { useMessageStore } from '~/store/messageStore'
import { TagPill } from '~/components/common/TagPill'
import { askTextDefault, bumpInfoText } from '~/server/service/constants'
import {
    Autocomplete,
    Button,
    Checkbox,
    CircularProgress,
    FormControl,
    FormControlLabel,
    InputLabel,
    MenuItem,
    Select,
    Tabs,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material'
import useMediaQuery from '@mui/material/useMediaQuery'
import InfoIcon from '@mui/icons-material/Info'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import Tab from '@mui/material/Tab'

type CreateAskInput = RouterInput['ask']['create']
type Space = RouterOutput['space']['list'][0]

export const createAskInput = z.object({
    title: z.string().min(6).max(80),
    content: z.string().max(2000),
    amount: z.number().min(1),
    space: z.string(),
    tags: z.array(z.string().max(32)).max(5).optional(),
    headerImageId: z.string().optional(),
    askKind: z.enum(['PUBLIC', 'BUMP_PUBLIC', 'PRIVATE']),
})

export const uploadedImageById = z.object({
    imageId: z.string(),
})

interface CreateAskProps {}

export const CreateAsk = ({}: CreateAskProps) => {
    const { closeModal } = useActionStore()
    const { showToast } = useMessageStore()
    const utils = trpc.useContext()
    const [tempEditorState, setTempEditorState] = useState<string>(askTextDefault)
    const [editorView, setEditorView] = useState<'edit' | 'preview'>('edit')
    const [uploadedImageId, setUploadedImageId] = useState<string | null>(null)
    const [uploadedImage, setUploadedImage] = useState<string | null>(null)
    const [tags, setTags] = useState<{ label: string; id: string; isNew: boolean }[]>([])
    const [possibleTags, setPossibleTags] = useState<{ label: string; id: string; isNew: boolean }[]>([])
    const matches = useMediaQuery('(min-width:1024px)')

    const [open, setOpen] = useState(false)
    const [options, setOptions] = useState<Space[]>([])
    const loading = open && options.length === 0

    useEffect(() => {
        let active = true

        if (!loading) {
            return undefined
        }

        utils.space.list.fetch().then((data) => {
            if (active) {
                setOptions(data)
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

    const inputRef = useRef<HTMLInputElement>(null)

    const createAskMutation = trpc.ask.create.useMutation()

    const {
        register,
        handleSubmit,
        getValues,
        setValue,
        watch,
        formState: { errors },
    } = useZodForm({
        schema: createAskInput,
        defaultValues: {
            title: '',
            content: '',
            space: '',
            askKind: 'PUBLIC',
            amount: 100,
            headerImageId: '',
        },
    })

    const onError = (error: Error) => {
        console.error(error)
    }

    const theme: EditorThemeClasses = {}

    const initialConfig = {
        editorState: () => {
            const root = $getRoot()
            const pNode = $createParagraphNode()
            pNode.append($createTextNode(tempEditorState))
            root.append(pNode)
            return
        },
        namespace: 'Editor',
        theme,
        onError,
    }

    const onSubmit = async (data: CreateAskInput) => {
        console.log(data)
        try {
            await createAskMutation.mutateAsync({
                title: data.title,
                askKind: data.askKind,
                space: data.space,
                amount: data.amount,
                tags: tags.map((t) => t.label),
                headerImageId: uploadedImageId ?? '',
                content: tempEditorState,
            })
            showToast('success', 'Ask created')
            await utils.ask.invalidate()
            closeModal()
        } catch (error: any) {
            showToast('error', error.message)
            await utils.ask.invalidate()
        }
    }

    const handleSearchInput = async (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const searchTerm = e.target.value
        console.log(searchTerm)
        await utils.taxonomy.searchTags.fetch({ search: searchTerm }).then((data) => {
            const tagResults = data.map((tag) => {
                return {
                    label: tag.name,
                    id: tag.id,
                    isNew: false,
                }
            })
            console.log(tagResults)
            const contains = tagResults.some((name) => name.label === searchTerm)
            if (!contains) {
                setPossibleTags([{ label: searchTerm, isNew: true, id: '0' }, ...tagResults])
            } else {
                setPossibleTags(tagResults)
            }
        })
    }

    const handleFileChange = async (data: File | undefined) => {
        if (data) {
            const url = await utils.asset.preSignedUrl.fetch()

            setUploadedImageId(url.imageId)

            const ulData = { ...url.uploadUrl.fields, 'Content-Type': data.type, file: data } as Record<string, any>

            const formData = new FormData()
            for (const name in ulData) {
                formData.append(name, ulData[name])
            }

            await fetch(url.uploadUrl.url.replace('//', '//asksats.'), {
                method: 'POST',
                body: formData,
            })

            const uploadedImage = await utils.asset.uploadedImageById.fetch({
                imageId: url.imageId,
            })

            setUploadedImage(uploadedImage)

            return
        }
    }

    const updateEditorState = async (data: EditorState) => {
        data.read(() => {
            setTempEditorState($rootTextContent())
        })
    }

    const handleTagClick = (option: { label: string; id: string; isNew: boolean }) => {
        setTags([...tags, option])
        setPossibleTags([])
        if (inputRef.current) {
            inputRef.current.value = ''
        }
    }

    const handleNsfwCheck = (checked: SyntheticEvent) => {
        const tgt = checked.target as unknown as { checked: boolean }
        const isChecked = tgt.checked
        if (isChecked) {
            setTags([...tags, { id: '', label: 'nsfw', isNew: false }])
        } else {
            setTags([...tags.filter((item) => item.label !== 'nsfw')])
        }
    }

    const handleRemoveTag = (tag: string) => {
        setTags([...tags.filter((item) => item.label !== tag)])
    }

    return (
        <form className={'flex flex-col gap-4 py-4'}>
            <div className={'flex flex-col gap-4 lg:flex-row'}>
                {uploadedImage ? (
                    <img
                        className={'aspect-square w-12 lg:w-36 lg:object-cover'}
                        src={uploadedImage}
                        alt="uploaded image"
                    />
                ) : (
                    <span>&nbsp;</span>
                )}
                <div className={'flex h-full w-full flex-col justify-between gap-2'}>
                    <div className={'flex w-full flex-col items-center gap-6 lg:flex-row'}>
                        <TextField
                            id="create-ask-title"
                            className={'w-full lg:w-1/2'}
                            size={`${matches ? 'medium' : 'small'}`}
                            error={Boolean(errors.title)}
                            label={'Title'}
                            placeholder={'Title...'}
                            type="text"
                            variant="outlined"
                            {...register('title', {
                                required: true,
                            })}
                            helperText={errors.title?.message}
                        />
                        <TextField
                            id="create-ask-amount"
                            size={`${matches ? 'medium' : 'small'}`}
                            error={Boolean(errors.amount)}
                            {...register('amount', {
                                required: true,
                                valueAsNumber: true,
                            })}
                            label="Amount"
                            type="number"
                            InputLabelProps={{
                                shrink: true,
                            }}
                            helperText={errors.amount && errors.amount.message}
                        />
                        <Autocomplete
                            id="asynchronous-demo"
                            sx={{ width: 300 }}
                            open={open}
                            onOpen={() => {
                                setOpen(true)
                            }}
                            onClose={() => {
                                setOpen(false)
                            }}
                            isOptionEqualToValue={(option, value) => option.name === value.name}
                            getOptionLabel={(option) => option.name}
                            options={options}
                            loading={loading}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    {...register('space', { required: true })}
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
                        <FormControl className={'w-60'} size={`${matches ? 'medium' : 'small'}`}>
                            <InputLabel id="ask-kind-label">Select an option</InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                label="Select an option"
                                id="select-bump-kind"
                                {...register('askKind', { required: true })}
                                error={Boolean(errors.askKind)}
                                defaultValue={'PUBLIC'}
                            >
                                <MenuItem id={'bump-kind-public'} value={'PUBLIC'}>
                                    Public
                                </MenuItem>
                                <MenuItem id={'bump-kind-bump-public'} value={'BUMP_PUBLIC'}>
                                    Bump Public
                                </MenuItem>
                                <MenuItem id={'bump-kind-private'} value={'PRIVATE'}>
                                    Private
                                </MenuItem>
                            </Select>
                        </FormControl>
                        <Tooltip title={bumpInfoText}>
                            <InfoIcon />
                        </Tooltip>
                        <Autocomplete
                            size={`${matches ? 'medium' : 'small'}`}
                            disablePortal
                            id="combo-box-demo"
                            options={possibleTags}
                            sx={{ width: 300 }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Add a tag"
                                    onChange={(e) => handleSearchInput(e)}
                                    ref={inputRef}
                                />
                            )}
                            renderOption={(props, option) => {
                                return <Typography onClick={() => handleTagClick(option)}>{option.label}</Typography>
                            }}
                        />
                        <FormControlLabel
                            control={<Checkbox onChange={(value) => handleNsfwCheck(value)} />}
                            label="potentially #nsfw"
                        />
                    </div>
                    <div className={'flex w-full flex-col justify-between gap-4 lg:flex-row'}>
                        <Button variant="contained" component="div" size={`${matches ? 'medium' : 'small'}`}>
                            Upload File
                            <input
                                type="file"
                                accept="image/png, image/jpeg, image/svg+xml"
                                id="fileupload"
                                onChange={(e) => handleFileChange(e?.target?.files?.[0])}
                            />
                        </Button>
                    </div>
                </div>
            </div>

            <div className={'flex flex-row gap-8'}>
                <b>Tags:</b>
                {tags.length > 0 ? (
                    <div className={'flex flex-row gap-2'}>
                        {tags.map((tag, index) => {
                            return (
                                <TagPill key={index} tagValue={tag.label} noLink={true} removeTag={handleRemoveTag} />
                            )
                        })}
                    </div>
                ) : (
                    <span className={'h-8'}>&nbsp;</span>
                )}
            </div>
            <Tabs
                value={editorView}
                variant={'fullWidth'}
                onChange={(event, value) => setEditorView(value)}
                aria-label="basic tabs example"
            >
                <Tab value={'edit'} label="Edit" />
                <Tab value={'preview'} label="Preview" />
            </Tabs>
            {
                {
                    edit: (
                        <div className={'grow overflow-y-scroll'}>
                            <LexicalComposer initialConfig={initialConfig}>
                                <PlainTextPlugin
                                    contentEditable={<ContentEditable className={'editor-container h-full'} />} // TODO: ugly border, fix
                                    placeholder={() => <div>{getValues('content')}</div>}
                                    ErrorBoundary={LexicalErrorBoundary}
                                />
                                <OnChangePlugin onChange={updateEditorState} />
                            </LexicalComposer>
                        </div>
                    ),
                    preview: (
                        <div className={'grow overflow-y-scroll'}>
                            <MDRender content={tempEditorState} />
                        </div>
                    ),
                }[editorView]
            }

            <Button
                variant={'contained'}
                id={'create-ask-submit'}
                color={'primary'}
                component="div"
                disabled={Boolean(errors.title || errors.amount || errors.askKind)}
                onClick={() => {
                    handleSubmit(onSubmit)()
                }}
                endIcon={<PlayArrowIcon />}
            >
                Submit
            </Button>
        </form>
    )
}
