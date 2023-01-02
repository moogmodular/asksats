import { t } from '../trpc'
import { prisma } from '~/server/prisma'

export const staticDataRouter = t.router({
    walletList: t.procedure.query(async ({ ctx, input }) => {
        const wallets = await prisma.staticData.findUnique({ where: { key: 'wallets' } }).then((data) => data?.value)
        return wallets as Array<{ name: string; url: string }>
    }),
    welcomeMessage: t.procedure.query(async ({ ctx, input }) => {
        const welcomeMessage = await prisma.staticData
            .findUnique({ where: { key: 'welcomeMessage' } })
            .then((data) => data?.value)
        return welcomeMessage as { message: string }
    }),
    aboutMessage: t.procedure.query(async ({ ctx, input }) => {
        const welcomeMessage = await prisma.staticData
            .findUnique({ where: { key: 'aboutMessage' } })
            .then((data) => data?.value)
        return welcomeMessage as { message: string }
    }),
    nostrRelays: t.procedure.query(async ({ ctx, input }) => {
        const relays = await prisma.staticData.findUnique({ where: { key: 'nostrRelays' } }).then((data) => data?.value)
        return relays as { relays: string }
    }),
})
