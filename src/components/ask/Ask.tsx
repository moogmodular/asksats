import { MDRender } from '~/components/common/MDRender'
import { RouterOutput, trpc } from '~/utils/trpc'
import { OfferList } from '~/components/offer/OfferList'
import { AskAuthorDisplay } from '~/components/ask/AskAuthorDisplay'
import { AskMetaDisplay } from '~/components/ask/AskMetaDisplay'
import { CountdownProgress } from '~/components/common/CountdownProgress'
import { BumpDisplay } from '~/components/common/BumpDisplay'
import { StandardButton } from '~/components/common/StandardButton'
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
import { useEffect } from 'react'
import { AskTypeDisplay } from '~/components/common/AskTypeDisplay'

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
                className={`min-w-1 flex flex-row items-center justify-center rounded-global text-gray-400 shadow`}
            >
                {widthNumber > 10 && (
                    <>
                        <div>{bump.amount}</div>
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
                        <div onClick={() => openImage(askData.headerImageUrl)}>
                            <img
                                src={askData.headerImageUrl}
                                alt=""
                                className={'h-96 w-full cursor-pointer rounded-t-global object-cover'}
                            />
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
                            <div className={'mb-4 mt-4 flex w-full flex-row justify-between'}>
                                <AskAuthorDisplay user={askData.ask.user} />
                                <AskMetaDisplay ask={askData.ask} />
                            </div>
                            <div className={'flex flex-row gap-4 '}>
                                <div className={'flex grow flex-row gap-1'}>
                                    {askData.ask.bumpSummary && bumpSummary(askData.ask.bumpSummary)}
                                </div>
                                <BumpDisplay bumps={askData.ask.bumps} />
                                {askData.ask.status === 'active' && (
                                    <div className={'flex-row-end flex min-w-fit items-center justify-between'}>
                                        {(askData.ask.askKind === 'BUMP_PUBLIC' ||
                                            askData.ask?.askKind === 'PUBLIC') && (
                                            <div className={'justify-items flex flex-row items-center'}>
                                                <button
                                                    onClick={() => handleCreateBump(askData.ask.id ?? '')}
                                                    disabled={!!errors.amount}
                                                    type="button"
                                                    className={`btn-primary btn-sm btn gap-1`}
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
                                                            d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
                                                        />
                                                    </svg>
                                                    {`Bump with`}
                                                </button>
                                                <form>
                                                    <input
                                                        id="transact-invoice-amount-input"
                                                        type={'number'}
                                                        {...register('amount', {
                                                            valueAsNumber: true,
                                                            min: askData.ask.minBump,
                                                            required: true,
                                                        })}
                                                        className="input-bordered input input-sm w-32"
                                                    />
                                                </form>
                                                <SatoshiIcon />
                                            </div>
                                        )}
                                        {askData.ask?.user?.userName !== user?.userName && (
                                            <StandardButton
                                                onClick={() => createOffer(askData.ask.id ?? '')}
                                                type={'primary'}
                                                text={`Add Offer (${askData.ask?.offerCount})`}
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
                                            </StandardButton>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className={'content-block'}>
                        <h1 className={' py-2 text-3xl'}>{askData.title}</h1>
                        <div className="divider"></div>
                        <MDRender content={askData.content ?? ''} />
                        <OfferList askId={askData.ask.id ?? ''} canFavourite={user?.id === askData?.ask?.user?.id} />
                    </div>
                    <CreateComment askId={askData.ask.id} />
                    <CommentList askId={askData?.ask?.id ?? ''} />
                </div>
            )}
        </>
    )
}
