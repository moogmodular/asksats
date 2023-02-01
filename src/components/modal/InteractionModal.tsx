import { ReactNode } from 'react'
import { useActionStore } from '~/store/actionStore'
import { Breakpoint, Button, Dialog, DialogActions, DialogContent, DialogTitle, useMediaQuery } from '@mui/material'

interface InteractionModalProps {
    title: string
    children: ReactNode
    size?: Breakpoint
}

export const InteractionModal = ({ children, title, size }: InteractionModalProps) => {
    const { closeModal } = useActionStore()
    const fullScreen = useMediaQuery('(min-width:1024px)')

    return (
        <div>
            <Dialog
                fullScreen={!fullScreen}
                open={true}
                onClose={closeModal}
                maxWidth={size ?? 'lg'}
                fullWidth={true}
                aria-labelledby="responsive-dialog-title"
            >
                <DialogTitle id="responsive-dialog-title">{title}</DialogTitle>
                <DialogContent>{children}</DialogContent>
                <DialogActions>
                    <Button
                        id={'modal-close'}
                        onClick={closeModal}
                        variant={'contained'}
                        color={'secondary'}
                        component="div"
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}
