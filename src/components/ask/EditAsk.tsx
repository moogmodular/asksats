import { z } from 'zod'
import { useZodForm } from '~/utils/useZodForm'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { $createParagraphNode, $createTextNode, $getRoot, EditorState, EditorThemeClasses } from 'lexical'
import { ChangeEvent, SyntheticEvent, useRef, useState } from 'react'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { $rootTextContent } from '@lexical/text'
import { MDRender } from '~/components/common/MDRender'
import { RouterInput, trpc } from '~/utils/trpc'
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary'
import { useActionStore } from '~/store/actionStore'
import { useMessageStore } from '~/store/messageStore'
import { TagPill } from '~/components/common/TagPill'
import { bumpInfoText } from '~/server/service/constants'
import { Autocomplete, Button, Checkbox, FormControlLabel, Tabs, TextField, Tooltip, Typography } from '@mui/material'
import useMediaQuery from '@mui/material/useMediaQuery'
import InfoIcon from '@mui/icons-material/Info'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import Tab from '@mui/material/Tab'

type EditAskInput = RouterInput['ask']['edit']

export const editAskInput = z.object({
    askId: z.string().uuid(),
    content: z.string().max(2000).optional(),
    tags: z.array(z.string().max(32)).max(5).optional(),
    headerImageId: z.string().optional(),
})
interface EditAskProps {}

export const EditAsk = ({}: EditAskProps) => {
    const { closeModal, askId } = useActionStore()
    const { showToast } = useMessageStore()

    const [editorView, setEditorView] = useState<'edit' | 'preview'>('edit')
    const [possibleTags, setPossibleTags] = useState<{ label: string; id: string; isNew: boolean }[]>([])
    const matches = useMediaQuery('(min-width:1024px)')
    const inputRef = useRef<HTMLInputElement>(null)

    const { data: askContextData } = trpc.ask.getAskContext.useQuery({ askId })

    const [tags, setTags] = useState<{ label: string; id: string; isNew: boolean }[]>(
        askContextData?.ask?.tags.map((tag) => {
            return { label: tag.tag.name, id: tag.tagId, isNew: false }
        }) ?? [],
    )
    const [tempEditorState, setTempEditorState] = useState<string>(askContextData?.content ?? '')
    const [uploadedImage, setUploadedImage] = useState<string | null>(askContextData?.headerImageUrl ?? null)

    const [uploadedImageId, setUploadedImageId] = useState<string | null>(askContextData?.headerImageId ?? null)

    const editAskMutation = trpc.ask.edit.useMutation()
    const utils = trpc.useContext()

    const {
        register,
        handleSubmit,
        getValues,
        setValue,
        watch,
        formState: { errors },
    } = useZodForm({
        schema: editAskInput,
        defaultValues: {
            askId: askId,
            content: askContextData?.content,
            tags: askContextData?.ask?.tags.map((tag) => tag.tag.name) ?? [],
            headerImageId: askContextData?.headerImageId ?? '',
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
            pNode.append($createTextNode(askContextData?.content))
            root.append(pNode)
            return
        },
        namespace: 'Editor',
        theme,
        onError,
    }

    const onSubmit = async (data: EditAskInput) => {
        try {
            await editAskMutation.mutateAsync({
                askId: askId,
                tags: tags.map((t) => t.label),
                headerImageId: uploadedImageId ?? '',
                content: tempEditorState,
            })
            showToast('success', 'Ask updated')
            await utils.invalidate()
            closeModal()
        } catch (error: any) {
            showToast('error', error.message)
            await utils.invalidate()
        }
    }

    const handleSearchInput = async (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const searchTerm = e.target.value
        await utils.taxonomy.searchTags.fetch({ search: searchTerm }).then((data) => {
            const tagResults = data.map((tag) => {
                return {
                    label: tag.name,
                    id: tag.id,
                    isNew: false,
                }
            })
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

            await fetch(url.uploadUrl.url, {
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
            <b className={'text-2xl'}>{askContextData?.title}</b>
            <b>{askContextData?.ask?.askKind}</b>
            <div className={'flex flex-col gap-4 lg:flex-row'}>
                {uploadedImage ? (
                    <img
                        className={'aspect-square w-12 lg:w-36 lg:object-cover'}
                        src={uploadedImage ?? ''}
                        alt="uploaded image"
                    />
                ) : (
                    <span>&nbsp;</span>
                )}
                <div className={'flex h-full w-full flex-col justify-between gap-2'}>
                    <div className={'flex w-full flex-col items-center gap-6 lg:flex-row'}>
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
