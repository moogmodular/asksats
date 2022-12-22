import useActionStore from '~/store/actionStore'

interface FileViewProps {
    filePairId: string
    offerFileUrl: string
    obscureFileUrl: string
}

export const FileView = ({ filePairId, offerFileUrl, obscureFileUrl }: FileViewProps) => {
    const { openImage } = useActionStore()

    return (
        <div className={'flex flex-row'}>
            <div className={'comment-container flex flex-col gap-2'}>
                <img
                    className={'aspect-square w-32'}
                    src={obscureFileUrl}
                    alt=""
                    onClick={() => openImage(obscureFileUrl)}
                />
                {offerFileUrl && (
                    <img
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
