import { z } from 'zod'
import Link from 'next/link'
import { BumpDisplay } from '~/components/common/BumpDisplay'
import { IconPropertyDisplay } from '~/components/common/IconPropertyDisplay'
import { CreateBumpButton } from '~/components/common/CreateBump'
import { AskTypeDisplay } from '~/components/common/AskTypeDisplay'
import useAuthStore from '~/store/useAuthStore'
import { RouterOutput, trpc } from '~/utils/trpc'
import { Countdown } from '~/components/common/Countdown'
import { AskStatus, CountdownProgress } from '~/components/common/CountdownProgress'
import useActionStore from '~/store/actionStore'
import { format } from 'date-fns'
import { standardDateFormat } from '~/utils/date'
import { TagList } from '~/components/common/TagList'

type AskPreviewOutput = RouterOutput['ask']['list']['items'][0]

export const createBumpForAsk = z.object({
    amount: z.number().min(1),
    askId: z.string(),
})

interface AskPreviewProps {
    ask: AskPreviewOutput
}

export const AskPreview = ({ ask }: AskPreviewProps) => {
    const { createOffer } = useActionStore()
    const { user } = useAuthStore()

    return (
        <div
            id="ask-preview-host"
            className={
                'card-container flex max-h-[500px] min-h-[500px] flex-col justify-between lg:max-h-[470px] lg:min-h-[470px]'
            }
        >
            {ask.askContext && (
                <>
                    <div className={'relative cursor-pointer object-cover'}>
                        <Link href={`/ask/single/${ask.askContext.slug}`}>
                            <img
                                className={'h-64 w-full rounded-t-global object-cover'}
                                src={ask.askContext.headerImageUrl ?? ''}
                                alt={`Header image for ask ${ask.askContext.title}`}
                            />
                            <div className={'absolute left-2 top-2'}>
                                <TagList tags={ask.tags ?? []} />
                            </div>
                        </Link>
                        <CountdownProgress
                            creationDate={ask.createdAt}
                            endDate={ask.deadlineAt ?? 0}
                            acceptedDate={ask.acceptedDeadlineAt}
                            status={ask.status}
                        />
                    </div>
                    <div className={'flex  flex-col justify-between gap-4 p-4'}>
                        <div className={'flex w-full flex-col'}>
                            <div className={'flex flex-row justify-between'}>
                                {ask.user && (
                                    <IconPropertyDisplay identifier={'userName'} value={ask.user.userName} link={true}>
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
                                                d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-4 0 3 3 0 016 0z"
                                            />
                                        </svg>
                                    </IconPropertyDisplay>
                                )}
                                <BumpDisplay bumps={ask.bumps} />
                            </div>
                            <div className={'flex flex-row justify-between'}>
                                <div className={'flex flex-col'}>
                                    <div className={'flex flex-row items-center gap-1'}>
                                        {
                                            {
                                                active: <Countdown endDate={ask.deadlineAt ?? 0} />,
                                                pending_acceptance: <Countdown endDate={ask.acceptedDeadlineAt ?? 0} />,
                                                settled: (
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
                                                ),
                                                expired: (
                                                    <IconPropertyDisplay
                                                        identifier={'id'}
                                                        value={format(ask.deadlineAt ?? 0, standardDateFormat)}
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
                                                                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                                                            />
                                                        </svg>
                                                    </IconPropertyDisplay>
                                                ),
                                                no_status: 'NO_STATUS',
                                            }[ask.status as AskStatus]
                                        }
                                    </div>
                                </div>
                                <AskTypeDisplay data-popover-target="popover-default" type={ask.askKind} />
                            </div>
                        </div>
                        <div className={'grow'}>
                            <Link href={`/ask/single/${ask.askContext.slug}`}>
                                <b className={'lg:text-md cursor-pointer'}>{ask.askContext.title}</b>
                            </Link>
                        </div>
                    </div>
                    <div id="indicator-container" className={'h-12'}>
                        {
                            {
                                active: (
                                    <div id="active-indicator" className={'flex-row-end flex h-full justify-between'}>
                                        {(ask.askKind === 'BUMP_PUBLIC' || ask.askKind === 'PUBLIC') && (
                                            <CreateBumpButton askId={ask.id} minBump={ask.minBump} />
                                        )}
                                        {ask?.user?.userName !== user?.userName && (
                                            <button
                                                onClick={() => createOffer(ask.id)}
                                                type="button"
                                                className={`btn-primary btn h-full gap-1 rounded-none rounded-br-global`}
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    shapeRendering="geometricPrecision"
                                                    textRendering="geometricPrecision"
                                                    imageRendering="optimizeQuality"
                                                    fillRule="evenodd"
                                                    clipRule="evenodd"
                                                    viewBox="0 0 512 485.95"
                                                    className={'h-4 w-4'}
                                                >
                                                    <path
                                                        fillRule="nonzero"
                                                        d="m342.29 92.77 22.44 52.57 57.18 5.12c2.3.23 4.3 1.37 5.68 3.01l.23.31a8.46 8.46 0 0 1 1.76 5.78l-.03.32a8.57 8.57 0 0 1-.88 2.95l-.13.24c-.41.75-.94 1.43-1.55 2.02l-43.49 37.99 12.81 56.09c.46 2.23-.01 4.45-1.14 6.25a8.51 8.51 0 0 1-8.71 3.86 8.242 8.242 0 0 1-3.2-1.25l-48.9-29.24-49.3 29.47c-2 1.16-4.29 1.42-6.35.9a8.554 8.554 0 0 1-5.25-3.89l-.17-.32a8.522 8.522 0 0 1-.83-5.99l12.76-55.88-43.17-37.69a8.556 8.556 0 0 1-2.9-5.88c-.14-2.16.54-4.39 2.1-6.17.78-.89 1.69-1.58 2.68-2.06 1.02-.5 2.14-.78 3.28-.85l56.77-5.09 22.52-52.71a8.566 8.566 0 0 1 4.68-4.58c2.01-.81 4.36-.86 6.53.07l.24.11c.96.44 1.79 1.03 2.47 1.71l.27.29c.66.74 1.19 1.57 1.56 2.46l.04.08zM0 259.96h106.66l-4.27 184.64H0V259.96zm123.5 169.73 3.57-153.26 68.93 1.61c29.1 5.92 57.95 22.44 86.75 41.53l53.54 1.24c24.2 2.03 36.32 26.88 12.4 42.47-19.1 13.33-43.85 11.98-69.18 9.11-17.49-1.27-18.8 22.25-.53 22.75 6.32.64 13.26-.68 19.28-.55 31.69.71 57.94-4.74 74.49-29.4l8.47-18.56L461.78 309c40.16-12.19 67.51 30.16 37.48 58.46-58.66 40.63-118.64 73.79-179.79 100.27-44.57 25.71-88.49 23.78-131.84-3.07l-64.13-34.97zm56.4-320.68c-4.09-1.72-6.01-6.44-4.29-10.53 1.72-4.09 6.44-6.01 10.53-4.29l33.57 14.22c4.09 1.72 6.01 6.44 4.29 10.53a8.056 8.056 0 0 1-10.54 4.29l-33.56-14.22zm34.13-52.31c-3.13-3.16-3.12-8.26.03-11.39 3.16-3.13 8.26-3.12 11.39.03l25.64 25.92c3.13 3.15 3.12 8.25-.03 11.38-3.16 3.14-8.26 3.12-11.39-.03L214.03 56.7zm51.46-35.44c-1.69-4.11.28-8.81 4.39-10.5 4.11-1.69 8.81.27 10.5 4.38l13.86 33.72a8.044 8.044 0 0 1-4.38 10.5c-4.11 1.69-8.82-.27-10.51-4.38l-13.86-33.72zm217.09 72.93c4.09-1.72 8.81.2 10.53 4.29 1.72 4.09-.19 8.81-4.29 10.53l-33.56 14.22c-4.09 1.72-8.81-.2-10.53-4.29a8.028 8.028 0 0 1 4.29-10.53l33.56-14.22zm-39.31-48.85c3.14-3.15 8.24-3.16 11.39-.03 3.15 3.13 3.17 8.23.03 11.39l-25.64 25.91c-3.13 3.15-8.23 3.17-11.38.03-3.15-3.13-3.17-8.23-.04-11.38l25.64-25.92zm-54.93-30.2c1.69-4.11 6.4-6.07 10.5-4.38 4.11 1.69 6.08 6.39 4.39 10.5l-13.86 33.72a8.044 8.044 0 0 1-10.5 4.38c-4.11-1.69-6.08-6.39-4.39-10.5l13.86-33.72zm-62.3-7.07c0-4.45 3.61-8.07 8.07-8.07 4.46 0 8.07 3.62 8.07 8.07v36.46c0 4.45-3.61 8.07-8.07 8.07-4.46 0-8.07-3.62-8.07-8.07V8.07z"
                                                    />
                                                </svg>
                                                {`Add Offer (${ask.offerCount})`}
                                            </button>
                                        )}
                                    </div>
                                ),
                                pending_acceptance: (
                                    <div id="pending-indicator" className={'card-status-indicator'}>
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
                                                d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                            acceptance pending
                                        </svg>
                                    </div>
                                ),
                                settled: (
                                    <div id="settled-indicator" className={'card-status-indicator'}>
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
                                                d="M4.5 12.75l6 6 9-13.5"
                                            />
                                        </svg>
                                        settled
                                    </div>
                                ),
                                expired: (
                                    <div id="expired-indicator" className={'card-status-indicator'}>
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
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                        expired
                                    </div>
                                ),
                                no_status: <div>NO_STATUS</div>,
                            }[ask.status]
                        }
                    </div>
                </>
            )}
        </div>
    )
}
