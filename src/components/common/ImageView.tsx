import { useActionStore } from '~/store/actionStore'

interface ImageViewProps {}

export const ImageView = ({}: ImageViewProps) => {
    const { imageUrl } = useActionStore()

    return <img src={imageUrl} alt={'preview image'} className={'max-w-6xl'} />
}
