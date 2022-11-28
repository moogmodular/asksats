import { RouterOutput } from '~/utils/trpc'
import { MDRender } from '~/components/common/MDRender'
import { IconPropertyDisplay } from '~/components/common/IconPropertyDisplay'
import { format } from 'date-fns'
import { standardDateFormat } from '~/utils/date'
import useActionStore from '~/store/actionStore'

type OfferOutput = RouterOutput['offer']['listForAsk'][0]

interface OfferPreviewProps {
    offer: OfferOutput
    setFavOffer: (offerId: string) => void
    canFavourite?: boolean
}

export const OfferPreview = ({ offer, setFavOffer, canFavourite }: OfferPreviewProps) => {
    const { openImage } = useActionStore()

    return (
        <div key={offer.id}>
            <div tabIndex={0} className="secondary-container collapse-plus collapse border">
                <div className="collapse-title flex flex-row gap-4 text-xl font-medium">
                    <div className="form-control w-28">
                        <label className="label cursor-pointer">
                            {canFavourite ? (
                                <input
                                    onChange={() => setFavOffer(offer.id)}
                                    id="favourite-trigger"
                                    type="checkbox"
                                    className="toggle-accent toggle toggle-lg ml-2"
                                    checked={Boolean(offer.favouritedById)}
                                />
                            ) : (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="h-6 w-6"
                                >
                                    <path
                                        fill={offer.favouritedById ? '#FBBF24' : 'none'}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                                    />
                                </svg>
                            )}
                        </label>
                    </div>

                    <div className={'text-sm'}>
                        <IconPropertyDisplay identifier={'id'} value={format(offer.createdAt ?? 0, standardDateFormat)}>
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
                    </div>
                </div>
                <div className="collapse-content">
                    <div className={'max-w-52 flex w-52 flex-row gap-1'}>
                        {offer.offerContext.filePairs.map((pair, index) => {
                            return (
                                <div
                                    key={pair.id}
                                    className="avatar flex flex-row gap-2"
                                    onClick={() => openImage(pair.obscureFileUrl)}
                                >
                                    <img src={pair.obscureFileUrl} alt="" />
                                    {pair.offerFileUrl && <img src={pair.offerFileUrl} alt="" />}
                                </div>
                            )
                        })}
                    </div>
                    <MDRender content={offer.offerContext.content ?? ''} />
                </div>
            </div>
        </div>
    )
}
