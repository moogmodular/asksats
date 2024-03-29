import { useZodForm } from '~/utils/useZodForm'
import { z } from 'zod'
import { RouterInput, trpc } from '~/utils/trpc'
import Resizer from 'react-image-file-resizer'
import { useState } from 'react'
import { useActionStore } from '~/store/actionStore'
import { useMessageStore } from '~/store/messageStore'
import { Button, TextField } from '@mui/material'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import CheckIcon from '@mui/icons-material/Check'
import { useStore } from 'zustand'
import { authedUserStore } from '~/store/authedUserStore'

type EditUserInput = RouterInput['user']['edit']

export const editUserInput = z.object({
    userName: z.string().max(24).optional(),
    base64EncodedImage: z.string().optional(),
    nostrPubKey: z.string().optional(),
    bio: z.string().max(256).optional(),
})

interface EditUserProps {}

export const EditUser = ({}: EditUserProps) => {
    const { user, logout, setUser, storeLogin } = useStore(authedUserStore)
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
            nostrPubKey: user?.nostrPubKey ?? '',
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
            await editUserMutation.mutateAsync({ ...data, base64EncodedImage }).then((res) => {
                storeLogin(res.token)
                setUser(res.user)
            })
            showToast('success', 'User edited')
            await utils.invalidate()
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
        <form className={'flex flex-col gap-8'}>
            <div className={'w-72'}>
                <label htmlFor="edit-user-profileImage">Profile image</label>
                <img
                    id={'edit-user-profileImage'}
                    src={base64EncodedImage}
                    alt={`Profile image of ${user?.userName}`}
                />
            </div>
            <Button variant="contained" component="div">
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
                id="edit-user-nostrPubKey"
                label={'nostr pub key'}
                variant="outlined"
                {...register('nostrPubKey', { required: true })}
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
                    component="div"
                    id={'edit-profile-delete-user'}
                    variant="contained"
                    color={'warning'}
                    onClick={handleDeleteClick}
                >
                    <DeleteForeverIcon />
                    Delete User
                </Button>
                <Button id={'edit-profile-submit'} onClick={handleSubmit(onSubmit)} variant="contained" component="div">
                    <CheckIcon />
                    Submit
                </Button>
            </div>
        </form>
    )
}
