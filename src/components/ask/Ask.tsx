import { MDRender } from '~/components/common/MDRender'
import { RouterOutput, trpc } from '~/utils/trpc'
import { OfferList } from '~/components/offer/OfferList'
import { AskAuthorDisplay } from '~/components/ask/AskAuthorDisplay'
import { AskMetaDisplay } from '~/components/ask/AskMetaDisplay'
import { BumpDisplay } from '~/components/common/BumpDisplay'
import { useActionStore } from '~/store/actionStore'
import { createHash } from 'crypto'
import { CreateComment } from '~/components/comments/CreateComment'
import { CommentList } from '~/components/comments/CommentList'
import { useMessageStore } from '~/store/messageStore'
import { useZodForm } from '~/utils/useZodForm'
import { createBumpForAsk } from '~/components/ask/AskPreview'
import { SatoshiIcon } from '~/components/common/SatishiIcon'
import { useEffect, useState } from 'react'
import { AskTypeDisplay } from '~/components/common/AskTypeDisplay'
import EditIcon from '@mui/icons-material/Edit'
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Button,
    Divider,
    IconButton,
    InputAdornment,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material'
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'
import NoPhotographyIcon from '@mui/icons-material/NoPhotography'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import InfoIcon from '@mui/icons-material/Info'
import DoNotDisturbIcon from '@mui/icons-material/DoNotDisturb'
import { useStore } from 'zustand'
import { authedUserStore } from '~/store/authedUserStore'
import { NextSeo } from 'next-seo'
import { format } from 'date-fns'

type BumpSummary = RouterOutput['ask']['byContextSlug']['ask']['bumpSummary']
export type AskStatus = 'OPEN' | 'SETTLED' | 'CANCELED'

const colorFromNumber = (number: number) => {
    return '#' + createHash('sha256').update(number.toString()).digest('hex').slice(0, 6)
}

const getWidth = (amount: number, sum: number) => {
    const width = (amount / sum) * 100
    return { widthNumber: width, widthString: width + '%' }
}

const bumpSummary = (bumps: BumpSummary) => {
    const sum = bumps?.reduce((acc, curr) => acc + curr.amount, 0)
    return bumps?.map((bump, index) => {
        const { widthNumber, widthString } = getWidth(bump.amount, sum ?? 100)
        return (
            <div
                key={index}
                style={{
                    width: widthString,
                    background: colorFromNumber(bump.amount),
                }}
                className={`min-w-1 flex flex-row items-center justify-center rounded-none text-gray-400 shadow`}
            >
                {widthNumber > 10 && (
                    <>
                        <div className={'text-white'}>{bump.amount}</div>
                        <SatoshiIcon />
                    </>
                )}
            </div>
        )
    })
}

interface AskProps {
    slug: string
}

