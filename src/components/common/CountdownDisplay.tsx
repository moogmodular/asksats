import Countdown from 'react-countdown'
import { useAutoAnimate } from '@formkit/auto-animate/react'

interface CountdownProps {
    endDate: Date
}
export const CountdownDisplay = ({ endDate }: CountdownProps) => {
    const [parent] = useAutoAnimate<HTMLDivElement>()

    return (
        <div className={'flex flex-col'} ref={parent} suppressHydrationWarning={true}>
            <Countdown date={endDate} className={'font-bold'} />
        </div>
    )
}
