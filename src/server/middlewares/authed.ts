import { t } from '~/server/trpc'
import { TRPCError } from '@trpc/server'

export const isAuthed = t.middleware(async ({ ctx, next }) => {
    if (!ctx.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED' })
    }
    return next({
        ctx: {
            user: ctx.user,
        },
    })
})

export const isAdmin = t.middleware(async ({ ctx, next }) => {
    console.log('isAdmin', ctx)
    if (!ctx.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED' })
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
