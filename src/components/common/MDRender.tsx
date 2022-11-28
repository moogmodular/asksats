import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type MDRenderProps = {
    content: string
}

export const MDRender = ({ content }: MDRenderProps) => {
    return (
        <ReactMarkdown remarkPlugins={[remarkGfm]} className={'prose font-editable'}>
            {content}
        </ReactMarkdown>
    )
}
