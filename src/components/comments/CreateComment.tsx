import { trpc } from '~/utils/trpc'
import { MDRender } from '~/components/common/MDRender'
import { StandardButton } from '~/components/common/StandardButton'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { useState } from 'react'
import { $createParagraphNode, $createTextNode, $getRoot, EditorState, EditorThemeClasses } from 'lexical'
import { $rootTextContent } from '@lexical/text'
import useMessageStore from '~/store/messageStore'
import useBlogUXStore from '~/store/blogUXStore'
import useQuestionsUXStore from '~/store/askQuestionsUXStore'

interface CreateCommentProps {
    askId?: string
    commentId?: string
}

export const CreateComment = ({ askId, commentId }: CreateCommentProps) => {
    const { showToast } = useMessageStore()
    const [editorView, setEditorView] = useState<'edit' | 'preview'>('edit')
    const [tempEditorState, setTempEditorState] = useState<string>('Ask questions about this ask...')

    const createForAsk = trpc.comment.createQuestionForAsk.useMutation()
    const createForComment = trpc.comment.createCommentForComment.useMutation()

    const { setCurrentOpenQuestionIdId } = useQuestionsUXStore()

    const utils = trpc.useContext()

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

    const handleCreateComment = async () => {
        if (askId) {
            await createForAsk.mutate({
                askId: askId,
                content: tempEditorState,
            })
        } else if (commentId) {
            await createForComment
                .mutateAsync({
                    commentId,
                    content: tempEditorState,
                })
                .catch((error) => {
                    showToast('error', error.message)
                })
                .then(() => {
                    showToast('success', 'Comment created')
                })
        }

        setTempEditorState('')
        setCurrentOpenQuestionIdId('')

        await utils.comment.commentTreeForAsk.invalidate()
    }

    const updateEditorState = async (data: EditorState) => {
        data.read(() => {
            setTempEditorState($rootTextContent())
        })
    }

    return (
        <div className={'comment-container mt-4 mb-4 flex w-1/2 flex-col gap-1'}>
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
                                    contentEditable={<ContentEditable className={'h-96'} />}
                                    placeholder={'Ask questions about this...'}
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

            <div className={'flex justify-between'}>
                <button onClick={() => handleCreateComment()} className={'btn-primary btn-xs btn'} type={'submit'}>
                    Post question
                </button>
                <button
                    onClick={() => setCurrentOpenQuestionIdId('')}
                    className={'btn-error btn-xs btn'}
                    type={'submit'}
                >
                    Close
                </button>
            </div>
        </div>
    )
}
