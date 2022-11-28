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
import { StandardButton } from '~/components/common/StandardButton'
import useActionStore from '~/store/actionStore'
import useMessageStore from '~/store/messageStore'
import { TagPill } from '~/components/common/TagPill'
import { askTextDefault } from '~/server/service/constants'

type CreateAskInput = RouterInput['ask']['create']

export const createAskInput = z.object({
    title: z.string().max(64),
    content: z.string().max(2000),
    amount: z.number().min(1),
    tags: z.array(z.string().max(32)),
    headerImageId: z.string(),
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
    const [tags, setTags] = useState<string[]>([])
    const [possibleTags, setPossibleTags] = useState<string[]>([])

    const createAskMutation = trpc.ask.create.useMutation()
    const utils = trpc.useContext()

    const {
        register,
        handleSubmit,
        getValues,
        setValue,
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
        await createAskMutation
            .mutateAsync({
                title: data.title,
                askKind: data.askKind,
                amount: data.amount,
                tags: tags,
                headerImageId: uploadedImageId ?? '',
                content: tempEditorState,
                untilClosed: getValues('untilClosed'),
                acceptedAfterClosed: { hours: 3 },
            })
            .catch((error) => {
                showToast('error', error.message)
            })
            .then(() => {
                showToast('success', 'Ask created')
            })
        await utils.invalidate()
        closeModal()
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

    return (
        <form className={'flex h-modal-height w-modal-width flex-col gap-8'} onSubmit={handleSubmit(onSubmit)}>
            <div className={'flex flex-row gap-6'}>
                <div className={'h-36 w-36 border-2 border-black'}>
                    {uploadedImage ? (
                        <img className={'w-36 object-cover'} src={uploadedImage} alt="uploaded image" />
                    ) : (
                        <span>&nbsp;</span>
                    )}
                </div>
                <div className={'flex h-full w-full flex-col justify-between'}>
                    <div className={'flex w-full flex-row gap-6'}>
                        <div className={'form-control w-full grow'}>
                            <label className={'label'} htmlFor="create-ask-title">
                                Title
                            </label>
                            <input
                                id={'create-ask-title'}
                                {...register('title', { required: true })}
                                type="text"
                                className="
                        input-bordered
input input-sm w-full
        "
                            />
                        </div>
                        <div>
                            <label className={'label'} htmlFor="create-ask-amount">
                                Amount
                            </label>
                            <input
                                id={'create-ask-amount'}
                                {...register('amount', { required: true, valueAsNumber: true, min: 1 })}
                                type="number"
                                className="
input-bordered input input-sm w-full
        "
                            />
                        </div>

                        <div>
                            <label htmlFor="askKind" className={'label'}>
                                Select an option
                            </label>
                            <select
                                id="askKind"
                                {...register('askKind', { required: true })}
                                className={'select-bordered select select-sm'}
                            >
                                <option value="PUBLIC">Public</option>
                                <option value="BUMP_PUBLIC">Bump Public</option>
                                <option value="PRIVATE">Private</option>
                            </select>
                        </div>
                    </div>
                    <div className={'flex w-full flex-row justify-between gap-6'}>
                        <input
                            type="file"
                            id="fileupload"
                            className="file-input-bordered file-input file-input-sm w-full max-w-xs"
                            onChange={(e) => handleFileChange(e?.target?.files?.[0])}
                        />

                        <div className={'grow'}>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                className="range"
                                step="12.5"
                                onChange={(e) => {
                                    setValue('untilClosed', mapRunningTimeSliderValue(e.target.value as RunningTimes))
                                }}
                            />
                            <div className="flex w-full justify-between px-2 text-xs">
                                <span>30min</span>
                                <span>1h</span>
                                <span>2h</span>
                                <span>3h</span>
                                <span>6h</span>
                                <span>12h</span>
                                <span>1d</span>
                                <span>3d</span>
                                <span>7d</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

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

            <ul className="menu w-56 bg-base-100">
                {possibleTags.map((tag, index) => {
                    return (
                        <li key={index} onClick={() => setTags([...tags, tag])}>
                            <a>{tag}</a>
                        </li>
                    )
                })}
            </ul>

            {tags.length > 0 && (
                <div className={'flex flex-row gap-2'}>
                    {tags.map((tag, index) => {
                        return <TagPill key={index} tagValue={tag} />
                    })}
                </div>
            )}

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
                <StandardButton onClick={() => onSubmit(getValues())} text={'Submit'}>
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
                </StandardButton>
            </div>
        </form>
    )
}
