import { ReactNode } from 'react'
import Link from 'next/link'

interface IconPropertyDisplayProps {
    value: string | undefined
    children: ReactNode
    identifier: string
    link?: boolean
}

export const IconPropertyDisplay = ({ value, children, identifier, link }: IconPropertyDisplayProps) => {
    return (
        <>
            {link ? (
                <Link href={`/ask/user/${value}`}>
                    <div className={'lg:text-md link flex cursor-pointer flex-row items-center gap-1 text-sm'}>
                        {children}
                        <div id={`header-property-${identifier}`}>{value}</div>
                    </div>
                </Link>
            ) : (
                <div className={'lg:text-md flex flex-row items-center gap-1 text-sm'}>
                    {children}
                    <div id={`header-property-${identifier}`}>{value}</div>
                </div>
            )}
        </>
    )
}
