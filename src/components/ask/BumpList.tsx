import { trpc } from '~/utils/trpc'
import Link from 'next/link'
import { format } from 'date-fns'
import { standardDateFormat } from '~/utils/date'

interface BumpListProps {}

export const BumpList = ({}: BumpListProps) => {
    const { data: bumpListData } = trpc.bump.myBumps.useQuery()

    return (
        <div className={'flex flex-col gap-2'}>
            <h3 className={'text-lg font-bold'}>my bumps:</h3>
            {bumpListData?.map((bump, index) => {
                return (
                    <div key={index} className={'secondary-container flex flex-row gap-2'}>
                        <Link href={`/ask/single/${bump?.ask?.askContext?.slug ?? ''}`}>
                            <div className={'link'}>{bump.ask?.askContext?.title}</div>
                        </Link>
                        <div className="divider divider-horizontal"></div>
                        <span>amount: {bump.amount}</span>
                        <div className="divider divider-horizontal"></div>
                        <span>created: {format(bump.createdAt ?? 0, standardDateFormat)}</span>
                    </div>
                )
            })}
        </div>
    )
}
