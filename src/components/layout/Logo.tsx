import Link from 'next/link'
import { Tooltip } from '@mui/material'

interface LogoProps {}

export const Logo = ({}: LogoProps) => {
    return (
        <Tooltip title="Home">
            <div className={'flex cursor-pointer flex-row items-center'}>
                <Link id={'logo-link'} href={`/`}>
                    <img className={'h-10'} src={'/logo.svg'} alt={'Logo'} />
                </Link>
            </div>
        </Tooltip>
    )
}
