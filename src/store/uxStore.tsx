import create from 'zustand'

interface UXAction {
    mobileMenuOpen: boolean
    setMobileMenuOpen: (open: boolean) => void
}

const useUXStore = create<UXAction>((set) => ({
    mobileMenuOpen: false,
    setMobileMenuOpen: (open: boolean) => {
        set({ mobileMenuOpen: open })
    },
}))

export default useUXStore
