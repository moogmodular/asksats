import { trpc } from '~/utils/trpc'
import { format } from 'date-fns'
import { standardDateFormat } from '~/utils/date'
import { MSATS_UNIT_FACTOR } from '~/server/service/constants'

export const TransactionList = ({}) => {
    const { data: transactionData } = trpc.accounting.transactions.useQuery()

    return (
        <div className={'no-scrollbar overflow-y-scroll'}>
            <div>My transactions:</div>
            {transactionData
                ? transactionData.map((transaction, index) => {
                      return (
                          <div
                              key={index}
                              className={
                                  'my-2 flex flex-row rounded-tl-global border-2 border-gray-400 p-1 text-sm transition duration-150 ease-in-out hover:-translate-y-1 hover:drop-shadow-lg'
                              }
                          >
                              <div className={'w-80'}>
                                  <div>
                                      <b>amount:</b>
                                      {transaction.mSatsSettled / MSATS_UNIT_FACTOR}
                                  </div>
                                  <div>
                                      <b>status:</b>
                                      {transaction.transactionStatus}
                                  </div>
                              </div>
                              <div>
                                  <div>
                                      <b>kind:</b>
                                      {transaction.transactionKind}
                                  </div>
                                  <div>
                                      <b>created:</b>
                                      {format(transaction.createdAt ?? 0, standardDateFormat)}
                                  </div>
                              </div>
                          </div>
                      )
                  })
                : 'you do not have any transactions yet...'}
        </div>
    )
}
