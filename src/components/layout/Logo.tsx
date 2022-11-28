import Link from 'next/link'

interface LogoProps {}

export const Logo = ({}: LogoProps) => {
    return (
        <div
            className={
                'primary-container tooltip z-10 flex aspect-square h-12 cursor-pointer flex-row items-center text-sm lg:h-full'
            }
            data-tip="Home"
        >
            <Link href={`/`}>
                <h1 className={'text-2xl'}>AS</h1>
            </Link>
        </div>
    )
}
