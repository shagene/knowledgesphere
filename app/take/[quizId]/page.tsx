import dynamic from 'next/dynamic'

const QuizTakingComponent = dynamic(() => import('@/components/quiz-taking').then(mod => mod.QuizTakingComponent), { ssr: false })

interface PageProps {
  params: { quizId: string }
}

export default function TakeQuizPage({ params }: PageProps) {
  return (
    <div>
      <QuizTakingComponent quizId={params.quizId} />
    </div>
  )
}