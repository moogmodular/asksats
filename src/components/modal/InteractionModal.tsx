import { ReactNode } from 'react'
import useActionStore from '~/store/actionStore'
import { Box, Modal, Typography } from '@mui/material'

interface InteractionModalProps {
    title: string
    children: ReactNode
}

export const InteractionModal = ({ children, title }: InteractionModalProps) => {
    const { closeModal } = useActionStore()

    return (
        <>
            <Modal
                open={true}
                onClose={closeModal}
                disableScrollLock={true}
                className={'flex flex-col items-center justify-center'}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box className={'modal-container p-4'}>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        {title}
                    </Typography>
                    <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                        {children}
                    </Typography>
                </Box>
            </Modal>
        </>
    )
}
