import { RouterOutput } from '~/utils/trpc'
import { SatoshiIcon } from '~/components/common/SatishiIcon'
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'
import { Tooltip } from '@mui/material'

type BumpOutput = RouterOutput['ask']['list']['items'][0]['bumps']

interface BumpDisplayProps {
    bumps: BumpOutput
    offerCount: number
}

export const BumpDisplay = ({ bumps, offerCount }: BumpDisplayProps) => {
    return (
        <div className={'flex flex-row gap-1'}>
            <Tooltip title={`${offerCount} offers`}>
                <div className={'flex flex-row items-center'}>
                    <LocalOfferIcon fontSize={'small'} />
                    {offerCount}
                </div>
            </Tooltip>
            <Tooltip title={`${bumps.bumpCount} bumps`}>
                <div className={'flex flex-row items-center'}>
                    <RocketLaunchOutlinedIcon fontSize={'small'} />
                    {bumps.bumpCount}
                </div>
            </Tooltip>
            <Tooltip title={`${bumps.bumpSum} total bounty`}>
                <div className={'flex flex-row items-center'}>
                    <SatoshiIcon />
                    {bumps.bumpSum}
                </div>
            </Tooltip>
        </div>
    )
}
