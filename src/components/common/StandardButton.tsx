import { ReactNode } from 'react'

interface StandardButtonProps {
    text: string
    type?: 'primary' | 'secondary' | 'accent' | 'neutral'
    onClick: () => void
    children?: ReactNode
}

export const StandardButton = ({ text, onClick, children, type }: StandardButtonProps) => {
    return (
        <button
            onClick={onClick}
            type="button"
            className={`${
                {
                    primary: 'btn-primary',
                    secondary: 'btn-secondary',
                    accent: 'btn-accent',
                    neutral: 'btn-neutral',
                }[type ?? 'primary']
            } btn-xs btn gap-1 2xl:btn-sm`}
        >
            {children}
            {text}
        </button>
    )
}
