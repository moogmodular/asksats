import { RouterOutput } from '~/utils/trpc'
import PublicIcon from '@mui/icons-material/Public'
import SecurityIcon from '@mui/icons-material/Security'
import AddModeratorIcon from '@mui/icons-material/AddModerator'
import { Tooltip } from '@mui/material'
import { bumpPublicInfoText, privateInfoText, publicInfoText } from '~/server/service/constants'

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
                        <Tooltip title={privateInfoText}>
                            <div className="tooltip flex gap-1" data-tip="Private ask">
                                <b>private</b>
                                <SecurityIcon color={'secondary'} />
                            </div>
                        </Tooltip>
                    ),
                    PUBLIC: (
                        <Tooltip title={publicInfoText}>
                            <div className="tooltip flex gap-1" data-tip="Public ask">
                                <b>public</b>
                                <PublicIcon color={'primary'} />
                            </div>
                        </Tooltip>
                    ),
                    BUMP_PUBLIC: (
                        <Tooltip title={bumpPublicInfoText}>
                            <div className="tooltip flex gap-1" data-tip="Bump public ask">
                                <b>bump public</b>
                                <AddModeratorIcon color={'success'} />
                            </div>
                        </Tooltip>
                    ),
                }[type]
            }
        </div>
    )
}
