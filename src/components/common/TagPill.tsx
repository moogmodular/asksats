import Link from 'next/link'
import CircleIcon from '@mui/icons-material/Circle'
import { Chip } from '@mui/material'

interface TagPillProps {
    tagValue: string
}

const getColor = (str: string) => {
    const hash = str.split('').reduce((prevHash, currVal) => {
        return (prevHash << 5) - prevHash + currVal.charCodeAt(0)
    }, 0)
    return `hsl(${hash % 360}, 80%, 50%)`
}

export const TagPill = ({ tagValue }: TagPillProps) => {
    return (
        <Link href={`/ask/tag/${tagValue}`}>
            <Chip
                className={'cursor-pointer'}
                icon={
                    <div
                        className={`aspect-square w-6 rounded-full`}
                        style={{ backgroundColor: getColor(tagValue) }}
                    ></div>
                }
                color={'primary'}
                label={'#' + tagValue}
            />
        </Link>
    )
}
