import { IconPropertyDisplay } from '~/components/common/IconPropertyDisplay'
import { RouterOutput } from '~/utils/trpc'
import KeyIcon from '@mui/icons-material/Key'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import { Avatar } from '@mui/material'

type AskAuthorOutput = RouterOutput['ask']['byContextSlug']['ask']['user']

interface AskAuthorDisplayProps {
    user: AskAuthorOutput
}

export const AskAuthorDisplay = ({ user }: AskAuthorDisplayProps) => (
    <div>
        {user && (
            <div className={'flex flex-row gap-2'}>
                <Avatar alt="User avatar" src={user.profileImage ?? ''} />
                <div className={'grow'}>
                    <div>
                        <IconPropertyDisplay identifier={'publicKey'} value={user.publicKey?.slice(0, 24) + '...'}>
                            <KeyIcon fontSize={'small'} />
                        </IconPropertyDisplay>
                        <IconPropertyDisplay identifier={'userName'} value={user.userName} link={true}>
                            <AccountCircleIcon fontSize={'small'} />
                        </IconPropertyDisplay>
                    </div>
                </div>
            </div>
        )}
    </div>
)
