import { trpc } from '~/utils/trpc'
import { OfferPreview } from '~/components/offer/OfferPreview'

interface OfferListProps {
    askId: string
    canFavourite: boolean
}

export const OfferList = ({ askId, canFavourite }: OfferListProps) => {
    const { data: offerListData } = trpc.offer.listForAsk.useQuery({ askId: askId })

    return (
        <div className={'flex flex-col gap-4'}>
            {offerListData &&
                offerListData.map((offer, index) => (
                    <OfferPreview index={index} key={offer.id} offer={offer} canFavourite={canFavourite} />
                ))}
        </div>
    )
}
