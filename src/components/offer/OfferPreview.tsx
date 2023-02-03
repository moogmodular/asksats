import { RouterOutput, trpc } from '~/utils/trpc'
import { MDRender } from '~/components/common/MDRender'
import { format } from 'date-fns'
import { standardDateFormat } from '~/utils/date'
import { FileView } from '~/components/FileView'
import { Accordion, AccordionDetails, AccordionSummary, Button, Tooltip } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import DesignServicesIcon from '@mui/icons-material/DesignServices'
import CheckIcon from '@mui/icons-material/Check'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import { IconPropertyDisplay } from '~/components/common/IconPropertyDisplay'

type OfferOutput = RouterOutput['offer']['listForAsk'][0]

interface OfferPreviewProps {
    offer: OfferOutput
    canFavourite?: boolean
    index: number
}

export const OfferPreview = ({ offer, canFavourite, index }: OfferPreviewProps) => {
    const settleAskMutation = trpc.ask.settleAsk.useMutation()
    const utils = trpc.useContext()

    const handleSettleAsk = async () => {
        await settleAskMutation.mutateAsync({ askId: offer.askId ?? '', offerId: offer.id })
        utils.invalidate()
    }

    return (
        <div id={`offer-display-host-${index}`} className={'flex flex-row items-center'}>
            <Accordion key={offer.id}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel2a-content" id="panel2a-header">
                    <div className={'flex flex-row items-center gap-4 text-sm'}>
                        {canFavourite && (
                            <Tooltip title={'Settle this ask'}>
                                <Button
                                    id={`settle-ask-button`}
                                    aria-label="delete"
                                    component={'div'}
                                    color={'primary'}
                                    variant={'contained'}
                                    onClick={() => handleSettleAsk()}
                                    startIcon={<CheckIcon />}
                                >
                                    settle
                                </Button>
                            </Tooltip>
                        )}
                        <DesignServicesIcon />
                        <div>{format(offer.createdAt ?? 0, standardDateFormat)}</div>
                        <div>
                            <IconPropertyDisplay identifier={'userName'} value={offer?.author?.userName} link={true}>
                                <AccountCircleIcon fontSize={'small'} />
                            </IconPropertyDisplay>
                        </div>
                    </div>
                </AccordionSummary>
                <AccordionDetails>
                    <div className={'max-w-52 flex w-52 flex-row gap-1'}>
                        {offer.offerContext.filePairs.map((pair, index) => {
                            return (
                                <FileView
                                    index={index}
                                    key={index}
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
