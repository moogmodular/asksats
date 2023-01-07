import { RouterOutput } from '~/utils/trpc'
import { MDRender } from '~/components/common/MDRender'
import { format } from 'date-fns'
import { standardDateFormat } from '~/utils/date'
import { FileView } from '~/components/FileView'
import { Accordion, AccordionDetails, AccordionSummary, Switch, Tooltip } from '@mui/material'
import StarIcon from '@mui/icons-material/Star'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import DesignServicesIcon from '@mui/icons-material/DesignServices'
import StarBorderIcon from '@mui/icons-material/StarBorder'
import { ChangeEvent } from 'react'

type OfferOutput = RouterOutput['offer']['listForAsk'][0]

interface OfferPreviewProps {
    offer: OfferOutput
    setFavOffer: (offerId: string) => void
    unSetFavOffer: (offerId: string) => void
    canFavourite?: boolean
}

export const OfferPreview = ({ offer, setFavOffer, unSetFavOffer, canFavourite }: OfferPreviewProps) => {
    const handleChanged = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            setFavOffer(offer.id)
        } else {
            unSetFavOffer(offer.id)
        }
    }
    return (
        <div className={'flex flex-row items-center'}>
            {canFavourite ? (
                <Tooltip title={'Set this offer as your favourite'}>
                    <Switch onChange={(event) => handleChanged(event)} checked={Boolean(offer.favouritedById)} />
                </Tooltip>
            ) : (
                <div>{offer.favouritedById ? <StarIcon color={'success'} /> : <StarBorderIcon />}</div>
            )}
            <Accordion key={offer.id}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel2a-content" id="panel2a-header">
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
        </div>
    )
}
