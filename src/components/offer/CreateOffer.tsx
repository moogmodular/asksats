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
import { RouterInput, trpc } from '~/utils/trpc'
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary'
import useActionStore from '~/store/actionStore'
import useMessageStore from '~/store/messageStore'
import { offerTextDefault } from '~/server/service/constants'
import { AssetPreview } from '~/components/offer/AssetPreview'
import { useForm } from 'react-hook-form'
import { Button, FormControl, InputLabel, MenuItem, Select } from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'

type CreateOfferInput = RouterInput['offer']['create']

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

    const [assetsForThisAsk, setAssetsForThisAsk] = useState<{ id: string }[]>([])

    const createOfferMutation = trpc.offer.create.useMutation()
    const createFilePairMutation = trpc.asset.doFilePair.useMutation()
    const deleteImagePairMutation = trpc.asset.deleteImagePair.useMutation()
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

    const {
        register: registerItem,
        getValues: getPairValue,
        watch: watchPair,
        formState: { errors: pairErrors },
    } = useForm()

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

    const onSubmit = async (data: CreateOfferInput) => {
        try {
            await createOfferMutation.mutateAsync({
                askId,
                content: tempEditorState,
                filePairs: assetsForThisAsk,
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
    }

    const handleCreateFilePair = async (data: File | undefined) => {
        if (data) {
            const url = await utils.asset.preSignedUrlPair.fetch({ obscureMethod: getPairValue('obscureMethod') })

            const ulData = { ...url.offerFileUploadUrl.fields, 'Content-Type': data.type, file: data } as Record<
                string,
                any
            >

            const formData = new FormData()
            for (const name in ulData) {
                formData.append(name, ulData[name])
            }

            await fetch(url.offerFileUploadUrl.url.replace('//', '//artisats.'), {
                method: 'POST',
                body: formData,
            })

            await createFilePairMutation
                .mutateAsync({
                    offerFileId: url.offerFileId,
                    blurLevel: getPairValue().blurLevel,
                })
                .then((result) => {
                    console.log(result)
                    setAssetsForThisAsk([...assetsForThisAsk, { id: result?.id ?? '' }])
                })

            return
        }
    }

    const updateEditorState = async (data: EditorState) => {
        data.read(() => {
            setTempEditorState($rootTextContent())
        })
    }

    const handleDeleteFilePair = async (id: string) => {
        await deleteImagePairMutation.mutateAsync({ imagePairId: id })
        setAssetsForThisAsk(assetsForThisAsk.filter((pair) => pair.id !== id))
    }

    return (
        <form className={'flex h-modal-height w-modal-width flex-col gap-8'} onSubmit={handleSubmit(onSubmit)}>
            <b>Add up to 3 images to your offer</b>
            {assetsForThisAsk.length < 4 && (
                <div className={'flex w-1/5 flex-col gap-4'}>
                    <div className={'flex flex-row justify-between'}>
                        <FormControl className={'w-96'}>
                            <InputLabel id="obscure-method-select-helper-label">Select an obscure method</InputLabel>
                            <Select
                                error={!!pairErrors.obscureMethod?.message}
                                label={'Select an obscure method'}
                                id="obscure-method-select-helper"
                                {...registerItem('obscureMethod', { required: true })}
                            >
                                <MenuItem value={'BLUR'}>Blur</MenuItem>
                                <MenuItem value={'CHECKER'}>Checker</MenuItem>
                                <MenuItem value={'NONE'}>None</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl className={'w-64'}>
                            <InputLabel id="obscure-method-level-select-helper-label">Select a blur level</InputLabel>
                            <Select
                                label={'Select a blur level'}
                                id="obscure-method-level-select-helper"
                                {...registerItem('blurLevel', {
                                    required: true,
                                    disabled: watchPair('obscureMethod') !== 'BLUR',
                                })}
                            >
                                <MenuItem value={'2'}>2</MenuItem>
                                <MenuItem value={'5'}>5</MenuItem>
                                <MenuItem value={'10'}>10</MenuItem>
                                <MenuItem value={'20'}>20</MenuItem>
                            </Select>
                        </FormControl>
                    </div>
                    <Button variant="contained" component="label">
                        Upload File
                        <input
                            type="file"
                            accept="image/png, image/jpeg, image/svg+xml"
                            disabled={assetsForThisAsk.length >= 3 || watchPair('obscureMethod') === undefined}
                            id="fileupload"
                            onChange={(e) => handleCreateFilePair(e?.target?.files?.[0])}
                        />
                    </Button>
                </div>
            )}
            <div className={'flex flex-row gap-2'}>
                {assetsForThisAsk.map((asset, index) => {
                    return (
                        <AssetPreview
                            key={index}
                            id={asset.id}
                            deletable={true}
                            deleteFilePair={(id) => handleDeleteFilePair(id)}
                        />
                    )
                })}
            </div>
            <nav className="flex border-b border-gray-100 text-sm font-medium">
                <div
                    onClick={() => setEditorView('edit')}
                    className={
                        editorView === 'edit'
                            ? '-mb-px border-b border-current p-4 text-cyan-500'
                            : '-mb-px border-b border-transparent p-4 hover:text-cyan-500'
                    }
                >
                    Raw
                </div>

                <div
                    onClick={() => setEditorView('preview')}
                    className={
                        editorView === 'preview'
                            ? '-mb-px border-b border-current p-4 text-cyan-500'
                            : '-mb-px border-b border-transparent p-4 hover:text-cyan-500'
                    }
                >
                    Preview
                </div>
            </nav>
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
            <Button id={'edit-profile-submit'} variant="outlined" type={'submit'}>
                <CheckIcon fontSize={'medium'} />
                Submit
            </Button>
        </form>
    )
}
