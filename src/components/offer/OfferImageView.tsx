interface OfferImageViewProps {
    id: string
    name: string
    url: string
    doUpload: (file: File | undefined) => void
}

export const OfferImageView = ({ id, name, url, doUpload }: OfferImageViewProps) => {
    return (
        <div
            className={
                'flex aspect-square h-36 w-36 items-center justify-center border-2 border-gray-400 object-contain p-1'
            }
        >
            {id ? (
                <div>
                    <img src={url} alt="hello image" />
                </div>
            ) : (
                <div className={'flex flex-col items-center'}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="h-6 w-6"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                        />
                    </svg>

                    <input
                        type="file"
                        id="fileupload"
                        className="file-input-bordered file-input file-input-sm w-full max-w-xs"
                        onChange={(e) => doUpload(e?.target?.files?.[0])}
                    />
                </div>
            )}
        </div>
    )
}
