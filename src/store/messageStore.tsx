import { create } from 'zustand'

export type MessageTypes = 'error' | 'success' | 'info' | 'warning'

interface Message {
    currentMessage: string
    currentMessageType: MessageTypes
    visible: boolean
    showToast: (messageType: MessageTypes, message: string) => void
}

export const useMessageStore = create<Message>((set) => ({
    currentMessage: '',
    currentMessageType: 'info',
    visible: false,
    showToast: (messageType: MessageTypes, message: string) => {
        set({
            currentMessage: message,
            currentMessageType: messageType,
            visible: true,
        })
        setTimeout(() => {
            set({
                currentMessage: '',
                currentMessageType: 'info',
                visible: false,
            })
        }, 3000)
    },
}))
