import dynamic from 'next/dynamic'
import { Suspense } from 'react'

const QuizCreationComponent = dynamic(
  () => import('@/components/quiz-creation'),
  { ssr: false }
)

export default function CreateQuizPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <QuizCreationComponent />
    </Suspense>
  )
}