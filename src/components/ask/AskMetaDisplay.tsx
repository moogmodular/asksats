import { IconPropertyDisplay } from '~/components/common/IconPropertyDisplay'
import { format } from 'date-fns'
import { standardDateFormat } from '~/utils/date'
import { RouterOutput } from '~/utils/trpc'
import { CountdownDisplay } from '~/components/common/CountdownDisplay'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import LastPageIcon from '@mui/icons-material/LastPage'
import SportsScoreIcon from '@mui/icons-material/SportsScore'
import { Tooltip } from '@mui/material'

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
                            <div className={'flex flex-row items-center gap-1'}>
                                {(ask.status === 'active' || ask.status === 'pending_acceptance') && (
                                    <CountdownDisplay endDate={ask.deadlineAt ?? new Date()} />
                                )}
                            </div>
                            <div>
                                {
                                    {
                                        settled: <b>settled</b>,
                                        active: <b>active</b>,
                                        expired: <b>expired</b>,
                                        pending_acceptance: <b>acceptance pending</b>,
                                        no_status: <b>no status</b>,
                                    }[ask.status]
                                }
                            </div>
                        </div>

                        <Tooltip title={'final settlement'}>
                            <div>
                                <IconPropertyDisplay
                                    identifier={'id'}
                                    value={format(ask.acceptedDeadlineAt ?? 0, standardDateFormat)}
                                >
                                    <SportsScoreIcon fontSize={'small'} />
                                </IconPropertyDisplay>
                            </div>
                        </Tooltip>
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
                        <Tooltip title={'ask expiry'}>
                            <div>
                                <IconPropertyDisplay
                                    identifier={'id'}
                                    value={format(ask.deadlineAt ?? 0, standardDateFormat)}
                                >
                                    <LastPageIcon fontSize={'small'} />
                                </IconPropertyDisplay>
                            </div>
                        </Tooltip>
                    </div>
                </div>
            )}
        </>
    )
}
