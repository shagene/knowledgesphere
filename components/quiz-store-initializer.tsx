'use client'

import { useEffect } from 'react'
import { useQuizStore } from '@/store/quizStore'

export function QuizStoreInitializer() {
  const loadQuizzes = useQuizStore(state => state.loadQuizzes)

  useEffect(() => {
    loadQuizzes()
  }, [loadQuizzes])

  return null
}