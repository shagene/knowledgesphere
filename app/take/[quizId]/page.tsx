import { QuizTakingComponent } from "@/components/quiz-taking"

export default function TakeQuizPage({ params }: { params: { quizId: string } }) {
  return <QuizTakingComponent quizId={params.quizId} />
}