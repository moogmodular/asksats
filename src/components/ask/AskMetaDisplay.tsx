import { IconPropertyDisplay } from '~/components/common/IconPropertyDisplay'
import { format } from 'date-fns'
import { standardDateFormat } from '~/utils/date'
import { RouterOutput } from '~/utils/trpc'
import { Countdown } from '~/components/common/Countdown'

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
                                <IconPropertyDisplay identifier={'userName'} value={''}>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.5}
                                        stroke="currentColor"
                                        className="h-4 w-4"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </IconPropertyDisplay>
                                {(ask.status === 'active' || ask.status === 'pending_acceptance') && (
                                    <Countdown endDate={ask.deadlineAt ?? new Date()} />
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
                        <IconPropertyDisplay
                            identifier={'id'}
                            value={format(ask.acceptedDeadlineAt ?? 0, standardDateFormat)}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="h-4 w-4"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0"
                                />
                            </svg>
                        </IconPropertyDisplay>
                    </div>
                    <div className={'flex flex-col'}>
                        <IconPropertyDisplay identifier={'id'} value={format(ask.createdAt ?? 0, standardDateFormat)}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="h-4 w-4"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
                                />
                            </svg>
                        </IconPropertyDisplay>
                        <IconPropertyDisplay identifier={'id'} value={format(ask.deadlineAt ?? 0, standardDateFormat)}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="h-4 w-4"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15M9 12l3 3m0 0l3-3m-3 3V2.25"
                                />
                            </svg>
                        </IconPropertyDisplay>
                    </div>
                </div>
            )}
        </>
    )
}
