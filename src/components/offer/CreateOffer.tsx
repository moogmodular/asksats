import { z } from 'zod'
import { useZodForm } from '~/utils/useZodForm'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { $createParagraphNode, $createTextNode, $getRoot, EditorState, EditorThemeClasses } from 'lexical'
import { useImperativeHandle, useState } from 'react'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { $rootTextContent } from '@lexical/text'
import { MDRender } from '~/components/common/MDRender'
import { RouterInput, trpc } from '~/utils/trpc'
import { OfferImageView } from '~/components/offer/OfferImageView'
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary'
import useActionStore from '~/store/actionStore'
import useMessageStore from '~/store/messageStore'
import { offerTextDefault } from '~/server/service/constants'

type CreateOfferInput = RouterInput['offer']['create']

export type BlurLevels = '2' | '5' | '10' | '20'

export const createOfferForAskInput = z.object({
    askId: z.string().uuid(),
    content: z.string(),
    files: z.array(z.object({ id: z.string().uuid(), name: z.string() })),
    obscureMethod: z.enum(['BLUR', 'CHECKER']),
    blurLevel: z.enum(['2', '5', '10', '20']).optional(),
})

export const createFilePair = z.object({
    file: z.object({ id: z.string().uuid(), name: z.string() }),
    obscureMethod: z.enum(['BLUR', 'CHECKER']),
    blurLevel: z.enum(['2', '5', '10', '20']).optional(),
})

interface CreateOfferProps {}

export const CreateOffer = ({}: CreateOfferProps) => {
    const { askId, closeModal } = useActionStore()
    const { showToast } = useMessageStore()
    const [tempEditorState, setTempEditorState] = useState<string>(offerTextDefault)
    const [editorView, setEditorView] = useState<'edit' | 'preview'>('edit')
    const [uploadedImages, setUploadedImages] = useState<{ id: string; name: string; url: string }[]>([
        { id: '', name: '', url: '' },
    ])

    const createOfferMutation = trpc.offer.create.useMutation()
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
            obscureMethod: 'BLUR',
            files: [],
            blurLevel: '5',
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

    const onSubmit = async (data: CreateOfferInput) => {
        await createOfferMutation
            .mutateAsync({
                askId,
                obscureMethod: data.obscureMethod,
                blurLevel: data.blurLevel,
                content: tempEditorState,
                files: uploadedImages.filter((image) => image.id).map((image) => ({ id: image.id, name: image.name })),
            })
            .catch((error) => {
                showToast('error', error.message)
            })
            .then((result) => {
                console.log(result)
            })
            .then(() => {
                showToast('success', 'Offer created')
            })
        utils.ask.invalidate()
        utils.offer.listForAsk.invalidate()
        closeModal()
    }

    const handleFileChange = async (data: File | undefined) => {
        if (data) {
            const url = await utils.asset.preSignedUrl.fetch()

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

            console.log(uploadedImage)

            setUploadedImages([...uploadedImages, { id: url.imageId, name: '', url: uploadedImage }])

            return
        }
    }

    const updateEditorState = async (data: EditorState) => {
        data.read(() => {
            setTempEditorState($rootTextContent())
        })
    }

    return (
        <form className={'flex h-modal-height w-modal-width flex-col gap-8'} onSubmit={handleSubmit(onSubmit)}>
            <div className={'flex w-full flex-row gap-6'}>
                <div>
                    <label
                        htmlFor="obscureMethod"
                        className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-400"
                    >
                        Select an obscure method
                    </label>
                    <select
                        id="obscureMethod"
                        {...register('obscureMethod', { required: true })}
                        className="block w-full rounded-global border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                    >
                        <option value="BLUR">Blur</option>
                        <option value="CHECKER">Checker</option>
                    </select>
                </div>

                <div>
                    <label
                        htmlFor="obscureMethod"
                        className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-400"
                    >
                        Select a blur level
                    </label>
                    <select
                        id="blurLevel"
                        {...register('blurLevel', { required: true, disabled: watch('obscureMethod') !== 'BLUR' })}
                        className="block w-full rounded-global border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                    >
                        <option value="2">2</option>
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="20">20</option>
                    </select>
                </div>
            </div>
            <div className={'flex flex-row gap-2'}>
                {uploadedImages.map((image, index) => {
                    return <OfferImageView key={index} {...image} doUpload={handleFileChange} />
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
                                    contentEditable={<ContentEditable className={'h-full'} />}
                                    placeholder={getValues('content')}
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

            <div className={'flex flex-row justify-between'}>
                <button
                    id={'edit-profile-submit'}
                    type="submit"
                    className="dark:focus:ring-[#4285F4]/55 mr-2 mb-2 inline-flex items-center rounded-global bg-[#4285F4] px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-[#4285F4]/90 focus:outline-none focus:ring-4 focus:ring-[#4285F4]/50"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="h-6 w-6"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    Submit
                </button>
            </div>
        </form>
    )
}
