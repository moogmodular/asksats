import { trpc } from '~/utils/trpc'
import { TransactionList } from '~/components/common/TransactionList'

interface SidebarMyStatsProps {}

export const SidebarMyStats = ({}: SidebarMyStatsProps) => {
    const { data: myStatsData } = trpc.stats.myStats.useQuery()
    const { data: myBalanceData } = trpc.accounting.myBalance.useQuery()

    return (
        <div className={'flex flex-col gap-2 pt-8'}>
            <div className={'emphasis-container break-all text-center'}>
                {myStatsData && (
                    <div>
                        <p>
                            My username is <b>@{myStatsData.userName}</b> and my public key is <br />
                            <b>{myStatsData.publicKey}</b>.<br /> I have earned <b>{myStatsData.totalEarned}</b> and
                            spent <b>{myStatsData.totalSpent}</b> on BumpBoard. I have placed{' '}
                            <b>{myStatsData.totalAsks}</b> asks and made <b>{myStatsData.totalOffers}</b> offers. I have
                            settled <b>{myStatsData.settledAsks}</b> asks and have won{' '}
                            <b>{myStatsData.settledOffers}</b> settled offers.
                        </p>
                    </div>
                )}
            </div>
            <div className={'emphasis-container break-all text-center'}>
                {myBalanceData && (
                    <div>
                        <p>
                            My available balance is <b>{myBalanceData.availableBalance}</b> and my balance locked up as
                            bumps is <b>{myBalanceData.lockedBalance}</b>.
                        </p>
                    </div>
                )}
            </div>
            <div className={'emphasis-container'}>
                <TransactionList />
            </div>
        </div>
    )
}
