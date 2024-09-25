import { create } from 'zustand'
import { Quiz } from '@/types/quiz'

interface QuizStore {
  quizzes: Quiz[]
  loadQuizzes: () => Quiz[]
  addQuiz: (quiz: Quiz) => boolean
  deleteQuiz: (id: string) => void
  getQuiz: (id: string) => Quiz | undefined
  updateQuiz: (updatedQuiz: Quiz) => boolean
  getQuizById: (id: string) => Quiz | undefined
  quizNameExists: (name: string, excludeId?: string) => boolean
}

export const useQuizStore = create<QuizStore>((set, get) => ({
  quizzes: [],
  loadQuizzes: () => {
    // Load quizzes from localStorage or wherever you're storing them
    const storedQuizzes = JSON.parse(localStorage.getItem('quizzes') || '[]')
    set({ quizzes: storedQuizzes })
    return storedQuizzes
  },
  addQuiz: (quiz) => {
    const { quizzes } = get()
    if (quizzes.some(q => q.title.toLowerCase() === quiz.title.toLowerCase())) {
      return false
    }
    set((state) => {
      const updatedQuizzes = [...state.quizzes, quiz]
      localStorage.setItem('savedQuizzes', JSON.stringify(updatedQuizzes))
      return { quizzes: updatedQuizzes }
    })
    return true
  },
  deleteQuiz: (id) => set((state) => {
    const updatedQuizzes = state.quizzes.filter(q => q.id !== id)
    localStorage.setItem('savedQuizzes', JSON.stringify(updatedQuizzes))
    return { quizzes: updatedQuizzes }
  }),
  getQuiz: (id) => get().quizzes.find(q => q.id === id),
  updateQuiz: (updatedQuiz: Quiz) => {
    const { quizzes } = get()
    if (quizzes.some(q => q.id !== updatedQuiz.id && q.title.toLowerCase() === updatedQuiz.title.toLowerCase())) {
      return false
    }
    set((state) => {
      const updatedQuizzes = state.quizzes.map(quiz => 
        quiz.id === updatedQuiz.id ? updatedQuiz : quiz
      )
      localStorage.setItem('savedQuizzes', JSON.stringify(updatedQuizzes))
      return { quizzes: updatedQuizzes }
    })
    return true
  },
  getQuizById: (id: string) => get().quizzes.find(q => q.id === id),
  quizNameExists: (name: string, excludeId?: string) => {
    const { quizzes } = get()
    return quizzes.some(q => q.title.toLowerCase() === name.toLowerCase() && q.id !== excludeId)
  },
}))