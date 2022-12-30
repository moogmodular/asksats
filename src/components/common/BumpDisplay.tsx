import { RouterOutput } from '~/utils/trpc'
import { SatoshiIcon } from '~/components/common/SatishiIcon'
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'

type BumpOutput = RouterOutput['ask']['list']['items'][0]['bumps']

interface BumpDisplayProps {
    bumps: BumpOutput
    offerCount: number
}

export const BumpDisplay = ({ bumps, offerCount }: BumpDisplayProps) => {
    return (
        <div className={'flex flex-row gap-1'}>
            <div className={'flex flex-row items-center'}>
                <LocalOfferIcon fontSize={'small'} />
                {offerCount}
            </div>
            <div className={'flex flex-row items-center'}>
                <RocketLaunchOutlinedIcon fontSize={'small'} />
                {bumps.bumpCount}
            </div>
            <div className={'flex flex-row items-center'}>
                <SatoshiIcon />
                {bumps.bumpSum}
            </div>
        </div>
    )
}
