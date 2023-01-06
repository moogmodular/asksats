import { ReactNode } from 'react'
import { Link } from '@mui/material'
import { LinkBehaviour } from '~/components/common/LinkBehaviour'

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
                <Link
                    component={LinkBehaviour}
                    href={`/ask/user/${value}`}
                    variant="body2"
                    color={'secondary'}
                    className={
                        'link link-info flex cursor-pointer flex-row items-center gap-1 truncate text-xs lg:text-sm'
                    }
                >
                    {children}
                    {value}
                </Link>
            ) : (
                <div className={'flex flex-row items-center gap-1 truncate text-xs lg:text-sm'}>
                    {children}
                    <div id={`header-property-${identifier}`}>{value}</div>
                </div>
            )}
        </>
    )
}
