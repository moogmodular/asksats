import { ForwardedRef, forwardRef } from 'react'
import NextLink from 'next/link'

export const LinkBehaviour = forwardRef(function LinkBehaviour(props, ref: ForwardedRef<unknown>) {
    return <NextLink ref={ref} {...props} />
})
