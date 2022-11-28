import { differenceInMilliseconds } from 'date-fns'
import { RouterOutput } from '~/utils/trpc'
import { Countdown } from '~/components/common/Countdown'

export type AskStatus = RouterOutput['ask']['list']['items'][0]['status']

interface CountdownProgressProps {
    creationDate: Date
    endDate: Date
    acceptedDate: Date
    status: AskStatus
}

export const CountdownProgress = ({ endDate, creationDate, acceptedDate, status }: CountdownProgressProps) => {
    const timeForActive = () => {
        const oneHundred = differenceInMilliseconds(creationDate, endDate)
        const part = differenceInMilliseconds(new Date(), endDate)
        return 100 - (Math.abs(part) / Math.abs(oneHundred)) * 100
    }

    const timeForPendingAcceptance = () => {
        const oneHundred = differenceInMilliseconds(endDate, acceptedDate)
        const part = differenceInMilliseconds(new Date(), acceptedDate)
        return 100 - (Math.abs(part) / Math.abs(oneHundred)) * 100
    }

    const getProgressValue = () => {
        return {
            active: timeForActive(),
            pending_acceptance: timeForPendingAcceptance(),
            settled: 100,
            expired: 100,
            no_status: 100,
        }[status]
    }

    const getProgressColor = () => {
        return {
            active: '#eae719',
            pending_acceptance: '#4DD58F',
            settled: '#ff9900',
            expired: '#8d83d3',
            no_status: '#EA9C1F',
        }[status]
    }

    return (
        <div className={'w-full bg-white bg-opacity-10 backdrop-filter'}>
            <div
                style={{
                    width: getProgressValue() + '%',
                    background: getProgressColor(),
                    opacity: 0.7,
                }}
                className={`min-w-1 p-1`}
            >
                &nbsp;
            </div>
        </div>
    )
}
