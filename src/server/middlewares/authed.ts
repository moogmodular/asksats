import { t } from '~/server/trpc'
import { TRPCError } from '@trpc/server'

export const isAuthed = t.middleware(async ({ ctx, next }) => {
    if (!ctx.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated. Please log in.' })
    }
    return next({
        ctx: {
            user: ctx.user,
        },
    })
})

export const isAdmin = t.middleware(async ({ ctx, next }) => {
    if (!ctx.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Not authenticated. Please log in.' })
    }

    if (ctx.user.role !== 'ADMIN') {
        throw new TRPCError({ code: 'UNAUTHORIZED' })
    }

    return next({
        ctx: {
            user: ctx.user,
        },
    })
})

export const isAuthedOrGuest = t.middleware(async ({ ctx, next }) => {
    return next({
        ctx: {
            user: ctx.user ? ctx.user : null,
        },
    })
})
