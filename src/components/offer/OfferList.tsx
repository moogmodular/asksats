import { trpc } from '~/utils/trpc'
import { OfferPreview } from '~/components/offer/OfferPreview'
import useMessageStore from '~/store/messageStore'

interface OfferListProps {
    askId: string
    canFavourite: boolean
}

export const OfferList = ({ askId, canFavourite }: OfferListProps) => {
    const { showToast } = useMessageStore()
    const { data: offerListData } = trpc.offer.listForAsk.useQuery({ askId: askId })
    const { mutateAsync: setFavMutation } = trpc.offer.setFavoutieForAsk.useMutation()
    const utils = trpc.useContext()

    const setFavourite = async (offerId: string) => {
        await setFavMutation({ offerId: offerId, askId: askId }).catch((error) => {
            showToast('error', error.message)
        })
        utils.offer.listForAsk.invalidate()
    }

    return (
        <div className={'flex flex-col gap-4'}>
            {offerListData &&
                offerListData.map((offer, index) => (
                    <OfferPreview key={offer.id} offer={offer} setFavOffer={setFavourite} canFavourite={canFavourite} />
                ))}
        </div>
    )
}
