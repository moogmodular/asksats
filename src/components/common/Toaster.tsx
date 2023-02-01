import { useMessageStore, MessageTypes } from '~/store/messageStore'
import { Alert, Snackbar } from '@mui/material'

interface ToasterDisplayProps {}

export const ToasterDisplay = ({}: ToasterDisplayProps) => {
    const { currentMessage, currentMessageType } = useMessageStore()

    const toastType = (type: MessageTypes, msg: string) => {
        return {
            error: <Alert severity="error">{msg}</Alert>,
            success: <Alert severity="success">{msg}</Alert>,
            info: <Alert severity="info">{msg}</Alert>,
            warning: <Alert severity="warning">{msg}</Alert>,
        }[type]
    }

    return (
        <Snackbar open={true} autoHideDuration={6000} message={currentMessage}>
            {toastType(currentMessageType, currentMessage)}
        </Snackbar>
    )
}
