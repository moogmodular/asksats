import { RouterOutput } from '~/utils/trpc'
import { SatoshiIcon } from '~/components/common/SatishiIcon'
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined'

type BumpOutput = RouterOutput['ask']['list']['items'][0]['bumps']

interface BumpDisplayProps {
    bumps: BumpOutput
}

export const BumpDisplay = ({ bumps }: BumpDisplayProps) => {
    return (
        <div className={'flex flex-row gap-1'}>
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
