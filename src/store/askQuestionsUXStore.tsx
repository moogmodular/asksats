import { create } from 'zustand'

interface QuestionsUX {
    currentOpenQuestionId: string
    setCurrentOpenQuestionIdId: (id: string) => void
}

export const useQuestionsUXStore = create<QuestionsUX>((set) => ({
    currentOpenQuestionId: '',
    setCurrentOpenQuestionIdId: (id: string) => set({ currentOpenQuestionId: id }),
}))
