import { create } from 'zustand'

interface BlogUX {
    currentOpenModalId: string
    setCurrentOpenModalId: (id: string) => void
}

export const useBlogUXStore = create<BlogUX>((set) => ({
    currentOpenModalId: '',
    setCurrentOpenModalId: (id: string) => set({ currentOpenModalId: id }),
}))
