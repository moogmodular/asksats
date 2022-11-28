import create from 'zustand'

interface QuestionsUX {
    currentOpenQuestionId: string
    setCurrentOpenQuestionIdId: (id: string) => void
}

const useQuestionsUXStore = create<QuestionsUX>((set) => ({
    currentOpenQuestionId: '',
    setCurrentOpenQuestionIdId: (id: string) => set({ currentOpenQuestionId: id }),
}))

export default useQuestionsUXStore
