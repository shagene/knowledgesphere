'use client'

import { useEffect } from 'react'
import { useQuizStore } from '@/store/quizStore'

export function QuizStoreInitializer() {
  const loadQuizzes = useQuizStore(state => state.loadQuizzes)

  useEffect(() => {
    console.log('Initializing quiz store...')
    const quizzes = loadQuizzes()
    console.log('Initialized quizzes:', quizzes)
  }, [loadQuizzes])

  return null
}