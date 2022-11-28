import { t } from '../trpc'
import { isAuthed } from '~/server/middlewares/authed'
import { prisma } from '~/server/prisma'
import { z } from 'zod'

export const taxonomyRouter = t.router({
    excludedTagsForUser: t.procedure.use(isAuthed).query(async ({ ctx }) => {
        const user = await prisma.user.findUnique({
            where: { id: ctx.user.id },
            include: { excludedTags: true },
        })
        return user?.excludedTags
    }),
    unExcludeTagForUser: t.procedure
        .use(isAuthed)
        .input(z.object({ tagName: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const updatedUser = await prisma.user.update({
                where: { id: ctx.user.id },
                data: {
                    excludedTags: {
                        disconnect: { name: input.tagName },
                    },
                },
                include: { excludedTags: true },
            })
            return updatedUser.excludedTags
        }),
    addExcludedTagForUser: t.procedure
        .use(isAuthed)
        .input(z.object({ tagName: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const updatedUser = await prisma.user.update({
                where: { id: ctx.user.id },
                data: {
                    excludedTags: {
                        connectOrCreate: {
                            where: { name: input.tagName },
                            create: { name: input.tagName },
                        },
                    },
                },
                include: { excludedTags: true },
            })
            return updatedUser.excludedTags
        }),
    searchTags: t.procedure
        .use(isAuthed)
        .input(z.object({ search: z.string() }))
        .query(async ({ ctx, input }) => {
            return await prisma.tag.findMany({
                where: { name: { search: input.search } },
            })
        }),
    topTags: t.procedure.query(async ({ ctx, input }) => {
        return await prisma.tag
            .findMany({
                include: { asks: true },
            })
            .then((tags) => {
                return tags
                    .map((tag) => {
                        return { ...tag, askCount: tag.asks.length }
                    })
                    .sort((a, b) => b.askCount - a.askCount)
            })
    }),
})
