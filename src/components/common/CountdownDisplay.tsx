import Countdown from 'react-countdown'

interface CountdownCompProps {
    endDate: Date
}
export const CountdownDisplay = ({ endDate }: CountdownCompProps) => {
    return (
        <div className={'flex flex-col'} suppressHydrationWarning={true}>
            <Countdown date={endDate} className={'font-bold'} />
        </div>
    )
}
