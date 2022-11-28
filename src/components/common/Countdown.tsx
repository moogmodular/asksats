import { CSSProperties, useEffect, useState } from 'react'
import { intervalToDuration } from 'date-fns'

interface CountdownProps {
    endDate: Date
}

const difference = (date: Date) => {
    return intervalToDuration({ start: new Date(), end: date })
}

export const Countdown = ({ endDate }: CountdownProps) => {
    const [timeLeft, setTimeLeft] = useState<{ days?: number; hours?: number; minutes?: number; seconds?: number }>(
        () => {
            const duration = difference(endDate)
            return {
                days: duration.days,
                hours: duration.hours,
                minutes: duration.minutes,
                seconds: duration.seconds,
            }
        },
    )

    useEffect(() => {
        setInterval(() => {
            const duration = difference(endDate)
            setTimeLeft({
                days: duration.days,
                hours: duration.hours,
                minutes: duration.minutes,
                seconds: duration.seconds,
            })
        })
    }, [])

    return (
        <div className={'flex flex-col'}>
            <span className="countdown">
                <b style={{ '--value': timeLeft.days } as CSSProperties}></b>:
                <b style={{ '--value': timeLeft.hours } as CSSProperties}></b>:
                <b style={{ '--value': timeLeft.minutes } as CSSProperties}></b>:
                <b style={{ '--value': timeLeft.seconds } as CSSProperties}></b>
            </span>
        </div>
    )
}
