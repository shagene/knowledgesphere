import {QuizTakingComponent} from '@/components/quiz-taking';

interface PageProps {
  params: { quizId: string }
}

export default function TakeQuizPage({ params }: PageProps) {
  return <QuizTakingComponent quizId={params.quizId} />;
}