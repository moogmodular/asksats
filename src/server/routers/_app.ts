import { t } from '../trpc'
import { authRouter } from '~/server/routers/auth'
import { withdrawalRouter } from '~/server/routers/withdrawal'
import { nodeUtilsRouter } from '~/server/routers/nodeUtils'
import { accountingRouter } from '~/server/routers/accounting'
import { userRouter } from '~/server/routers/user'
import { staticDataRouter } from '~/server/routers/staticData'
import { askRouter } from '~/server/routers/ask'
import { bumpRouter } from '~/server/routers/bump'
import { offerRouter } from '~/server/routers/offer'
import { assetRouter } from '~/server/routers/asset'
import { commentRouter } from '~/server/routers/comment'
import { statsRouter } from '~/server/routers/stats'
import { blogRouter } from '~/server/routers/blog'
import { invoiceRouter } from '~/server/routers/invoice'
import { spaceRouter } from '~/server/routers/space'
import { nostrRouter } from '~/server/routers/nostr'

export const appRouter = t.router({
    auth: authRouter,
    user: userRouter,
    withdrawal: withdrawalRouter,
    invoice: invoiceRouter,
    nodeUtils: nodeUtilsRouter,
    accounting: accountingRouter,
    staticData: staticDataRouter,
    ask: askRouter,
    offer: offerRouter,
    bump: bumpRouter,
    asset: assetRouter,
    comment: commentRouter,
    stats: statsRouter,
    blog: blogRouter,
    space: spaceRouter,
    nostr: nostrRouter,
})

export type AppRouter = typeof appRouter
