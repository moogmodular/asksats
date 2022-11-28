import { useZodForm } from '~/utils/useZodForm'
import { z } from 'zod'
import useAuthStore from '~/store/useAuthStore'
import { RouterInput, trpc } from '~/utils/trpc'
import Resizer from 'react-image-file-resizer'
import { useState } from 'react'
import { TransactionList } from '~/components/common/TransactionList'
import useActionStore from '~/store/actionStore'
import useMessageStore from '~/store/messageStore'

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
        await editUserMutation
            .mutateAsync({ ...data, base64EncodedImage })
            .catch((error) => {
                showToast('error', error.message)
            })
            .then(() => {
                showToast('success', 'User edited')
            })
        await utils.invalidate()
        utils.user.getMe.fetch().then((res) => {
            setUser(res)
        })
        closeModal()
    }

    const handleDeleteClick = async () => {
        await deleteUserMutation
            .mutateAsync()
            .catch((error) => {
                showToast('error', error.message)
            })
            .then(() => {
                showToast('success', 'User deleted')
            })
        await utils.invalidate()
        logout()
        closeModal()
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
                <input
                    type="file"
                    onChange={async (e) => {
                        if (e.target.files) {
                            setBase64EncodedImage(await resizeFile(e.target.files[0]))
                        }
                    }}
                    id="fileupload"
                />
                <div>
                    <label htmlFor="edit-user-userName">user name</label>
                    <input
                        id={'edit-user-userName'}
                        {...register('userName', { required: true })}
                        type="text"
                        className="
          form-control
          m-0
          block
          w-full
          border
          border-solid
          border-gray-300
          bg-white bg-clip-padding
          px-2 py-1 text-sm
          font-normal
          text-gray-700
          transition
          ease-in-out
          focus:border-blue-600 focus:bg-white focus:text-gray-700 focus:outline-none
        "
                    />
                </div>
                <div>
                    <label htmlFor="edit-user-bio">bio</label>
                    <textarea
                        id={'edit-user-bio'}
                        {...register('bio', { required: true })}
                        className="
          form-control
          m-0
          block
          w-full
          border
          border-solid
          border-gray-300
          bg-white bg-clip-padding
          px-2 py-1 text-sm
          font-normal
          text-gray-700
          transition
          ease-in-out
          focus:border-blue-600 focus:bg-white focus:text-gray-700 focus:outline-none
        "
                    />
                </div>
                <div className={'flex flex-row justify-between'}>
                    <button
                        id={'edit-profile-delete-user'}
                        onClick={handleDeleteClick}
                        type="button"
                        className="dark:focus:ring-[#4285F4]/55 mr-2 mb-2 inline-flex items-center rounded-global bg-red-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-[#4285F4]/90 focus:outline-none focus:ring-4 focus:ring-[#4285F4]/50"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="h-6 w-6"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                            />
                        </svg>
                        Delete User
                    </button>
                    <button
                        id={'edit-profile-submit'}
                        type="submit"
                        className="dark:focus:ring-[#4285F4]/55 mr-2 mb-2 inline-flex items-center rounded-global bg-[#4285F4] px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-[#4285F4]/90 focus:outline-none focus:ring-4 focus:ring-[#4285F4]/50"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="h-6 w-6"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        Submit
                    </button>
                </div>
            </form>
            <TransactionList />
        </div>
    )
}
