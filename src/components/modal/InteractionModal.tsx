import { ReactNode } from 'react'
import useActionStore from '~/store/actionStore'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, useMediaQuery } from '@mui/material'

interface InteractionModalProps {
    title: string
    children: ReactNode
}

export const InteractionModal = ({ children, title }: InteractionModalProps) => {
    const { closeModal } = useActionStore()
    const fullScreen = useMediaQuery('(min-width:600px)')

    return (
        <div>
            <Dialog
                fullScreen={!fullScreen}
                open={true}
                onClose={closeModal}
                maxWidth={'lg'}
                aria-labelledby="responsive-dialog-title"
            >
                <DialogTitle id="responsive-dialog-title">{title}</DialogTitle>
                <DialogContent>{children}</DialogContent>
                <DialogActions>
                    <Button autoFocus onClick={closeModal}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}
