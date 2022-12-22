import { trpc } from '~/utils/trpc'
import { FileView } from '~/components/FileView'
import { format } from 'date-fns'
import { standardDateFormat } from '~/utils/date'
import { LinkBehaviour } from '~/components/common/LinkBehaviour'
import { Link } from '@mui/material'

interface FileListProps {}

export const FileList = ({}: FileListProps) => {
    const { data: myFilesData } = trpc.asset.myFiles.useQuery()

    return (
        <div
            className={
                'no-scrollbar flex max-h-screen w-full flex-col gap-2 overflow-x-hidden overflow-y-scroll overscroll-auto pb-12'
            }
        >
            <b>my Files:</b>
            <div className={'flex flex-row gap-4'}>
                {myFilesData &&
                    myFilesData.map((pair, index) => {
                        return (
                            <div key={index} className={'flex flex-col border p-4'}>
                                <i>created: {format(pair.createdAt ?? 0, standardDateFormat)}</i>
                                {pair?.offerContext?.offer?.ask?.askContext && (
                                    <div>
                                        Ask:{' '}
                                        <Link
                                            component={LinkBehaviour}
                                            href={`/ask/single/${pair.offerContext.offer.ask.askContext?.slug ?? ''}`}
                                            variant="body2"
                                            className={'w-4/5'}
                                        >
                                            {pair.offerContext.offer.ask.askContext.title}
                                        </Link>
                                    </div>
                                )}
                                <FileView
                                    key={index}
                                    filePairId={pair.id}
                                    offerFileUrl={pair.offerFile.url}
                                    obscureFileUrl={pair.obscureFile.url}
                                />
                            </div>
                        )
                    })}
            </div>
        </div>
    )
}
