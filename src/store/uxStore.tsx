import { create } from 'zustand'

interface UXAction {
    mobileMenuOpen: boolean
    setMobileMenuOpen: (open: boolean) => void
}

export const useUXStore = create<UXAction>((set) => ({
    mobileMenuOpen: false,
    setMobileMenuOpen: (open: boolean) => {
        set({ mobileMenuOpen: open })
    },
}))
