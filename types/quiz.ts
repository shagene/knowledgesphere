export interface QuizQuestion {
  question: string;
  answer: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  createdAt: string;
  lastEdited: string;
  questionCount: number;
}