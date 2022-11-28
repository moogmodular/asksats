import create from 'zustand'

interface BlogUX {
    currentOpenModalId: string
    setCurrentOpenModalId: (id: string) => void
}

const useBlogUXStore = create<BlogUX>((set) => ({
    currentOpenModalId: '',
    setCurrentOpenModalId: (id: string) => set({ currentOpenModalId: id }),
}))

export default useBlogUXStore
