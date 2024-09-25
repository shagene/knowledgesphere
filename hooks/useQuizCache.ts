import { useState, useEffect, useCallback } from 'react';
import { Quiz } from '@/types/quiz';

export function useQuizCache() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  const loadQuizzes = useCallback(() => {
    const savedQuizzes = localStorage.getItem('savedQuizzes');
    if (savedQuizzes) {
      setQuizzes(JSON.parse(savedQuizzes));
    }
  }, []);

  useEffect(() => {
    loadQuizzes();
  }, [loadQuizzes]);

  const saveQuiz = useCallback((quiz: Quiz) => {
    setQuizzes(prevQuizzes => {
      const updatedQuizzes = [...prevQuizzes, quiz];
      localStorage.setItem('savedQuizzes', JSON.stringify(updatedQuizzes));
      return updatedQuizzes;
    });
  }, []);

  const deleteQuiz = useCallback((quizId: string) => {
    setQuizzes(prevQuizzes => {
      const updatedQuizzes = prevQuizzes.filter(quiz => quiz.id !== quizId);
      localStorage.setItem('savedQuizzes', JSON.stringify(updatedQuizzes));
      return updatedQuizzes;
    });
  }, []);

  const getQuiz = useCallback((quizId: string) => {
    return quizzes.find(quiz => quiz.id === quizId) || null;
  }, [quizzes]);

  return { quizzes, saveQuiz, deleteQuiz, getQuiz, loadQuizzes };
}