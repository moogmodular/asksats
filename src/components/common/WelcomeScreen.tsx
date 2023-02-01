import { MDRender } from '~/components/common/MDRender'
import { trpc } from '~/utils/trpc'
import { useActionStore } from '~/store/actionStore'
import { Button } from '@mui/material'
import { useStore } from 'zustand'
import { authedUserStore } from '~/store/authedUserStore'

interface WelcomeScreenProps {}

export const WelcomeScreen = ({}: WelcomeScreenProps) => {
    const { user } = useStore(authedUserStore)
    const { closeModal } = useActionStore()
    const { data: welcome } = trpc.staticData.welcomeMessage.useQuery()

    return (
        <div>
            {user && (
                <div className={'my-8 text-2xl text-yellow-700'}>
                    {user.userName}, you have successfully created an Account!
                </div>
            )}
            <MDRender content={welcome?.message ?? ''} />
            <Button
                variant={'outlined'}
                id={'welcomeContinue'}
                className={'mt-8'}
                component="div"
                onClick={() => {
                    closeModal()
                }}
            >
                Continue
            </Button>
        </div>
    )
}
