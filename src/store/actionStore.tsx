import { create } from 'zustand'

type Modals =
    | 'none'
    | 'authenticate'
    | 'transact'
    | 'editUser'
    | 'createAsk'
    | 'addOffer'
    | 'viewImage'
    | 'editAsk'
    | 'welcome'
    | 'createSpace'
    | 'editSpace'

interface Action {
    currentModal: Modals
    setCurrentModal: (modal: Modals) => void
    openEditAsk: (askId: string) => void
    askToEdit: string
    closeModal: () => void
    askId: string
    createOffer: (askId: string) => void
    imageUrl: string
    openImage: (imageUrl: string) => void
    editSpace: (spaceId: string) => void
    spaceId: string
}

export const useActionStore = create<Action>((set) => ({
    currentModal: 'none',
    setCurrentModal: (modal: Modals) => {
        set({ currentModal: modal })
    },
    openEditAsk: (askId: string) => {
        set({ askId: askId, currentModal: 'editAsk' })
    },
    askToEdit: '',
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
    editSpace: (spaceId: string) => {
        set({ spaceId: spaceId, currentModal: 'editSpace' })
    },
    spaceId: '',
}))
