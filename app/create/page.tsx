import dynamic from 'next/dynamic'

const QuizCreationComponent = dynamic(() => import('@/components/quiz-creation'), { ssr: false })

export default function CreateQuizPage() {
  return (
    <div>
      <QuizCreationComponent />
    </div>
  )
}