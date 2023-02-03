import { z } from 'zod'
import Link from 'next/link'
import { BumpDisplay } from '~/components/common/BumpDisplay'
import { IconPropertyDisplay } from '~/components/common/IconPropertyDisplay'
import { CreateBumpButton } from '~/components/common/CreateBump'
import { AskTypeDisplay } from '~/components/common/AskTypeDisplay'
import { RouterOutput } from '~/utils/trpc'
import { useActionStore } from '~/store/actionStore'
import { format } from 'date-fns'
import { standardDateFormat } from '~/utils/date'
import { TagList } from '~/components/common/TagList'
import { Avatar, Button, Tooltip } from '@mui/material'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'
import CheckIcon from '@mui/icons-material/Check'
import ClearIcon from '@mui/icons-material/Clear'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import NoPhotographyIcon from '@mui/icons-material/NoPhotography'
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled'
import { AskStatus } from '~/components/ask/Ask'

type AskPreviewOutput = RouterOutput['ask']['list']['items'][0]

export const createBumpForAsk = z.object({
    amount: z.number().min(1),
    askId: z.string(),
})

interface AskPreviewProps {
    ask: AskPreviewOutput
    index: number
}

export const AskPreview = ({ ask, index }: AskPreviewProps) => {
    const { createOffer } = useActionStore()

    return (
        <div
            id={`ask-preview-host-${index}`}
            data-testid={'ask-preview-host'}
            className={`card-container flex flex-col justify-between`}
        >
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
                                    <div className={'static'}>
                                        <img
                                            className={'h-64 w-full rounded-t-global object-cover'}
                                            src={`https://picsum.photos/seed/${ask.id}/400/300`}
                                            alt={`Placeholder`}
                                        />
                                        <div
                                            className={
                                                'absolute bottom-0 right-0 w-full rounded-tl-global bg-info px-6 py-2 opacity-70'
                                            }
                                        >
                                            <NoPhotographyIcon color={'warning'} />
                                            <b className={'ml-2 text-white'}>no header image</b>
                                        </div>
                                    </div>
                                )}
                            </Link>
                            <div className={'absolute left-2 top-2'}>
                                <TagList tags={ask.tags ?? []} />
                            </div>
                        </div>
                    </div>
                    <div className={'flex flex-col justify-between gap-4 p-4 text-btcgrey'}>
                        <div className={'flex flex-row gap-2'}>
                            {ask.user && <Avatar alt="User avatar" src={ask.user.profileImage ?? ''} />}
                            <div className={'flex w-full flex-col'}>
                                <div className={'flex flex-row justify-between'}>
                                    {ask.user && (
                                        <IconPropertyDisplay
                                            identifier={'createdAt'}
                                            value={format(ask.createdAt ?? 0, standardDateFormat)}
                                        >
                                            <PlayCircleFilledIcon fontSize={'small'} />
                                        </IconPropertyDisplay>
                                    )}
                                    <BumpDisplay bumps={ask.bumps} offerCount={ask.offerCount} />
                                </div>
                                <div className={'flex flex-row justify-between'}>
                                    <IconPropertyDisplay identifier={'userName'} value={ask.user?.userName} link={true}>
                                        <AccountCircleIcon fontSize={'small'} />
                                    </IconPropertyDisplay>
                                    <AskTypeDisplay data-popover-target="popover-default" type={ask.askKind} />
                                </div>
                            </div>
                        </div>
                        <div className={'h-16 grow text-btcgrey'}>
                            <Link id={'ask-title-in-ask-preview'} href={`/ask/single/${ask.askContext.slug}`}>
                                <b className={'lg:text-md cursor-pointer'}>{ask.askContext.title}</b>
                            </Link>
                        </div>
                        {ask?.space?.name && (
                            <Tooltip title={'space'}>
                                <div className={'w-44 text-xs'}>s:{ask.space.name}</div>
                            </Tooltip>
                        )}
                    </div>
                    {
                        {
                            OPEN: (
                                <div id="active-indicator" className={'card-status-indicator-running'}>
                                    {(ask.askKind === 'BUMP_PUBLIC' || ask.askKind === 'PUBLIC') && (
                                        <Tooltip title={'bump this ask with some sats'}>
                                            <div className={'w-1/2'}>
                                                <CreateBumpButton askId={ask.id} minBump={ask.minBump} />
                                            </div>
                                        </Tooltip>
                                    )}
                                    <Tooltip title={`add an offer for this ask`}>
                                        <Button
                                            id={'add-offer-button'}
                                            onClick={() => createOffer(ask.id)}
                                            color={'primary'}
                                            component="div"
                                            variant={'contained'}
                                            startIcon={<LocalOfferIcon />}
                                        >
                                            Add Offer
                                        </Button>
                                    </Tooltip>
                                </div>
                            ),
                            SETTLED: (
                                <div id="settled-indicator" className={'card-status-indicator-settled'}>
                                    <CheckIcon />
                                    settled
                                </div>
                            ),
                            CANCELED: (
                                <div id="expired-indicator" className={'card-status-indicator-expired'}>
                                    <ClearIcon />
                                    cancelled
                                </div>
                            ),
                        }[ask.askStatus as AskStatus]
                    }
                </>
            )}
        </div>
    )
}
