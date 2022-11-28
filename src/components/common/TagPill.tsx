import Link from 'next/link'

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
        <span className="max-h-8 shrink rounded-small px-3" style={{ backgroundColor: getColor(tagValue) }}>
            <Link href={`/ask/tag/${tagValue}`}>{`#${tagValue}`}</Link>
        </span>
    )
}
