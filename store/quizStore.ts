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
    const storedQuizzes = JSON.parse(localStorage.getItem('savedQuizzes') || '[]') as Quiz[]
    console.log('Loading quizzes from localStorage:', storedQuizzes)
    set({ quizzes: storedQuizzes })
    return storedQuizzes
  },
  addQuiz: (quiz) => {
    const storedQuizzes = JSON.parse(localStorage.getItem('savedQuizzes') || '[]') as Quiz[]
    if (storedQuizzes.some(q => q.title.toLowerCase() === quiz.title.toLowerCase())) {
      console.log('Quiz with this name already exists:', quiz.title)
      return false
    }
    const updatedQuizzes = [...storedQuizzes, quiz]
    localStorage.setItem('savedQuizzes', JSON.stringify(updatedQuizzes))
    console.log('Added new quiz:', quiz)
    set({ quizzes: updatedQuizzes })
    return true
  },
  deleteQuiz: (id) => {
    const storedQuizzes = JSON.parse(localStorage.getItem('savedQuizzes') || '[]') as Quiz[]
    const updatedQuizzes = storedQuizzes.filter(q => q.id !== id)
    localStorage.setItem('savedQuizzes', JSON.stringify(updatedQuizzes))
    set({ quizzes: updatedQuizzes })
  },
  getQuiz: (id) => get().quizzes.find(q => q.id === id),
  updateQuiz: (updatedQuiz) => {
    const { quizzes } = get()
    if (quizzes.some(q => q.id !== updatedQuiz.id && q.title.toLowerCase() === updatedQuiz.title.toLowerCase())) {
      return false
    }
    const updatedQuizzes = quizzes.map(quiz => 
      quiz.id === updatedQuiz.id ? updatedQuiz : quiz
    )
    localStorage.setItem('savedQuizzes', JSON.stringify(updatedQuizzes))
    set({ quizzes: updatedQuizzes })
    return true
  },
  getQuizById: (id) => get().quizzes.find(q => q.id === id),
  quizNameExists: (name, excludeId) => {
    const { quizzes } = get()
    return quizzes.some(q => q.title.toLowerCase() === name.toLowerCase() && q.id !== excludeId)
  },
}))