import Link from 'next/link'
import { Badge, Chip } from '@mui/material'
import ClearIcon from '@mui/icons-material/Clear'

interface TagPillProps {
    tagValue: string
    noLink?: boolean
    removeTag?: (value: string) => void
}

const getColor = (str: string) => {
    const hash = str.split('').reduce((prevHash, currVal) => {
        return (prevHash << 5) - prevHash + currVal.charCodeAt(0)
    }, 0)
    return `hsl(${hash % 360}, 80%, 50%)`
}

export const TagPill = ({ tagValue, noLink, removeTag }: TagPillProps) => {
    const handleRemove = () => {
        removeTag && removeTag(tagValue)
    }

    return noLink ? (
        <Badge color="secondary" badgeContent={<ClearIcon onClick={handleRemove} />}>
            <Chip
                className={'text-white'}
                icon={
                    <div
                        className={`aspect-square w-6 rounded-full`}
                        style={{ backgroundColor: getColor(tagValue) }}
                    ></div>
                }
                color={'primary'}
                label={'#' + tagValue}
            />
        </Badge>
    ) : (
        <Link href={`/ask/tag/${tagValue}`} className={'cursor-pointer'}>
            <Chip
                className={'text-white'}
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
