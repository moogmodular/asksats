import useActionStore from '~/store/actionStore'

interface ImageViewProps {}

export const ImageView = ({}: ImageViewProps) => {
    const { imageUrl } = useActionStore()

    return (
        <div>
            <img src={imageUrl} alt={'preview image'} />
        </div>
    )
}
