import { trpc } from '~/utils/trpc'
import Link from 'next/link'
import { format } from 'date-fns'
import { standardDateFormat } from '~/utils/date'

interface OfferListProps {}

export const OfferList = ({}: OfferListProps) => {
    const { data: offerListData } = trpc.offer.myOffers.useQuery()

    return (
        <div className={'flex w-full flex-col gap-4 overflow-y-scroll xl:grid-cols-3'}>
            <h3 className={'text-lg font-bold'}>my offers:</h3>
            {offerListData?.map((offer, index) => {
                return (
                    <div key={index} className={'secondary-container flex flex-row gap-2'}>
                        <Link href={`/ask/single/${offer?.ask?.askContext?.slug ?? ''}`}>
                            <div className={'link'}>{offer.ask?.askContext?.title}</div>
                        </Link>
                        <div className="divider divider-horizontal"></div>
                        <span>created: {format(offer.createdAt ?? 0, standardDateFormat)}</span>
                    </div>
                )
            })}
        </div>
    )
}
