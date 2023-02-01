import { trpc } from '~/utils/trpc'
import { MDRender } from '~/components/common/MDRender'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { useState } from 'react'
import { $createParagraphNode, $createTextNode, $getRoot, EditorState, EditorThemeClasses } from 'lexical'
import { $rootTextContent } from '@lexical/text'
import { useMessageStore } from '~/store/messageStore'
import { useQuestionsUXStore } from '~/store/askQuestionsUXStore'
import { Button, Tabs } from '@mui/material'
import Tab from '@mui/material/Tab'

interface CreateCommentProps {
    askId?: string
    commentId?: string
    invalidate: () => void
}

export const CreateComment = ({ askId, commentId, invalidate }: CreateCommentProps) => {
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
                .then(() => {
                    console.log('comment created')
                    showToast('success', 'Comment created')
                })
                .catch((error) => {
                    console.error(error)
                    showToast('error', error.message)
                })
        }

        setTempEditorState('')
        setCurrentOpenQuestionIdId('')

        await utils.comment.invalidate()
        invalidate()
    }

    const updateEditorState = async (data: EditorState) => {
        data.read(() => {
            setTempEditorState($rootTextContent())
        })
    }

    return (
        <div className={'comment-container mt-4 mb-4 flex w-1/2 flex-col gap-1'}>
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
                                    contentEditable={<ContentEditable className={'h-96'} />}
                                    placeholder={() => <div>Ask questions about this...</div>}
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
                <Button variant={'contained'} onClick={() => handleCreateComment()} color={'success'} component="div">
                    Post question
                </Button>
                <Button component="div" variant={'contained'} onClick={() => setCurrentOpenQuestionIdId('')}>
                    Close
                </Button>
            </div>
        </div>
    )
}
