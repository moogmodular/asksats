import { ForwardedRef, forwardRef } from 'react'
import NextLink from 'next/link'

export const LinkBehaviour = forwardRef(function LinkBehaviour(props: any, ref: ForwardedRef<HTMLAnchorElement>) {
    return <NextLink ref={ref} {...props} />
})
