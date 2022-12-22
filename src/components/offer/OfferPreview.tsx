import { RouterOutput } from '~/utils/trpc'
import { MDRender } from '~/components/common/MDRender'
import { IconPropertyDisplay } from '~/components/common/IconPropertyDisplay'
import { format } from 'date-fns'
import { standardDateFormat } from '~/utils/date'
import useActionStore from '~/store/actionStore'
import { FileView } from '~/components/FileView'
import { Accordion, AccordionDetails, AccordionSummary, Switch, Typography } from '@mui/material'
import StarIcon from '@mui/icons-material/Star'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import DesignServicesIcon from '@mui/icons-material/DesignServices'
import StarBorderIcon from '@mui/icons-material/StarBorder'

type OfferOutput = RouterOutput['offer']['listForAsk'][0]

interface OfferPreviewProps {
    offer: OfferOutput
    setFavOffer: (offerId: string) => void
    canFavourite?: boolean
}

export const OfferPreview = ({ offer, setFavOffer, canFavourite }: OfferPreviewProps) => {
    return (
        <Accordion key={offer.id}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel2a-content" id="panel2a-header">
                {canFavourite ? (
                    <Switch onChange={() => setFavOffer(offer.id)} checked={Boolean(offer.favouritedById)} />
                ) : (
                    <div>{offer.favouritedById ? <StarIcon color={'success'} /> : <StarBorderIcon />}</div>
                )}
                <div className={'flex flex-row text-sm'}>
                    <DesignServicesIcon />
                    {format(offer.createdAt ?? 0, standardDateFormat)}
                </div>
            </AccordionSummary>
            <AccordionDetails>
                <div className={'max-w-52 flex w-52 flex-row gap-1'}>
                    {offer.offerContext.filePairs.map((pair, index) => {
                        return (
                            <FileView
                                key={index}
                                filePairId={pair.id}
                                offerFileUrl={pair.offerFileUrl}
                                obscureFileUrl={pair.obscureFileUrl}
                            />
                        )
                    })}
                </div>
                <MDRender content={offer.offerContext.content ?? ''} />
            </AccordionDetails>
        </Accordion>
    )
}
