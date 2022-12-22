import create from 'zustand'

interface NodeConnection {
    connectionAddress: string
    setConnectionAddress: (address: string) => void
}

const useNodeConnectionStore = create<NodeConnection>((set, getState) => ({
    connectionAddress: '',
    setConnectionAddress: (address: string) => {
        if (getState().connectionAddress !== address) {
            set({ connectionAddress: address })
        }
    },
}))

export default useNodeConnectionStore
