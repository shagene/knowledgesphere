import dynamic from 'next/dynamic'
import { Suspense } from 'react'

const QuizTakingComponent = dynamic(
  () => import('@/components/quiz-taking').then(mod => mod.QuizTakingComponent),
  { ssr: false }
)

interface PageProps {
  params: { quizId: string }
}

export default function TakeQuizPage({ params }: PageProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <QuizTakingComponent quizId={params.quizId} />
    </Suspense>
  )
}