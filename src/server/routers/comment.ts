import { t } from '../trpc'
import { prisma } from '~/server/prisma'
import { isAuthed } from '~/server/middlewares/authed'
import { z } from 'zod'

type CommentTree = {
    content: string
    id: string
    children: CommentTree[]
    parentId?: string
    user: { userName: string }
    createdAt: Date
}

export const commentRouter = t.router({
    commentTreeForAsk: t.procedure
        .use(isAuthed)
        .input(z.object({ askId: z.string() }))
        .query(async ({ ctx, input }) => {
            const parentAsk = await prisma.ask.findFirst({
                where: { id: input.askId },
                include: { comments: { include: { children: true, user: true }, orderBy: { createdAt: 'desc' } } },
            })

            const children = parentAsk?.comments.map((comment) => {
                return {
                    id: comment.id,
                    parentId: comment.parentId ?? '',
                    createdAt: comment.createdAt,
                    content: comment.content,
                    user: comment.user ?? { userName: '' },
                    children: comment.children as unknown as CommentTree[],
                }
            })

            const lookup = async (comment: CommentTree): Promise<CommentTree> => {
                const innerChildren = await prisma.askComment
                    .findMany({
                        where: { parentId: comment.id },
                        include: { children: true, user: true },
                    })
                    .then((comments) => {
                        return comments.map((comment) => {
                            return {
                                id: comment.id,
                                parentId: comment.parentId ?? '',
                                createdAt: comment.createdAt,
                                content: comment.content,
                                user: comment.user ?? { userName: '' },
                                children: comment.children as unknown as CommentTree[],
                            }
                        })
                    })

                return {
                    id: comment.id,
                    parentId: comment.parentId,
                    createdAt: comment.createdAt,
                    content: comment.content,
                    user: comment.user ?? { userName: '' },
                    children: innerChildren
                        ? await Promise.all(innerChildren.map(async (child) => await lookup(child)))
                        : [],
                }
            }

            return await Promise.all(children ? children.map(async (child) => await lookup(child)) : [])
        }),
    createQuestionForAsk: t.procedure
        .use(isAuthed)
        .input(z.object({ askId: z.string(), content: z.string() }))
        .mutation(async ({ ctx, input }) => {
            return await prisma.ask.update({
                where: { id: input.askId },
                data: {
                    comments: {
                        create: {
                            user: { connect: { id: ctx?.user?.id } },
                            content: input.content,
                        },
                    },
                },
            })
        }),
    createCommentForComment: t.procedure
        .use(isAuthed)
        .input(z.object({ commentId: z.string(), content: z.string() }))
        .mutation(async ({ ctx, input }) => {
            return await prisma.askComment.update({
                where: { id: input.commentId },
                data: {
                    children: {
                        create: {
                            user: { connect: { id: ctx?.user?.id } },
                            content: input.content,
                        },
                    },
                },
            })
        }),
})
