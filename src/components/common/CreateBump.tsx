import { useZodForm } from '~/utils/useZodForm'
import { createBumpForAsk } from '~/components/ask/AskPreview'
import { trpc } from '~/utils/trpc'
import { SatoshiIcon } from '~/components/common/SatishiIcon'
import { useMessageStore } from '~/store/messageStore'
import { IconButton, InputAdornment, TextField } from '@mui/material'
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined'

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
        try {
            await mutateCreateBump.mutateAsync({
                amount: getValues('amount'),
                askId: askId,
            })
            showToast('success', 'Bump created')
            void utils.ask.invalidate()
            void utils.bump.invalidate()
        } catch (error: any) {
            showToast('error', error.message)
            void utils.ask.invalidate()
        }
    }

    return (
        <TextField
            id={'bump-amount-text-field'}
            size={'small'}
            error={Boolean(errors.amount)}
            label="Bump with"
            type="number"
            helperText={errors.amount && errors.amount.message}
            {...register('amount', { valueAsNumber: true, min: minBump, required: true })}
            InputProps={{
                endAdornment: (
                    <InputAdornment position="end">
                        <SatoshiIcon />
                        <IconButton
                            id="bump-amount-button"
                            disabled={!!errors.amount}
                            onClick={handleCreateBump}
                            edge="end"
                            color="primary"
                        >
                            <RocketLaunchOutlinedIcon />
                        </IconButton>
                    </InputAdornment>
                ),
            }}
        />
    )
}
