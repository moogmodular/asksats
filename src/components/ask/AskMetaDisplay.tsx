import { IconPropertyDisplay } from '~/components/common/IconPropertyDisplay'
import { format } from 'date-fns'
import { standardDateFormat } from '~/utils/date'
import { RouterOutput } from '~/utils/trpc'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import { Tooltip } from '@mui/material'
import { AskStatus } from '~/components/ask/Ask'

type AskMetaOutput = RouterOutput['ask']['byContextSlug']['ask']

interface AskMetaDisplayProps {
    ask: AskMetaOutput
}

export const AskMetaDisplay = ({ ask }: AskMetaDisplayProps) => {
    return (
        <>
            {ask && (
                <div className={'flex flex-row gap-2'}>
                    <div className={'flex flex-col'}>
                        <div className={'flex flex-row gap-1'}>
                            <div>
                                {
                                    {
                                        OPEN: <b>OPEN</b>,
                                        CANCELED: <b>CANCELED</b>,
                                        SETTLED: <b>SETTLED</b>,
                                    }[ask.askStatus as AskStatus]
                                }
                            </div>
                        </div>
                    </div>
                    <div className={'flex flex-col'}>
                        <Tooltip title={'ask creation'}>
                            <div>
                                <IconPropertyDisplay
                                    identifier={'id'}
                                    value={format(ask.createdAt ?? 0, standardDateFormat)}
                                >
                                    <PlayArrowIcon />
                                </IconPropertyDisplay>
                            </div>
                        </Tooltip>
                    </div>
                </div>
            )}
        </>
    )
}
