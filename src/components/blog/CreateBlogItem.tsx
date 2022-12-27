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
import useMessageStore from '~/store/messageStore'
import useBlogUXStore from '~/store/blogUXStore'
import { Button } from '@mui/material'

type CreateBlogItemInput = RouterInput['blog']['addBlogItem']

export const createBlogItemInput = z.object({
    title: z.string().max(64),
    content: z.string().max(5000),
})

export const createCommentInput = z.object({
    content: z.string().max(5000),
    parentCommentId: z.string(),
})

interface CreateBlogItemProps {
    parentId?: string
}

export const CreateBlogItem = ({ parentId }: CreateBlogItemProps) => {
    const [editorView, setEditorView] = useState<'edit' | 'preview'>('edit')

    const [tempEditorState, setTempEditorState] = useState<string>('New Blog Post')

    const { setCurrentOpenModalId } = useBlogUXStore()
    const { showToast } = useMessageStore()

    const createBlogItemMutation = trpc.blog.addBlogItem.useMutation()
    const createCommentMutation = trpc.blog.addBlogComment.useMutation()
    const utils = trpc.useContext()

    const {
        register,
        getValues,
        setValue,
        handleSubmit,
        formState: { errors },
    } = useZodForm({
        schema: createBlogItemInput,
        defaultValues: {
            title: 'New Blog Post Title',
            content: 'New Blog Post',
        },
    })

    const onError = (error: Error) => {
        console.error(error)
    }

    const updateEditorState = async (data: EditorState) => {
        data.read(() => {
            setTempEditorState($rootTextContent())
        })
    }

    const onSubmit = async (data: CreateBlogItemInput) => {
        if (parentId) {
            await createCommentMutation
                .mutateAsync({
                    content: tempEditorState,
                    parentCommentId: parentId,
                })
                .catch((error) => {
                    showToast('error', error.message)
                })
                .then(() => {
                    showToast('success', 'Blob Post created')
                })
        } else {
            await createBlogItemMutation
                .mutateAsync({
                    title: data.title,
                    content: tempEditorState,
                })
                .catch((error) => {
                    showToast('error', error.message)
                })
                .then(() => {
                    showToast('success', 'Comment created')
                })
        }

        setValue('title', 'New Blog Post Title')
        setValue('content', 'New Blog Post')
        setCurrentOpenModalId('')

        await utils.blog.invalidate()
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

    return (
        <form className={'mt-4 flex w-1/2 flex-col gap-8 border border-black p-4'} onSubmit={handleSubmit(onSubmit)}>
            {!parentId && (
                <div className={'flex flex-col gap-4'}>
                    <label className={'text-lg font-bold'}>Title</label>
                    <input
                        className={'rounded-global border border-gray-300 p-2'}
                        {...register('title')}
                        placeholder={'Title'}
                    />
                </div>
            )}
            <div className={'flex flex-col gap-4'}>
                <div className={'flex flex-col gap-4'}>
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
                </div>
            </div>
            <Button variant={'contained'} type={'submit'}>
                Create Blog Post
            </Button>
        </form>
    )
}
