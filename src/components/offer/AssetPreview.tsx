import { trpc } from '~/utils/trpc'
import useActionStore from '~/store/actionStore'
import CancelIcon from '@mui/icons-material/Cancel'
import { Badge, Button } from '@mui/material'
interface AssetPreviewProps {
    id?: string

    deletable?: boolean
    deleteFilePair?: (id: string) => void
}

export const AssetPreview = ({ id, deletable, deleteFilePair }: AssetPreviewProps) => {
    const { data: filePairData } = trpc.asset.filePairById.useQuery({ id: id ?? '' })

    const { openImage } = useActionStore()

    return (
        <div>
            {filePairData && (
                <Badge
                    badgeContent={
                        deletable && id && deleteFilePair && <CancelIcon onClick={() => deleteFilePair(id)} />
                    }
                >
                    <div className={'comment-container flex flex-row gap-2'}>
                        <img className={'aspect-square w-32'} src={filePairData.offerFile.url} alt="" />
                        <img className={'aspect-square w-32'} src={filePairData.obscureFile.url} alt="" />
                    </div>
                </Badge>
            )}
        </div>
    )
}
