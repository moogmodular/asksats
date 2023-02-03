import { z } from 'zod'
import { useZodForm } from '~/utils/useZodForm'
import { useState } from 'react'
import { RouterInput, RouterOutput, trpc } from '~/utils/trpc'
import { useActionStore } from '~/store/actionStore'
import { useMessageStore } from '~/store/messageStore'
import { SPACE_CREATION_COST } from '~/server/service/constants'
import { Button, Checkbox, FormControlLabel, TextField, Tooltip } from '@mui/material'
import useMediaQuery from '@mui/material/useMediaQuery'
import InfoIcon from '@mui/icons-material/Info'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'

type CreateSpaceInput = RouterInput['space']['create']
type Space = RouterOutput['space']['list'][0]

export const createSpaceInput = z.object({
    name: z.string().min(1).max(50),
    description: z.string().min(1).max(500),
    nsfw: z.boolean(),
    headerImageId: z.string().optional(),
})

export const uploadedImageById = z.object({
    imageId: z.string(),
})

interface CreateSpaceProps {}

export const CreateSpace = ({}: CreateSpaceProps) => {
    const { closeModal } = useActionStore()
    const { showToast } = useMessageStore()
    const utils = trpc.useContext()
    const [uploadedImageId, setUploadedImageId] = useState<string | null>(null)
    const [uploadedImage, setUploadedImage] = useState<string | null>(null)
    const [tags, setTags] = useState<{ label: string; id: string; isNew: boolean }[]>([])
    const matches = useMediaQuery('(min-width:1024px)')

    const createSpaceMutation = trpc.space.create.useMutation()

    const {
        register,
        handleSubmit,
        getValues,
        setValue,
        watch,
        formState: { errors },
    } = useZodForm({
        schema: createSpaceInput,
        defaultValues: {
            nsfw: false,
            name: '',
            description: '',
            headerImageId: '',
        },
    })
    const onSubmit = async (data: CreateSpaceInput) => {
        console.log(data)
        try {
            await createSpaceMutation.mutateAsync({
                name: data.name,
                headerImageId: uploadedImageId ?? '',
                description: data.description,
                nsfw: data.nsfw,
            })
            showToast('success', 'Space created')
            await utils.ask.invalidate()
            closeModal()
        } catch (error: any) {
            showToast('error', error.message)
            await utils.ask.invalidate()
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
                    <TextField
                        id="create-ask-title"
                        className={'w-full lg:w-1/2'}
                        size={`${matches ? 'medium' : 'small'}`}
                        error={Boolean(errors.name)}
                        label={'Title'}
                        placeholder={'Title...'}
                        type="text"
                        variant="outlined"
                        {...register('name', {
                            required: true,
                        })}
                        helperText={errors.name?.message}
                    />
                    <FormControlLabel control={<Checkbox {...register('nsfw')} />} label="nsfw" />
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
                    disabled={Boolean(errors.name || errors.description)}
                    onClick={() => {
                        handleSubmit(onSubmit)()
                    }}
                    endIcon={<PlayArrowIcon />}
                >
                    Submit {`(${SPACE_CREATION_COST} sats)`}
                </Button>
                <Tooltip title={'Creating spaces has to cost something in order to disincentivize spam creation.'}>
                    <InfoIcon color={'info'} />
                </Tooltip>
            </div>
        </form>
    )
}
