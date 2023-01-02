import { z } from 'zod'
import { useZodForm } from '~/utils/useZodForm'
import { zodDuration } from '~/utils/zod-extra'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { $createParagraphNode, $createTextNode, $getRoot, EditorState, EditorThemeClasses } from 'lexical'
import { ChangeEvent, useState } from 'react'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { $rootTextContent } from '@lexical/text'
import { MDRender } from '~/components/common/MDRender'
import { RouterInput, trpc } from '~/utils/trpc'
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary'
import useActionStore from '~/store/actionStore'
import useMessageStore from '~/store/messageStore'
import { TagPill } from '~/components/common/TagPill'
import { askTextDefault } from '~/server/service/constants'
import {
    Autocomplete,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Slider,
    Tabs,
    TextField,
    Typography,
} from '@mui/material'
import useMediaQuery from '@mui/material/useMediaQuery'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import Tab from '@mui/material/Tab'

type CreateAskInput = RouterInput['ask']['create']

export const createAskInput = z.object({
    title: z.string().min(6).max(64),
    content: z.string().max(2000),
    amount: z.number().min(1),
    tags: z.array(z.string().max(32)).max(5),
    headerImageId: z.string().optional(),
    untilClosed: zodDuration,
    acceptedAfterClosed: zodDuration,
    askKind: z.enum(['PUBLIC', 'BUMP_PUBLIC', 'PRIVATE']),
})

export const uploadedImageById = z.object({
    imageId: z.string(),
})

type RunningTimes = '0' | '12.5' | '25' | '37.5' | '50' | '62.5' | '75' | '87.5' | '100'

interface CreateAskProps {}

export const CreateAsk = ({}: CreateAskProps) => {
    const { closeModal } = useActionStore()
    const { showToast } = useMessageStore()
    const [tempEditorState, setTempEditorState] = useState<string>(askTextDefault)
    const [editorView, setEditorView] = useState<'edit' | 'preview'>('edit')
    const [uploadedImageId, setUploadedImageId] = useState<string | null>(null)
    const [uploadedImage, setUploadedImage] = useState<string | null>(null)
    const [tags, setTags] = useState<{ label: string; id: string; isNew: boolean }[]>([])
    const [possibleTags, setPossibleTags] = useState<{ label: string; id: string; isNew: boolean }[]>([])
    const matches = useMediaQuery('(min-width:600px)')

    const createAskMutation = trpc.ask.create.useMutation()
    const utils = trpc.useContext()

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
            title: 'Title...',
            content: 'Content...',
            askKind: 'PUBLIC',
            amount: 100,
            headerImageId: '',
            acceptedAfterClosed: { hours: 6 },
            untilClosed: { days: 1 },
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
        try {
            await createAskMutation.mutateAsync({
                title: data.title,
                askKind: data.askKind,
                amount: data.amount,
                tags: tags.map((t) => t.label),
                headerImageId: uploadedImageId ?? '',
                content: tempEditorState,
                untilClosed: getValues('untilClosed'),
                acceptedAfterClosed: { hours: 3 },
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

    const mapRunningTimeSliderValue = (time: RunningTimes) => {
        return {
            '0': { minutes: 30 },
            '12.5': { hours: 1 },
            '25': { hours: 2 },
            '37.5': { hours: 3 },
            '50': { hours: 6 },
            '62.5': { hours: 12 },
            '75': { days: 1 },
            '87.5': { days: 3 },
            '100': { days: 7 },
        }[time]
    }

    const marks = [
        {
            value: 0,
            label: '30min',
        },
        {
            value: 12.5,
            label: '1h',
        },
        {
            value: 25,
            label: '2h',
        },
        {
            value: 37.5,
            label: '3h',
        },
        {
            value: 50,
            label: '6h',
        },
        {
            value: 62.5,
            label: '12h',
        },
        {
            value: 75,
            label: '1d',
        },
        {
            value: 87.5,
            label: '3d',
        },
        {
            value: 100,
            label: '7d',
        },
    ]

    const handleTagClick = (option: { label: string; id: string; isNew: boolean }) => {
        setTags([...tags, option])
        setPossibleTags([])
    }

    return (
        <form className={'flex w-modal-width flex-col gap-4 lg:h-modal-height'} onSubmit={handleSubmit(onSubmit)}>
            <div className={'flex flex-col lg:flex-row'}>
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
                    <div className={'flex w-full flex-col gap-6 lg:flex-row'}>
                        <TextField
                            id="create-ask-title"
                            className={'w-full lg:w-1/2'}
                            size={`${matches ? 'medium' : 'small'}`}
                            error={Boolean(errors.title)}
                            label={'Title'}
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
                        <FormControl className={'w-60'} size={`${matches ? 'medium' : 'small'}`}>
                            <InputLabel id="ask-kind-label">Select an option</InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                label="Select an option"
                                id="demo-simple-select"
                                {...register('askKind', { required: true })}
                                error={Boolean(errors.askKind)}
                                defaultValue={'PUBLIC'}
                            >
                                <MenuItem value={'PUBLIC'}>Public</MenuItem>
                                <MenuItem value={'BUMP_PUBLIC'}>Bump Public</MenuItem>
                                <MenuItem value={'PRIVATE'}>Private</MenuItem>
                            </Select>
                        </FormControl>
                        <Autocomplete
                            size={`${matches ? 'medium' : 'small'}`}
                            disablePortal
                            id="combo-box-demo"
                            options={possibleTags}
                            sx={{ width: 300 }}
                            renderInput={(params) => (
                                <TextField {...params} label="Add a tag" onChange={(e) => handleSearchInput(e)} />
                            )}
                            renderOption={(props, option) => {
                                return <Typography onClick={() => handleTagClick(option)}>{option.label}</Typography>
                            }}
                        />
                    </div>
                    <div className={'flex w-full flex-col justify-between gap-4 lg:flex-row'}>
                        <Button variant="contained" component="label" size={`${matches ? 'medium' : 'small'}`}>
                            Upload File
                            <input
                                type="file"
                                accept="image/png, image/jpeg, image/svg+xml"
                                id="fileupload"
                                onChange={(e) => handleFileChange(e?.target?.files?.[0])}
                            />
                        </Button>
                        <Slider
                            size={`${matches ? 'medium' : 'small'}`}
                            aria-label="Custom marks"
                            className={`${matches ? 'w-3/5' : 'w-full'}`}
                            defaultValue={50}
                            step={12.5}
                            valueLabelDisplay="off"
                            marks={marks}
                            onChange={(e: any) => {
                                setValue('untilClosed', mapRunningTimeSliderValue(e.target.value as RunningTimes))
                            }}
                        />
                    </div>
                </div>
            </div>

            {tags.length > 0 && (
                <div className={'flex flex-row gap-2'}>
                    {tags.map((tag, index) => {
                        return <TagPill key={index} tagValue={tag.label} />
                    })}
                </div>
            )}
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
                variant={'outlined'}
                color={'primary'}
                disabled={Boolean(errors.title || errors.amount || errors.askKind)}
                type="submit"
                onClick={() => onSubmit(getValues())}
                endIcon={<PlayArrowIcon />}
            >
                Submit
            </Button>
        </form>
    )
}
