import { t } from '../trpc'
import { prisma } from '~/server/prisma'
import { isAdmin, isAuthed } from '~/server/middlewares/authed'
import { createBlogItemInput, createCommentInput } from '~/components/blog/CreateBlogItem'
import { z } from 'zod'
import { BlogItem } from '@prisma/client'

type BlogItemRecursive = BlogItem & {
    user: { userName: string }
    children: BlogItemRecursive[]
}

export const blogRouter = t.router({
    addBlogItem: t.procedure
        .use(isAdmin)
        .input(createBlogItemInput)
        .mutation(async ({ ctx, input }) => {
            return prisma.blogItem.create({
                data: {
                    user: { connect: { id: ctx?.user?.id } },
                    title: input.title,
                    body: input.content,
                },
            })
        }),
    addBlogComment: t.procedure
        .use(isAuthed)
        .input(createCommentInput)
        .mutation(async ({ ctx, input }) => {
            return prisma.blogItem.create({
                data: {
                    user: { connect: { id: ctx?.user?.id } },
                    parent: { connect: { id: input.parentCommentId } },
                    body: input.content,
                },
            })
        }),
    getBlogItem: t.procedure.input(z.object({ itemId: z.string() })).query(async ({ ctx, input }) => {
        return prisma.blogItem.findUnique({
            where: { id: input.itemId },
            include: { user: true },
        })
    }),
    listBlogItems: t.procedure.query(async ({ ctx, input }) => {
        const parentItems = await prisma.blogItem.findMany({
            where: { parentId: null },
            include: { children: true, user: { select: { userName: true } } },
            orderBy: { createdAt: 'desc' },
        })

        const lookup = async (comment: Partial<BlogItemRecursive>): Promise<BlogItemRecursive> => {
            const innerChildren = await prisma.blogItem.findMany({
                where: { parentId: comment.id },
                include: { children: true, user: { select: { userName: true } } },
            })

            return {
                ...comment,
                id: comment.id ?? '',
                user: { userName: comment.user?.userName ?? '' },
                createdAt: comment.createdAt ?? new Date(),
                updatedAt: comment.updatedAt ?? new Date(),
                title: comment.title ?? '',
                body: comment.body ?? '',
                userId: comment.userId ?? '',
                parentId: comment.parentId ?? '',
                children: innerChildren ? await Promise.all(innerChildren.map((child) => lookup(child as any))) : [],
            }
        }

        const result = await Promise.all(
            parentItems.map(async (item) => {
                return {
                    ...item,
                    user: { userName: item?.user?.userName ?? '' },
                    children: await Promise.all(item.children.map(async (child) => await lookup(child))),
                }
            }),
        )

        return result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    }),
})
