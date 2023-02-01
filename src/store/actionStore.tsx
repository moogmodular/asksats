import { create } from 'zustand'

type Modals = 'none' | 'authenticate' | 'transact' | 'editUser' | 'createAsk' | 'addOffer' | 'viewImage' | 'welcome'

interface Action {
    currentModal: Modals
    setCurrentModal: (modal: Modals) => void
    closeModal: () => void
    askId: string
    createOffer: (askId: string) => void
    imageUrl: string
    openImage: (imageUrl: string) => void
}

export const useActionStore = create<Action>((set) => ({
    currentModal: 'none',
    setCurrentModal: (modal: Modals) => {
        set({ currentModal: modal })
    },
    closeModal: () => {
        set({ currentModal: 'none' })
    },
    askId: '',
    createOffer: (askId: string) => {
        set({ askId: askId, currentModal: 'addOffer' })
    },
    imageUrl: '',
    openImage: (imageUrl: string) => {
        set({ imageUrl: imageUrl, currentModal: 'viewImage' })
    },
}))
