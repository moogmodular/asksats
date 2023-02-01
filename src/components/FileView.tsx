import { useActionStore } from '~/store/actionStore'

interface FileViewProps {
    filePairId: string
    offerFileUrl: string
    obscureFileUrl: string
    index: number
}

export const FileView = ({ filePairId, offerFileUrl, obscureFileUrl, index }: FileViewProps) => {
    const { openImage } = useActionStore()

    return (
        <div id={`offer-file-view-${index}`} className={'flex flex-row'}>
            <div className={'comment-container flex flex-col gap-2'}>
                <img
                    id={`obscure-file-view-${index}`}
                    className={'aspect-square w-32'}
                    src={obscureFileUrl}
                    alt=""
                    onClick={() => openImage(obscureFileUrl)}
                />
                {offerFileUrl !== '' && (
                    <img
                        id={`offer-file-view-${index}`}
                        className={'aspect-square w-32'}
                        src={offerFileUrl}
                        alt=""
                        onClick={() => openImage(offerFileUrl)}
                    />
                )}
            </div>
        </div>
    )
}
