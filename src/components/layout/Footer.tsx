import { trpc } from '~/utils/trpc'
import useNodeConnectionStore from '~/store/nodeConnectionStore'
import { Skeleton, Typography } from '@mui/material'
import HighlightOffIcon from '@mui/icons-material/HighlightOff'

export const Footer = ({}) => {
    const { connectionAddress, setConnectionAddress } = useNodeConnectionStore()

    trpc.nodeUtils.nodeConnection.useQuery(undefined, {
        refetchInterval: (data) => {
            if (data) {
                setConnectionAddress(data)
            } else {
                setConnectionAddress('')
            }

            return 20000
        },
    })

    return (
        <div>
            {connectionAddress ? (
                <div className={' break-all p-2 text-center text-sm'}>{connectionAddress}</div>
            ) : (
                <Typography variant="body1">
                    <HighlightOffIcon /> No connection to node
                    <Skeleton />
                </Typography>
            )}
        </div>
    )
}
