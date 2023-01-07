import { MDRender } from '~/components/common/MDRender'
import { RouterOutput, trpc } from '~/utils/trpc'
import { OfferList } from '~/components/offer/OfferList'
import { AskAuthorDisplay } from '~/components/ask/AskAuthorDisplay'
import { AskMetaDisplay } from '~/components/ask/AskMetaDisplay'
import { CountdownProgress } from '~/components/common/CountdownProgress'
import { BumpDisplay } from '~/components/common/BumpDisplay'
import useActionStore from '~/store/actionStore'
import useAuthStore from '~/store/useAuthStore'
import { createHash } from 'crypto'
import { CreateComment } from '~/components/comments/CreateComment'
import { CommentList } from '~/components/comments/CommentList'
import useMessageStore from '~/store/messageStore'
import { useZodForm } from '~/utils/useZodForm'
import { createBumpForAsk } from '~/components/ask/AskPreview'
import { SatoshiIcon } from '~/components/common/SatishiIcon'
import { TagList } from '~/components/common/TagList'
import { useEffect, useState } from 'react'
import { AskTypeDisplay } from '~/components/common/AskTypeDisplay'
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

type BumpSummary = RouterOutput['ask']['byContextSlug']['ask']['bumpSummary']

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
    const { createOffer, openImage } = useActionStore()
    const { user } = useAuthStore()
    const { showToast } = useMessageStore()

    const [createQuestionVisible, setCreateQuestionVisible] = useState(false)

    const mutateCreateBump = trpc.bump.createForAsk.useMutation()
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

    useEffect(() => {
        setValue('amount', askData?.ask.minBump ?? 10)
    }, [askData])

    return (
        <>
            {askData && askData.ask && (
                <div className={'no-scrollbar flex max-h-screen w-full flex-col gap-4 overflow-y-scroll pb-12'}>
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
                                        src={`https://picsum.photos/seed/${askData.askId}/800/600`}
                                        alt={`Placeholder`}
                                    />
                                    <div className={'bottom-72 right-0 bg-blue-700 px-6 py-2 opacity-70'}>
                                        <NoPhotographyIcon color={'warning'} />
                                        <b className={'ml-2 text-white'}>no header image provided by user</b>
                                    </div>
                                </div>
                            )}
                        </div>
                        <CountdownProgress
                            creationDate={askData.ask.createdAt ?? new Date()}
                            endDate={askData.ask.deadlineAt ?? new Date()}
                            acceptedDate={askData.ask.acceptedDeadlineAt ?? new Date()}
                            status={askData.ask.status}
                        />
                        <div className={'p-4'}>
                            <div className={'flex gap-4'}>
                                <AskTypeDisplay
                                    data-popover-target="popover-default"
                                    type={askData.ask.askKind ?? 'PRIVATE'}
                                />
                                <TagList tags={askData.ask.tags ?? []} />
                            </div>
                            <h1 className={'my-4 py-2 text-3xl'}>{askData.title}</h1>
                            <div className={'mb-4 mt-4 flex w-full flex-col justify-between lg:flex-row'}>
                                <AskAuthorDisplay user={askData.ask.user} />
                                <AskMetaDisplay ask={askData.ask} />
                            </div>
                            <div className={'flex flex-row gap-4 '}>
                                <Tooltip title="All bumps for this ask">
                                    <div className={'flex grow flex-row gap-1'}>
                                        {askData.ask.bumpSummary && bumpSummary(askData.ask.bumpSummary)}
                                    </div>
                                </Tooltip>
                                <BumpDisplay
                                    bumps={askData.ask.bumps}
                                    offerCount={askData.ask.offerCount ?? 0}
                                    hasFavouritedOffer={Boolean(askData.ask.favouriteOffer)}
                                />
                                {askData.ask.status === 'active' && (
                                    <div className={'flex-row-end flex min-w-fit items-center justify-between'}>
                                        {(askData.ask.askKind === 'BUMP_PUBLIC' ||
                                            askData.ask?.askKind === 'PUBLIC') && (
                                            <div className={'flex flex-row'}>
                                                <Tooltip title={'bump this ask with some sats'}>
                                                    <TextField
                                                        id="create-ask-amount"
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
                                                                        component="label"
                                                                        disabled={!!errors.amount}
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
                                        {/*{askData.ask?.user?.userName !== user?.userName && (*/}
                                        {/*    <Button*/}
                                        {/*        variant="outlined"*/}
                                        {/*        onClick={() => createOffer(askData.ask.id ?? '')}*/}
                                        {/*        startIcon={<LocalOfferIcon />}*/}
                                        {/*    >*/}
                                        {/*        {`Add Offer (${askData.ask?.offerCount})`}*/}
                                        {/*    </Button>*/}
                                        {/*)}*/}
                                        <Tooltip title={`add an offer for this ask`}>
                                            <Button
                                                variant="outlined"
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
                                <div className={'flex flex-row gap-4'}>
                                    <InfoIcon />
                                    <i>
                                        if you have any offers you can set any one of them as your favourite and change
                                        your mind at any time, however when the ask runs out your favourite offer will
                                        be the one that is accepted
                                    </i>
                                </div>
                                <OfferList
                                    askId={askData.ask.id ?? ''}
                                    canFavourite={
                                        user?.id === askData?.ask?.user?.id &&
                                        (askData.ask.status === 'active' || askData.ask.status === 'pending_acceptance')
                                    }
                                />
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
