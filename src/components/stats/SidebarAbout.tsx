import { trpc } from '~/utils/trpc'
import { MDRender } from '~/components/common/MDRender'
import BookIcon from '@mui/icons-material/Book'
import { IconButton, Tooltip } from '@mui/material'
import GitHubIcon from '@mui/icons-material/GitHub'
import NextLink from 'next/link'
import Link from '@mui/material/Link'
import TwitterIcon from '@mui/icons-material/Twitter'

interface SidebarAboutProps {}

export const SidebarAbout = ({}: SidebarAboutProps) => {
    const { data } = trpc.staticData.aboutMessage.useQuery()
    return (
        <div className={'prose flex h-full flex-col items-center pt-8'}>
            <h2>About:</h2>
            <img src={'/artisats_big_logo.svg'} className={'h-48 w-48'} />
            {data && <MDRender content={data.message} />}
            <div className={'justify-betweenm flex grow flex-row items-center'}>
                <div className={'flex flex-row items-center'}>
                    <Tooltip title={`blog`}>
                        <IconButton color="primary" id={'open-authenticate-button'}>
                            <NextLink href={`/ask/blog`}>
                                <BookIcon fontSize={'large'} />
                            </NextLink>
                        </IconButton>
                    </Tooltip>
                </div>
                <div className={'flex flex-row items-center'}>
                    <Tooltip title={`source`}>
                        <IconButton color="primary" id={'open-authenticate-button'}>
                            <Link href={`https://github.com/zerealschlauskwab/asksats`}>
                                <GitHubIcon fontSize={'large'} />
                            </Link>
                        </IconButton>
                    </Tooltip>
                </div>

                <div className={'flex flex-row items-center'}>
                    <Tooltip title={`twitter`}>
                        <IconButton color="primary" id={'open-authenticate-button'}>
                            <Link href={`https://twitter.com/artisatscom`}>
                                <TwitterIcon fontSize={'large'} />
                            </Link>
                        </IconButton>
                    </Tooltip>
                </div>
            </div>
            <Tooltip title={`nostr`}>
                <i>b3ce84d464f119d89ab14a636c6cfcb4da0ac7660b1bf965a1c32bfc9e836eab</i>
            </Tooltip>
        </div>
    )
}
