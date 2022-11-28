import { t } from '../trpc'
import { authRouter } from '~/server/routers/auth'
import { withdrawalRouter } from '~/server/routers/withdrawal'
import { invoiceRouter } from '~/server/routers/invoice'
import { nodeUtilsRouter } from '~/server/routers/nodeUtils'
import { accountingRouter } from '~/server/routers/accounting'
import { userRouter } from '~/server/routers/user'
import { walletRouter } from '~/server/routers/wallet'
import { askRouter } from '~/server/routers/ask'
import { bumpRouter } from '~/server/routers/bump'
import { offerRouter } from '~/server/routers/offer'
import { assetRouter } from '~/server/routers/asset'
import { commentRouter } from '~/server/routers/comment'
import { statsRouter } from '~/server/routers/stats'
import { taxonomyRouter } from '~/server/routers/taxonomy'
import { blogRouter } from '~/server/routers/blog'

export const appRouter = t.router({
    auth: authRouter,
    user: userRouter,
    withdrawal: withdrawalRouter,
    invoice: invoiceRouter,
    nodeUtils: nodeUtilsRouter,
    accounting: accountingRouter,
    wallet: walletRouter,
    ask: askRouter,
    offer: offerRouter,
    bump: bumpRouter,
    asset: assetRouter,
    comment: commentRouter,
    stats: statsRouter,
    taxonomy: taxonomyRouter,
    blog: blogRouter,
})

export type AppRouter = typeof appRouter
