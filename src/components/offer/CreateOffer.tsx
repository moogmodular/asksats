import { z } from 'zod'
import { useZodForm } from '~/utils/useZodForm'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { $createParagraphNode, $createTextNode, $getRoot, EditorState, EditorThemeClasses } from 'lexical'
import { useState } from 'react'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { $rootTextContent } from '@lexical/text'
import { MDRender } from '~/components/common/MDRender'
import { trpc } from '~/utils/trpc'
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary'
import { useActionStore } from '~/store/actionStore'
import { useMessageStore } from '~/store/messageStore'
import { offerTextDefault } from '~/server/service/constants'
import { Button, LinearProgress, Tabs } from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'
import Tab from '@mui/material/Tab'
import { AssetPreview } from '~/components/offer/AssetPreview'

export type BlurLevels = '2' | '5' | '10' | '20'

export const createOfferForAskInput = z.object({
    askId: z.string().uuid(),
    content: z.string(),
    filePairs: z.array(z.object({ id: z.string().uuid() })).max(3),
})

export const createFilePair = z.object({
    offerFileId: z.string().uuid(),
    blurLevel: z.enum(['2', '5', '10', '20']).optional(),
})

export const preSignedUrl = z.object({
    obscureMethod: z.enum(['NONE', 'BLUR', 'CHECKER']).optional(),
})

interface CreateOfferProps {}

export const CreateOffer = ({}: CreateOfferProps) => {
    const { askId, closeModal } = useActionStore()
    const { showToast } = useMessageStore()
    const [tempEditorState, setTempEditorState] = useState<string>(offerTextDefault)
    const [editorView, setEditorView] = useState<'edit' | 'preview'>('edit')
    const [rawImagePairs, setRawImagePairs] = useState<{ originalImage: string; obfuscatedImage: string }[]>([])

    const [isUploading, setIsUploading] = useState(false)

    const createOfferMutation = trpc.offer.create.useMutation()
    const getPreSignedPairUrlMutation = trpc.asset.preSignedPair.useMutation()
    const utils = trpc.useContext()

    const {
        register,
        handleSubmit,
        getValues,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useZodForm({
        schema: createOfferForAskInput,
        defaultValues: {
            askId: askId,
            content: '',
            filePairs: [],
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

    const updateEditorState = async (data: EditorState) => {
        data.read(() => {
            setTempEditorState($rootTextContent())
        })
    }

    const handleSetPair = (id: number, originalImage: string, obfuscatedImage: string) => {
        setRawImagePairs([...rawImagePairs, { originalImage, obfuscatedImage }])
    }

    const resolveImage = async (imageBase64: string, uploadFields: Record<string, string>, uploadUrl: string) => {
        const imgOriginal = Buffer.from(imageBase64.replace(/^data:image\/\w+;base64,/, ''), 'base64')
        const typeOriginal = imageBase64.split(';')[0]?.split('/')[1]
        const originalFile = new File([imgOriginal], `orig`, { type: `image/${typeOriginal}` })

        const ulDataOriginal = {
            ...uploadFields,
            'Content-Type': `image/${typeOriginal}`,
            file: originalFile,
        } as Record<string, any>

        const formDataOriginal = new FormData()
        for (const name in ulDataOriginal) {
            formDataOriginal.append(name, ulDataOriginal[name])
        }

        return await fetch(uploadUrl.replace('//', '//asksats.'), {
            method: 'POST',
            body: formDataOriginal,
        })
    }

    const onSubmit = async () => {
        const filePairIds = await Promise.all(
            rawImagePairs.map(async (pair) => {
                const uploadData = await getPreSignedPairUrlMutation.mutateAsync()

                const originalRes = await resolveImage(
                    pair.originalImage,
                    uploadData.originalImageUploadUrl.fields,
                    uploadData.originalImageUploadUrl.url,
                )
                const obfuscatedRes = await resolveImage(
                    pair.obfuscatedImage,
                    uploadData.obscuredImageUploadUrl.fields,
                    uploadData.obscuredImageUploadUrl.url,
                )

                return uploadData.filePairId
            }),
        )

        try {
            await createOfferMutation.mutateAsync({
                askId,
                content: tempEditorState,
                filePairs: filePairIds.map((id) => ({ id })),
            })
            showToast('success', 'Offer created')
            utils.ask.invalidate()
            utils.offer.listForAsk.invalidate()
            closeModal()
        } catch (error: any) {
            showToast('error', error.message)
            utils.ask.invalidate()
            utils.offer.listForAsk.invalidate()
        }
        utils.invalidate()
    }

    return (
        <form className={'flex flex-col gap-8 py-4'}>
            <b>Add up to 3 images to your offer</b>
            <div className={'flex flex-col justify-between gap-4 lg:flex-row'}>
                {Array.from({ length: 3 }).map((_, index) => {
                    return (
                        <AssetPreview
                            key={index}
                            index={index}
                            setImagePair={(originalImage, obfuscatedImage) =>
                                handleSetPair(index, originalImage, obfuscatedImage)
                            }
                        />
                    )
                })}
            </div>
            {isUploading && <LinearProgress />}
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
                                    contentEditable={<ContentEditable className={'editor-container h-full'} />}
                                    placeholder={() => <div>{getValues('content')}</div>}
                                    ErrorBoundary={LexicalErrorBoundary}
                                />
                                <OnChangePlugin onChange={updateEditorState} />
                            </LexicalComposer>
                        </div>
                    ),
                    preview: (
                        <div className={'grow grow overflow-y-scroll'}>
                            <MDRender content={tempEditorState} />
                        </div>
                    ),
                }[editorView]
            }
            <Button
                component="div"
                id={'create-offer-submit'}
                variant="contained"
                disabled={rawImagePairs.length === 0}
                onClick={handleSubmit(onSubmit)}
                endIcon={<CheckIcon />}
            >
                Submit
            </Button>
        </form>
    )
}
