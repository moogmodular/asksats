import { RouterOutput } from '~/utils/trpc'
import PublicIcon from '@mui/icons-material/Public'
import SecurityIcon from '@mui/icons-material/Security'
import AddModeratorIcon from '@mui/icons-material/AddModerator'

type AskKind = RouterOutput['ask']['list']['items'][0]['askKind']

interface AskTypeDisplayProps {
    type: AskKind
}

export const AskTypeDisplay = ({ type }: AskTypeDisplayProps) => {
    return (
        <div>
            {
                {
                    PRIVATE: (
                        <div className="tooltip flex gap-1" data-tip="Private ask">
                            <b>private</b>
                            <SecurityIcon />
                        </div>
                    ),
                    PUBLIC: (
                        <div className="tooltip flex gap-1" data-tip="Public ask">
                            <b>public</b>
                            <PublicIcon />
                        </div>
                    ),
                    BUMP_PUBLIC: (
                        <div className="tooltip flex gap-1" data-tip="Bump public ask">
                            <b>bump public</b>
                            <AddModeratorIcon />
                        </div>
                    ),
                }[type]
            }
        </div>
    )
}
