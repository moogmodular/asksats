import create from 'zustand/vanilla'
import { RouterOutput } from '~/utils/trpc'

type GetMeOutput = RouterOutput['user']['getMe']

interface AuthedUser {
    user: GetMeOutput | undefined
    setUser: (user: GetMeOutput) => void
    unsetUser: () => void
    storeToken: string
    setStoreToken: (token: string) => void
    unsetStoreToken: () => void
    storeLogin: (token: string) => void
    logout: () => void
}

const authedUserStore = create<AuthedUser>((set) => ({
    user: undefined,
    setUser: (user: GetMeOutput) => {
        set({ user })
    },
    unsetUser: () => {
        set({ user: undefined })
    },
    storeToken: '',
    setStoreToken: (storeToken: string) => {
        set({ storeToken })
    },
    unsetStoreToken: () => {
        set({ storeToken: '' })
    },
    storeLogin: async (token) => {
        localStorage.setItem('token', token)
        set({ storeToken: token })
    },
    logout: () => {
        localStorage.removeItem('token')
        set({ user: undefined, storeToken: '' })
    },
}))

export default authedUserStore
