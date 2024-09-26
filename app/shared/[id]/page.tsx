'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Quiz } from "@/types/quiz"
import { PopupNotification } from "@/components/popup-notification"

export default function SharedQuizPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await fetch(`/api/share-quiz?id=${params.id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch quiz')
        }
        const data = await response.json()
        if (data.quiz) {
          const quiz: Quiz = data.quiz
          const queryParams = new URLSearchParams({
            id: quiz.id,
            name: quiz.title,
            description: quiz.description,
            questions: JSON.stringify(quiz.questions),
            isShared: 'true'
          }).toString()
          router.push(`/create?${queryParams}`)
        } else {
          throw new Error('Quiz not found')
        }
      } catch (error) {
        console.error('Error fetching quiz:', error)
        setNotification({
          message: "Failed to load the shared quiz. Please check the link and try again.",
          type: "error"
        })
      }
    }

    fetchQuiz()
  }, [params.id, router])

  return (
    <div>
      {notification && (
        <PopupNotification
          message={notification.message}
          type={notification.type}
        />
      )}
      <div>Loading shared quiz...</div>
    </div>
  )
}