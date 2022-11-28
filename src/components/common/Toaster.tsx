import useMessageStore, { MessageTypes } from '~/store/messageStore'

interface ToasterDisplayProps {}

export const ToasterDisplay = ({}: ToasterDisplayProps) => {
    const { currentMessage, currentMessageType } = useMessageStore()

    const toastType = (type: MessageTypes) => {
        return {
            error: 'alert-error',
            success: 'alert-success',
            info: 'alert-info',
            warning: 'alert-warning',
        }[type]
    }

    return (
        <div className="toast-start toast-bottom toast">
            <div className={`alert ${toastType(currentMessageType)}`}>
                <div>
                    <span>{currentMessage}</span>
                </div>
            </div>
        </div>
    )
}
