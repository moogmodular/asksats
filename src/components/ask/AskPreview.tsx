import { z } from 'zod'
import Link from 'next/link'
import { BumpDisplay } from '~/components/common/BumpDisplay'
import { IconPropertyDisplay } from '~/components/common/IconPropertyDisplay'
import { CreateBumpButton } from '~/components/common/CreateBump'
import { AskTypeDisplay } from '~/components/common/AskTypeDisplay'
import useAuthStore from '~/store/useAuthStore'
import { RouterOutput, trpc } from '~/utils/trpc'
import { CountdownDisplay } from '~/components/common/CountdownDisplay'
import { AskStatus, CountdownProgress } from '~/components/common/CountdownProgress'
import useActionStore from '~/store/actionStore'
import { format } from 'date-fns'
import { standardDateFormat } from '~/utils/date'
import { TagList } from '~/components/common/TagList'
import { Button } from '@mui/material'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import CheckIcon from '@mui/icons-material/Check'
import ClearIcon from '@mui/icons-material/Clear'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import DoneAllIcon from '@mui/icons-material/DoneAll'
import DoDisturbIcon from '@mui/icons-material/DoDisturb'

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
        <div id="ask-preview-host" className={`card-container flex flex-col justify-between`}>
            {ask.askContext && (
                <>
                    <div className={'relative cursor-pointer object-cover'}>
                        <div>
                            <Link href={`/ask/single/${ask.askContext.slug}`}>
                                {ask.askContext.headerImageUrl ? (
                                    <img
                                        className={'h-64 w-full rounded-t-global object-cover'}
                                        src={ask.askContext.headerImageUrl ?? ''}
                                        alt={`Header image for ask ${ask.askContext.title}`}
                                    />
                                ) : (
                                    <img
                                        className={'h-64 w-full rounded-t-global object-cover'}
                                        src={'/no_image_placeholder.jpg'}
                                        alt={`Placeholder`}
                                    />
                                )}
                            </Link>
                            <div className={'absolute left-2 top-2'}>
                                <TagList tags={ask.tags ?? []} />
                            </div>
                        </div>
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
                                        <AccountCircleIcon fontSize={'small'} />
                                    </IconPropertyDisplay>
                                )}
                                <BumpDisplay bumps={ask.bumps} offerCount={ask.offerCount} />
                            </div>
                            <div className={'flex flex-row justify-between'}>
                                <div className={'flex flex-col'}>
                                    <div className={'flex flex-row items-center gap-1'}>
                                        {
                                            {
                                                active: <CountdownDisplay endDate={ask.deadlineAt ?? 0} />,
                                                pending_acceptance: (
                                                    <CountdownDisplay endDate={ask.acceptedDeadlineAt ?? 0} />
                                                ),
                                                settled: (
                                                    <IconPropertyDisplay
                                                        identifier={'id'}
                                                        value={format(ask.acceptedDeadlineAt ?? 0, standardDateFormat)}
                                                    >
                                                        <DoneAllIcon fontSize={'small'} />
                                                    </IconPropertyDisplay>
                                                ),
                                                expired: (
                                                    <IconPropertyDisplay
                                                        identifier={'id'}
                                                        value={format(ask.deadlineAt ?? 0, standardDateFormat)}
                                                    >
                                                        <DoDisturbIcon fontSize={'small'} />
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
                        <div className={'h-16 grow'}>
                            <Link href={`/ask/single/${ask.askContext.slug}`}>
                                <b className={'lg:text-md cursor-pointer'}>{ask.askContext.title}</b>
                            </Link>
                        </div>
                    </div>
                    {
                        {
                            active: (
                                <div id="active-indicator" className={'card-status-indicator-running'}>
                                    {(ask.askKind === 'BUMP_PUBLIC' || ask.askKind === 'PUBLIC') && (
                                        <div className={'w-1/2'}>
                                            <CreateBumpButton askId={ask.id} minBump={ask.minBump} />
                                        </div>
                                    )}
                                    {ask?.user?.userName !== user?.userName && (
                                        <Button
                                            onClick={() => createOffer(ask.id)}
                                            variant={'contained'}
                                            component="label"
                                            size={'small'}
                                            startIcon={<LocalOfferIcon />}
                                        >
                                            Add Offer
                                        </Button>
                                    )}
                                </div>
                            ),
                            pending_acceptance: (
                                <div id="pending-indicator" className={'card-status-indicator-pending'}>
                                    <AccessTimeIcon />
                                    acceptance pending
                                </div>
                            ),
                            settled: (
                                <div id="settled-indicator" className={'card-status-indicator-settled'}>
                                    <CheckIcon />
                                    settled
                                </div>
                            ),
                            expired: (
                                <div id="expired-indicator" className={'card-status-indicator-expired'}>
                                    <ClearIcon />
                                    expired
                                </div>
                            ),
                            no_status: <div>NO_STATUS</div>,
                        }[ask.status]
                    }
                    {/*</div>*/}
                </>
            )}
        </div>
    )
}
