import Link from 'next/link'
import { Tooltip } from '@mui/material'

interface LogoProps {}

export const Logo = ({}: LogoProps) => {
    return (
        <Tooltip title="Home">
            <div className={'flex aspect-square h-10 cursor-pointer flex-row items-center text-sm lg:h-full'}>
                <Link href={`/`}>
                    <p className={'break-all text-xs'}>logo</p>
                </Link>
            </div>
        </Tooltip>
    )
}