export const Ask = ({ slug }: AskProps) => {
    const { createOffer, openImage, openEditAsk } = useActionStore()
    const { user } = useStore(authedUserStore)
    const { showToast } = useMessageStore()

    const [createQuestionVisible, setCreateQuestionVisible] = useState(false)

    const mutateCreateBump = trpc.bump.createForAsk.useMutation()
    const mutateCancelAsk = trpc.ask.cancel.useMutation()
    const { data: askData } = trpc.ask.byContextSlug.useQuery({ slug: slug })
    const utils = trpc.useContext()

    const {
        register,
        getValues,
        setValue,
        formState: { errors },
    } = useZodForm({
        schema: createBumpForAsk,
        defaultValues: {
            amount: 10,
            askId: '',
        },
    })

    useEffect(() => {
        setValue('amount', askData?.ask.minBump ?? 10)
    }, [askData])

    const handleCreateBump = async (askId: string) => {
        await mutateCreateBump
            .mutateAsync({
                amount: getValues('amount'),
                askId: askId,
            })
            .catch((error) => {
                showToast('error', error.message)
            })
        utils.ask.invalidate()
    }

    const handleCancelAsk = async () => {
        await mutateCancelAsk
            .mutateAsync({
                askId: askData?.ask.id ?? '',
            })
            .then(() => {
                showToast('success', 'Ask canceled')
            })
            .catch((error) => {
                showToast('error', error.message)
            })
        utils.ask.invalidate()
    }

    const handleEditAsk = async () => {
        openEditAsk(askData?.ask.id ?? '')
    }

    return (
        <>
            {askData && askData.ask && (
                <div
                    className={
                        'no-scrollbar flex max-h-screen w-full flex-col gap-4 overflow-y-scroll px-0 pb-12 text-btcgrey lg:px-20'
                    }
                >
                    <NextSeo
                        title={`ArtiSats.com - ${askData.title}`}
                        description={`${askData.content}`}
                        canonical="https://artisats.com"
                        openGraph={{
                            title: askData.title,
                            description: askData.content,
                            url: window.location.href,
                            type: 'ask',
                            images: [
                                {
                                    url: askData.headerImageUrl,
                                    alt: askData.title,
                                },
                            ],
                            siteName: 'ArtiSats',
                            article: {
                                authors: [askData.ask?.user?.userName ?? ''],
                                publishedTime: format(askData.ask?.createdAt ?? 0, 'yyyy-MM-dd'),
                            },
                        }}
                        twitter={{
                            handle: '@artisatscom',
                            site: '@ArtiSats',
                            cardType: 'summary_large_image',
                        }}
                    />
                    <div className={'ask-header-block'}>
                        <div onClick={() => (askData.headerImageUrl ? openImage(askData.headerImageUrl) : {})}>
                            {askData.headerImageUrl ? (
                                <img
                                    className={'h-64 w-full rounded-t-global object-cover'}
                                    src={askData.headerImageUrl ?? ''}
                                    alt={`Header image for ask ${askData.headerImageUrl}`}
                                />
                            ) : (
                                <div className={'static'}>
                                    <img
                                        className={'h-64 w-full rounded-t-global object-cover'}
                                        src={`https://source.unsplash.com/random/400×300`}
                                        alt={`Placeholder`}
                                    />
                                    <div className={'bottom-72 right-0 bg-info px-6 py-2 opacity-70'}>
                                        <NoPhotographyIcon color={'warning'} />
                                        <b className={'ml-2 text-white'}>no header image provided by user</b>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className={'p-4'}>
                            <div className={'flex flex-row justify-between '}>
                                <div className={'flex flex-row items-center gap-4'}>
                                    {askData?.ask?.space?.name && (
                                        <Tooltip title={'space'}>
                                            <div className={'w-28 text-xs'}>s:{askData.ask.space.name}</div>
                                        </Tooltip>
                                    )}
                                    <AskTypeDisplay
                                        data-popover-target="popover-default"
                                        type={askData.ask.askKind ?? 'PRIVATE'}
                                    />
                                </div>
                                {askData?.ask?.user?.id === user?.id && askData.ask.askStatus === 'OPEN' && (
                                    <div className={'flex flex-row gap-4'}>
                                        {askData.ask.editable && (
                                            <Tooltip title={`edit this ask`}>
                                                <Button
                                                    id="edit-ask-button"
                                                    variant="contained"
                                                    color="info"
                                                    component="div"
                                                    onClick={() => handleEditAsk()}
                                                    startIcon={<EditIcon />}
                                                >
                                                    edit
                                                </Button>
                                            </Tooltip>
                                        )}
                                        <Tooltip title={`cancel this ask`}>
                                            <Button
                                                id="cancel-ask-button"
                                                variant="contained"
                                                color="warning"
                                                component="div"
                                                onClick={() => handleCancelAsk()}
                                                startIcon={<DoNotDisturbIcon />}
                                            >
                                                cancel
                                            </Button>
                                        </Tooltip>
                                    </div>
                                )}
                            </div>
                            <h1 className={'my-4 py-2 text-3xl'}>{askData.title}</h1>
                            <div className={'mb-4 mt-4 flex w-full flex-col justify-between lg:flex-row'}>
                                <AskAuthorDisplay user={askData.ask.user} />
                                <AskMetaDisplay ask={askData.ask} />
                            </div>
                            <div className={'flex flex-col gap-4 lg:flex-row '}>
                                <Tooltip title="All bumps for this ask">
                                    <div className={'flex grow flex-row gap-1'}>
                                        {askData.ask.bumpSummary && bumpSummary(askData.ask.bumpSummary)}
                                    </div>
                                </Tooltip>
                                <BumpDisplay bumps={askData.ask.bumps} offerCount={askData.ask.offerCount ?? 0} />
                                {askData.ask.askStatus === 'OPEN' && (
                                    <div className={'flex-row-end flex min-w-fit items-center justify-between gap-2'}>
                                        {(askData.ask.askKind === 'BUMP_PUBLIC' ||
                                            askData.ask?.askKind === 'PUBLIC') && (
                                            <div className={'flex flex-row'}>
                                                <Tooltip title={'bump this ask with some sats'}>
                                                    <TextField
                                                        id="bump-amount-text-field"
                                                        size={'small'}
                                                        error={Boolean(errors.amount)}
                                                        label="Bump with"
                                                        type="number"
                                                        helperText={errors.amount && errors.amount.message}
                                                        {...register('amount', {
                                                            valueAsNumber: true,
                                                            min: askData.ask.minBump,
                                                            required: true,
                                                        })}
                                                        InputProps={{
                                                            endAdornment: (
                                                                <InputAdornment position="end">
                                                                    <SatoshiIcon />
                                                                    <IconButton
                                                                        disabled={!!errors.amount}
                                                                        id="bump-amount-button"
                                                                        onClick={() =>
                                                                            handleCreateBump(askData.ask.id ?? '')
                                                                        }
                                                                        edge="end"
                                                                        color="primary"
                                                                    >
                                                                        <RocketLaunchOutlinedIcon />
                                                                    </IconButton>
                                                                </InputAdornment>
                                                            ),
                                                        }}
                                                    />
                                                </Tooltip>
                                            </div>
                                        )}
                                        <Tooltip title={`add an offer for this ask`}>
                                            <Button
                                                id={'add-offer-button'}
                                                variant="contained"
                                                color="primary"
                                                component="div"
                                                onClick={() => createOffer(askData.ask.id ?? '')}
                                                startIcon={<LocalOfferIcon />}
                                            >
                                                Add Offer
                                            </Button>
                                        </Tooltip>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className={'content-block gap-8'}>
                        <MDRender content={askData.content ?? ''} />
                        {user && (
                            <>
                                <Divider className={'my-8'} />
                                <h3 className={'mb-6 text-xl'}>Offers</h3>
                                {askData.ask.userId === user.id && (
                                    <div className={'flex flex-row gap-4'}>
                                        <InfoIcon />
                                        <i>
                                            If you received an offer you like, you can settle for it. This will close
                                            the ask and the offer will be marked as settled.
                                        </i>
                                    </div>
                                )}
                                {askData.ask.askKind !== 'PRIVATE' || askData?.ask?.user?.id === user.id ? (
                                    <OfferList
                                        askId={askData.ask.id ?? ''}
                                        canFavourite={
                                            user?.id === askData?.ask?.user?.id && askData.ask.askStatus === 'OPEN'
                                        }
                                    />
                                ) : (
                                    <b>This ask is private. Users cannot see the offers for this.</b>
                                )}
                            </>
                        )}
                    </div>

                    {user && (
                        <Accordion expanded={createQuestionVisible} onClick={() => setCreateQuestionVisible(true)}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls="panel1a-content"
                                id="panel1a-header"
                            >
                                <Typography>Ask a question</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <CreateComment
                                    askId={askData.ask.id}
                                    invalidate={async () => {
                                        setCreateQuestionVisible(false)
                                        await utils.comment.commentTreeForAsk.invalidate()
                                    }}
                                />
                            </AccordionDetails>
                        </Accordion>
                    )}
                    <CommentList askId={askData?.ask?.id ?? ''} />
                </div>
            )}
        </>
    )
}
