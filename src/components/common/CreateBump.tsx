import { useZodForm } from '~/utils/useZodForm'
import { createBumpForAsk } from '~/components/ask/AskPreview'
import { trpc } from '~/utils/trpc'
import { SatoshiIcon } from '~/components/common/SatishiIcon'
import useMessageStore from '~/store/messageStore'

interface CreateBumpButtonProps {
    askId: string
    minBump: number
}

export const CreateBumpButton = ({ askId, minBump }: CreateBumpButtonProps) => {
    const { showToast } = useMessageStore()
    const mutateCreateBump = trpc.bump.createForAsk.useMutation()
    const utils = trpc.useContext()

    const {
        register,
        getValues,
        formState: { errors },
    } = useZodForm({
        schema: createBumpForAsk,
        defaultValues: {
            amount: minBump,
            askId: '',
        },
    })

    const handleCreateBump = async () => {
        await mutateCreateBump
            .mutateAsync({
                amount: getValues('amount'),
                askId: askId,
            })
            .catch((error) => {
                showToast('error', error.message)
            })
        utils.ask.invalidate()
    }

    return (
        <div className={'justify-items flex flex-row items-center'}>
            <button
                onClick={handleCreateBump}
                disabled={!!errors.amount}
                type="button"
                className={`btn-primary btn h-full gap-1 rounded-none rounded-bl-global`}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-4 w-4"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
                    />
                </svg>
                {`Bump with`}
            </button>
            <form>
                <input
                    id="transact-invoice-amount-input"
                    type={'number'}
                    {...register('amount', { valueAsNumber: true, min: minBump, required: true })}
                    className="input-bordered input w-24"
                />
            </form>
            <SatoshiIcon />
        </div>
    )
}
