import { trpc } from '~/utils/trpc'
import { useState } from 'react'
import { Deposit } from '~/components/modal/Deposit'
import { Withdraw } from '~/components/modal/Withdraw'
import { useZodForm } from '~/utils/useZodForm'
import { z } from 'zod'
import { MIN_INVOICE_FLOOR, SINGLE_TRANSACTION_CAP } from '~/server/service/constants'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import { Button, LinearProgress, TextField } from '@mui/material'
import CallMadeIcon from '@mui/icons-material/CallMade'
import CallReceivedIcon from '@mui/icons-material/CallReceived'

export const createInvoiceInput = z.object({
    amount: z.number().min(MIN_INVOICE_FLOOR).max(SINGLE_TRANSACTION_CAP),
})

export const Transact = ({}) => {
    const {
        register,
        getValues,
        formState: { errors },
    } = useZodForm({
        schema: createInvoiceInput,
        defaultValues: {
            amount: MIN_INVOICE_FLOOR,
        },
    })

    const [transactMode, setTransactMode] = useState<'none' | 'deposit' | 'withdraw'>('none')

    const { data: myBalance } = trpc.accounting.myBalance.useQuery()

    return (
        <div>
            {
                {
                    none: (
                        <div className={'flex flex-col items-center gap-4'}>
                            {myBalance ? (
                                <div>
                                    <div id={'transact-balance-display'}>
                                        Available balance: {myBalance.availableBalance}
                                    </div>
                                    <div id={'transact-balance-display'}>Locked balance: {myBalance.lockedBalance}</div>
                                </div>
                            ) : (
                                <LinearProgress />
                            )}
                            <div className="mb-3 xl:w-96">
                                <TextField
                                    fullWidth
                                    error={Boolean(errors.amount)}
                                    label="Invoice amount"
                                    helperText={errors.amount && errors.amount.message}
                                    id="transact-invoice-amount-input"
                                    type={'number'}
                                    {...register('amount', {
                                        valueAsNumber: true,
                                        min: MIN_INVOICE_FLOOR,
                                        required: true,
                                    })}
                                />
                            </div>
                            <div className={'flex w-full flex-row justify-between'}>
                                <Button
                                    id={'transact-deposit-button'}
                                    variant={'contained'}
                                    component="label"
                                    disabled={!!errors.amount}
                                    onClick={() => setTransactMode('deposit')}
                                    startIcon={
                                        <>
                                            <AccountBalanceIcon />
                                            <CallReceivedIcon />
                                        </>
                                    }
                                >
                                    Deposit
                                </Button>
                                <Button
                                    id={'transact-deposit-button'}
                                    variant={'contained'}
                                    component="label"
                                    disabled={!!errors.amount}
                                    onClick={() => setTransactMode('withdraw')}
                                    startIcon={
                                        <>
                                            <AccountBalanceIcon />
                                            <CallMadeIcon />
                                        </>
                                    }
                                >
                                    Withdraw
                                </Button>
                            </div>
                        </div>
                    ),
                    deposit: <Deposit amount={getValues('amount')} done={() => setTransactMode('none')} />,
                    withdraw: <Withdraw done={() => setTransactMode('none')} />,
                }[transactMode]
            }
        </div>
    )
}
