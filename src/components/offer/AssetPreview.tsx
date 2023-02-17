import { useActionStore } from '~/store/actionStore'
import UploadIcon from '@mui/icons-material/Upload'
import EditIcon from '@mui/icons-material/Edit'
import {
    Button,
    Dialog,
    DialogActions,
    DialogTitle,
    IconButton,
    Menu,
    MenuItem,
    Tooltip,
    useMediaQuery,
} from '@mui/material'
import { ChangeEvent, useState } from 'react'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import HideImageIcon from '@mui/icons-material/HideImage'
import dynamic from 'next/dynamic'
import { DesignStatePreset } from '../ImageEditor'

interface EditImageDialogProps {
    close: () => void
    open: boolean
    currentImage: string
    editedImage: (image: string) => void
    preset?: DesignStatePreset
}
export const EditImageDialog = ({ close, open, currentImage, editedImage, preset }: EditImageDialogProps) => {
    const ImageEditor = dynamic(() => import('../ImageEditor').then((module) => module.ImageEditor), { ssr: true })
    const fullScreen = useMediaQuery('(min-width:1024px)')

    const handleClose = () => {
        close()
    }

    return (
        <Dialog onClose={handleClose} open={open} maxWidth={'xl'} fullWidth={true} fullScreen={!fullScreen}>
            <DialogTitle>Edit image</DialogTitle>
            <ImageEditor currentImage={currentImage} editedImage={(img) => editedImage(img)} preset={preset} />
            <DialogActions>
                <Button onClick={handleClose} variant={'contained'} component="div">
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    )
}

interface AssetPreviewProps {
    setImagePair: (originalImage: string, obfuscatedImage: string) => void
    index: number
}

export const AssetPreview = ({ setImagePair, index }: AssetPreviewProps) => {
    const [currentImage, setCurrentImage] = useState<string>('')
    const [editedImage, setEditedImage] = useState<string>('')
    const [editImageDialogOpen, setEditImageDialogOpen] = useState(false)

    const [quickEditAction, setQuickEditAction] = useState<DesignStatePreset>('none')

    const [anchorElQuickEdit, setAnchorElQuickEdit] = useState<null | HTMLElement>(null)

    const openQuickEdit = Boolean(anchorElQuickEdit)

    const handleClickQuickEdit = (event: any) => {
        setAnchorElQuickEdit(event.currentTarget)
    }

    const handleCloseQuickEdit = () => {
        setAnchorElQuickEdit(null)
    }

    const { openImage } = useActionStore()

    const handleFilePreview = (event: ChangeEvent) => {
        const filable = event.target as HTMLInputElement
        if (filable.files?.[0]) {
            const newFile = URL.createObjectURL(filable.files[0])
            setCurrentImage(newFile)
        }
    }

    const handleDeleteImage = () => {
        setCurrentImage('')
        setEditedImage('')
    }

    const handleEditImage = () => {
        setQuickEditAction('none')
        setEditImageDialogOpen(true)
    }

    const urlToBLob = (blob: Blob): Promise<string> => {
        const reader = new FileReader()
        reader.readAsDataURL(blob)
        return new Promise((resolve) => {
            reader.onloadend = () => {
                resolve(reader.result as string)
            }
        })
    }

    const handleQuickObfuscate = (action: DesignStatePreset) => {
        handleCloseQuickEdit()
        setQuickEditAction(action)
        setEditImageDialogOpen(true)
    }
    const handleEditedImageSaved = async (image: string) => {
        setEditedImage(image)
        setEditImageDialogOpen(false)
        const blob = await fetch(currentImage).then((r) => r.blob())
        const final = await urlToBLob(blob)
        setImagePair(final, image)
    }

    return (
        <div
            id={`asset-preview-host-${index}`}
            className={'flex flex-row gap-2 rounded-global border-2 border border-orange-300 p-4'}
        >
            <div
                className={
                    'flex h-28 w-36 items-center justify-center rounded-global border-2 border border-dashed border-orange-300'
                }
            >
                {currentImage ? (
                    <img
                        src={currentImage}
                        className={'h-28 w-36 rounded-global object-cover'}
                        onClick={() => openImage(currentImage)}
                    />
                ) : (
                    <div className={'flex flex-col'}>
                        <IconButton id={'upload-image-for-offer-button'} color="secondary" component="label">
                            <input
                                id={'upload-image-for-offer-input'}
                                hidden
                                type="file"
                                accept="image/png, image/jpeg, image/svg+xml"
                                onChange={(e) => handleFilePreview(e)}
                            />
                            <UploadIcon fontSize={'large'} color={'warning'} />
                        </IconButton>
                        <p className={'text-center text-sm text-amber-500'}>Upload image</p>
                    </div>
                )}
            </div>
            <div className={'flex flex-col gap-1'}>
                <Tooltip title={'Edit image'}>
                    <IconButton
                        disabled={!currentImage}
                        color="primary"
                        id={'button-edit'}
                        component="label"
                        onClick={() => handleEditImage()}
                    >
                        <EditIcon fontSize={'small'} color={'primary'} />
                    </IconButton>
                </Tooltip>
                <Tooltip title={'Quick obfuscation'}>
                    <IconButton
                        disabled={!currentImage}
                        color="primary"
                        id="select-quick-edit"
                        component="label"
                        onClick={(e) => handleClickQuickEdit(e)}
                    >
                        <HideImageIcon fontSize={'small'} color={'primary'} />
                    </IconButton>
                </Tooltip>
                <Menu
                    anchorEl={anchorElQuickEdit}
                    open={openQuickEdit}
                    onClose={handleCloseQuickEdit}
                    MenuListProps={{
                        'aria-labelledby': 'basic-button',
                    }}
                >
                    <MenuItem id={'quick-edit-action-none'} onClick={() => handleQuickObfuscate('none')}>
                        None
                    </MenuItem>
                    <MenuItem id={'quick-edit-action-blur'} onClick={() => handleQuickObfuscate('blur')}>
                        Blur
                    </MenuItem>
                    <MenuItem id={'quick-edit-action-checker'} onClick={() => handleQuickObfuscate('checker')}>
                        Checker
                    </MenuItem>
                    <MenuItem id={'quick-edit-action-contrast'} onClick={() => handleQuickObfuscate('contrast')}>
                        Contrast
                    </MenuItem>
                    <MenuItem id={'quick-edit-action-black_white'} onClick={() => handleQuickObfuscate('black_white')}>
                        Black White
                    </MenuItem>
                </Menu>
                <Tooltip title={'Delete'}>
                    <IconButton
                        color="primary"
                        id={'button-delete'}
                        component="label"
                        onClick={() => handleDeleteImage()}
                    >
                        <DeleteForeverIcon fontSize={'small'} color={'warning'} />
                    </IconButton>
                </Tooltip>
            </div>
            <div
                className={
                    'flex h-28 w-36 items-center justify-center rounded-global border-2 border border-dashed border-orange-300'
                }
            >
                {editedImage ? (
                    <img src={editedImage} className={'h-28 w-36 rounded-global object-cover'} />
                ) : (
                    <div className={'flex flex-col items-center justify-between gap-4'}>
                        <EditIcon fontSize={'large'} color={'primary'} />
                        <p className={'text-center text-sm text-amber-500'}>Edited image</p>
                    </div>
                )}
            </div>
            <EditImageDialog
                close={() => setEditImageDialogOpen(false)}
                open={editImageDialogOpen}
                currentImage={currentImage}
                preset={quickEditAction}
                editedImage={(img) => handleEditedImageSaved(img)}
            />
        </div>
    )
}
