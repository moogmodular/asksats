import { useZodForm } from '~/utils/useZodForm'
import { z } from 'zod'
import useAuthStore from '~/store/useAuthStore'
import { RouterInput, trpc } from '~/utils/trpc'
import Resizer from 'react-image-file-resizer'
import { useState } from 'react'
import { TransactionList } from '~/components/common/TransactionList'
import useActionStore from '~/store/actionStore'
import useMessageStore from '~/store/messageStore'
import { Button, TextField } from '@mui/material'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import CheckIcon from '@mui/icons-material/Check'

type EditUserInput = RouterInput['user']['edit']

export const editUserInput = z.object({
    userName: z.string().max(24).optional(),
    base64EncodedImage: z.string().optional(),
    bio: z.string().max(256).optional(),
})

interface EditUserProps {}

export const EditUser = ({}: EditUserProps) => {
    const { user, logout, setUser } = useAuthStore()
    const { closeModal } = useActionStore()
    const { showToast } = useMessageStore()
    const [base64EncodedImage, setBase64EncodedImage] = useState<string | undefined>(user?.profileImage ?? undefined)

    const editUserMutation = trpc.user.edit.useMutation()
    const deleteUserMutation = trpc.user.deleteMe.useMutation()
    const utils = trpc.useContext()

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useZodForm({
        schema: editUserInput,
        defaultValues: {
            userName: user?.userName,
            base64EncodedImage: user?.profileImage ?? '',
            bio: user?.bio ?? '',
        },
    })

    const resizeFile = (file: any) =>
        new Promise<string>((resolve) => {
            Resizer.imageFileResizer(
                file,
                250,
                250,
                'JPEG',
                100,
                0,
                (uri) => {
                    resolve(uri as string)
                },
                'base64',
            )
        })

    const onSubmit = async (data: EditUserInput) => {
        try {
            await editUserMutation.mutateAsync({ ...data, base64EncodedImage })
            showToast('success', 'User edited')
            await utils.invalidate()
            utils.user.getMe.fetch().then((res) => {
                setUser(res)
            })
            closeModal()
        } catch (error: any) {
            await utils.invalidate()
            showToast('error', error.message)
        }
    }

    const handleDeleteClick = async () => {
        try {
            await deleteUserMutation.mutateAsync()
            showToast('success', 'User deleted')
            await utils.invalidate()
            logout()
            closeModal()
        } catch (error: any) {
            await utils.invalidate()

            showToast('error', error.message)
        }
    }

    return (
        <div className={'flex h-4/6 flex-row gap-8'} onSubmit={handleSubmit(onSubmit)}>
            <form className={'flex flex-col gap-8'} onSubmit={handleSubmit(onSubmit)}>
                <div>
                    <label htmlFor="edit-user-profileImage">Profile image</label>
                    <img
                        id={'edit-user-profileImage'}
                        src={base64EncodedImage}
                        alt={`Profile image of ${user?.userName}`}
                    />
                </div>
                <Button variant="contained" component="label">
                    Upload File
                    <input
                        type="file"
                        id="fileupload"
                        onChange={async (e) => {
                            if (e.target.files) {
                                setBase64EncodedImage(await resizeFile(e.target.files[0]))
                            }
                        }}
                    />
                </Button>
                <TextField
                    id="edit-user-userName"
                    label={'user name'}
                    variant="outlined"
                    {...register('userName', { required: true })}
                />
                <TextField
                    multiline
                    id="edit-user-bio"
                    label={'bio'}
                    variant="outlined"
                    {...register('bio', { required: true })}
                />
                <div className={'flex flex-row justify-between'}>
                    <Button
                        id={'edit-profile-delete-user'}
                        component="label"
                        variant="contained"
                        color={'warning'}
                        onClick={handleDeleteClick}
                    >
                        <DeleteForeverIcon />
                        Delete User
                    </Button>
                    <Button id={'edit-profile-submit'} type={'submit'} variant="outlined">
                        <CheckIcon />
                        Submit
                    </Button>
                </div>
            </form>
        </div>
    )
}
