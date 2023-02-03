import { z } from 'zod'
import { useZodForm } from '~/utils/useZodForm'
import { useState } from 'react'
import { RouterInput, RouterOutput, trpc } from '~/utils/trpc'
import { useActionStore } from '~/store/actionStore'
import { useMessageStore } from '~/store/messageStore'
import { Button, Checkbox, FormControlLabel, TextField, Tooltip } from '@mui/material'
import useMediaQuery from '@mui/material/useMediaQuery'
import InfoIcon from '@mui/icons-material/Info'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'

type EditSpaceInput = RouterInput['space']['editSpace']
type Space = RouterOutput['space']['list'][0]

export const editSpaceInput = z.object({
    spaceId: z.string(),
    description: z.string().min(1).max(500),
    nsfw: z.boolean(),
    headerImageId: z.string().optional(),
})

export const uploadedImageById = z.object({
    imageId: z.string(),
})

interface EditSpaceProps {}

export const EditSpace = ({}: EditSpaceProps) => {
    const { closeModal, spaceId } = useActionStore()
    const { showToast } = useMessageStore()
    const utils = trpc.useContext()

    const { data: spaceData } = trpc.space.spaceInfoById.useQuery({ spaceId })

    const [uploadedImage, setUploadedImage] = useState<string | null>(spaceData?.headerImageUrl ?? null)
    const [uploadedImageId, setUploadedImageId] = useState<string | null>(spaceData?.headerImageId ?? null)
    const [nsfwChecked, setNsfwChecked] = useState<boolean>(Boolean(spaceData?.nsfw))
    const [description, setDescription] = useState<string>(spaceData?.description ?? '')

    const matches = useMediaQuery('(min-width:1024px)')

    const editSpaceMutation = trpc.space.editSpace.useMutation()

    const {
        register,
        handleSubmit,
        getValues,
        setValue,
        watch,
        formState: { errors },
    } = useZodForm({
        schema: editSpaceInput,
        defaultValues: {
            spaceId: spaceId,
            nsfw: Boolean(nsfwChecked),
            description: description,
            headerImageId: uploadedImageId ?? '',
        },
    })
    const onSubmit = async (data: EditSpaceInput) => {
        console.log(data)
        try {
            await editSpaceMutation.mutateAsync({
                spaceId: spaceId,
                headerImageId: uploadedImageId ?? '',
                description: data.description,
                nsfw: data.nsfw,
            })
            showToast('success', 'Space edited!')
            await utils.space.invalidate()
            closeModal()
        } catch (error: any) {
            showToast('error', error.message)
            await utils.space.invalidate()
        }
    }

    const handleFileChange = async (data: File | undefined) => {
        if (data) {
            const url = await utils.asset.preSignedUrl.fetch()

            setUploadedImageId(url.imageId)

            const ulData = { ...url.uploadUrl.fields, 'Content-Type': data.type, file: data } as Record<string, any>

            const formData = new FormData()
            for (const name in ulData) {
                formData.append(name, ulData[name])
            }

            await fetch(url.uploadUrl.url.replace('//', '//asksats.'), {
                method: 'POST',
                body: formData,
            })

            const uploadedImage = await utils.asset.uploadedImageById.fetch({
                imageId: url.imageId,
            })

            setUploadedImage(uploadedImage)

            return
        }
    }

    return (
        <form className={'flex flex-col gap-4 py-4'}>
            <div className={'flex flex-row '}>
                <h1 className={'text-2xl'}>{spaceData?.name}</h1>
                <Tooltip title="Space name cannot be changed">
                    <InfoIcon />
                </Tooltip>
            </div>

            <div className={'flex flex-col gap-4 lg:flex-row'}>
                {uploadedImage ? (
                    <img
                        className={'aspect-square w-12 lg:w-36 lg:object-cover'}
                        src={uploadedImage}
                        alt="uploaded image"
                    />
                ) : (
                    <span className={'aspect-square w-12 lg:w-36 lg:object-cover'}>&nbsp;</span>
                )}
                <div className={'flex h-full w-full w-3/5 flex-col justify-between gap-2'}>
                    <b>{}</b>
                    <FormControlLabel
                        control={
                            <Checkbox
                                {...register('nsfw')}
                                checked={Boolean(nsfwChecked)}
                                onClick={() => setNsfwChecked(!nsfwChecked)}
                            />
                        }
                        label="nsfw"
                    />
                    <Button variant="contained" component="div" size={`${matches ? 'medium' : 'small'}`}>
                        Upload File
                        <input
                            type="file"
                            accept="image/png, image/jpeg, image/svg+xml"
                            id="fileupload"
                            onChange={(e) => handleFileChange(e?.target?.files?.[0])}
                        />
                    </Button>
                </div>
            </div>
            <TextField
                id="outlined-multiline-flexible"
                label="space description"
                multiline
                maxRows={4}
                {...register('description', { required: true })}
            />
            <div className={'flex flex-row items-center gap-8'}>
                <Button
                    variant={'contained'}
                    id={'create-ask-submit'}
                    color={'primary'}
                    component="div"
                    disabled={Boolean(errors.description)}
                    onClick={() => {
                        handleSubmit(onSubmit)()
                    }}
                    endIcon={<PlayArrowIcon />}
                >
                    Submit
                </Button>
                <Tooltip title={'Creating spaces has to cost something in order to disincentivize spam creation.'}>
                    <InfoIcon color={'info'} />
                </Tooltip>
            </div>
        </form>
    )
}
