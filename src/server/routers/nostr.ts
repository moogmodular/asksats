import { t } from '../trpc'
import { prisma } from '~/server/prisma'
import { z } from 'zod'

export const nostrRouter = t.router({
    nipFive: t.procedure
        .meta({ openapi: { method: 'GET', path: '/nipfive' } })
        .input(
            z.object({
                name: z.enum(['zeRealSchlausKwab', 'ArtiSats.com']),
            }),
        )
        .output(z.any())
        .query(async ({ ctx, input }) => {
            const relays = (await prisma.staticData
                .findUnique({ where: { key: 'nostrRelays' } })
                .then((data) => data?.value)) as { relays: string[] }
            const pubKeyForName = {
                zeRealSchlausKwab: '3aa5817273c3b2f94f491840e0472f049d0f10009e23de63006166bca9b36ea3',
                'ArtiSats.com': 'b3ce84d464f119d89ab14a636c6cfcb4da0ac7660b1bf965a1c32bfc9e836eab',
            }[input.name]
            return {
                [input.name]: pubKeyForName,
                relays: { [pubKeyForName]: relays.relays },
            }
        }),
})
