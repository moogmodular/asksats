import { z } from 'zod'
import { useZodForm } from '~/utils/useZodForm'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { $createParagraphNode, $createTextNode, $getRoot, EditorState, EditorThemeClasses } from 'lexical'
import { useRef, useState } from 'react'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { $rootTextContent } from '@lexical/text'
import { MDRender } from '~/components/common/MDRender'
import { RouterInput, trpc } from '~/utils/trpc'
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary'
import { useActionStore } from '~/store/actionStore'
import { useMessageStore } from '~/store/messageStore'
import { bumpInfoText } from '~/server/service/constants'
import { Button, Tabs, Tooltip } from '@mui/material'
import useMediaQuery from '@mui/material/useMediaQuery'
import InfoIcon from '@mui/icons-material/Info'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import Tab from '@mui/material/Tab'

type EditAskInput = RouterInput['ask']['edit']

export const editAskInput = z.object({
    askId: z.string().uuid(),
    content: z.string().max(2000).optional(),
    headerImageId: z.string().optional(),
})
interface EditAskProps {}

export const EditAsk = ({}: EditAskProps) => {
    const { closeModal, askId } = useActionStore()
    const { showToast } = useMessageStore()

    const [editorView, setEditorView] = useState<'edit' | 'preview'>('edit')
    const matches = useMediaQuery('(min-width:1024px)')
    const inputRef = useRef<HTMLInputElement>(null)

    const { data: askContextData } = trpc.ask.getAskContext.useQuery({ askId })

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
