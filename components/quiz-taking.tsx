"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, CheckCircle, ChevronLeft, ChevronRight, X, RefreshCw } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useQuizStore } from "@/store/quizStore"
import { Quiz, QuizQuestion } from "@/types/quiz"

interface QuizTakingComponentProps {
  quizId: string;
}

export function QuizTakingComponent({ quizId }: QuizTakingComponentProps) {
  const router = useRouter()
  const { getQuiz, loadQuizzes } = useQuizStore()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [randomizedQuestions, setRandomizedQuestions] = useState<string[]>([])
  const [randomizedAnswers, setRandomizedAnswers] = useState<string[]>([])
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [matches, setMatches] = useState<{ [key: string]: string }>({})
  const [isComplete, setIsComplete] = useState(false)
  const [isStudyMode, setIsStudyMode] = useState(false)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [score, setScore] = useState<number | null>(null)
  const [gradedMatches, setGradedMatches] = useState<{ [key: string]: { answer: string, isCorrect: boolean } }>({})

  const shuffleArray = useCallback((array: any[]) => {
    return [...array].sort(() => Math.random() - 0.5)
  }, [])

  const initializeQuiz = useCallback(() => {
    if (quiz) {
      const questions = quiz.questions.map(q => q.question)
      const answers = quiz.questions.map(q => q.answer)
      setRandomizedQuestions(shuffleArray(questions))
      setRandomizedAnswers(shuffleArray(answers))
      setMatches({})
      setIsComplete(false)
      setScore(null)
      setGradedMatches({})
    }
  }, [quiz, shuffleArray])

  useEffect(() => {
    loadQuizzes()
    const foundQuiz = getQuiz(quizId)
    if (foundQuiz) {
      setQuiz(foundQuiz)
    } else {
      console.error(`Quiz with id ${quizId} not found`)
      router.push('/saved')
    }
  }, [quizId, getQuiz, router, loadQuizzes])

  useEffect(() => {
    initializeQuiz()
  }, [quiz, initializeQuiz])

  const handleQuestionClick = (question: string) => {
    if (matches[question]) {
      // If already matched, unselect it
      const newMatches = { ...matches }
      delete newMatches[question]
      setMatches(newMatches)
      setSelectedQuestion(null)
      return
    }
    setSelectedQuestion(question)
    if (selectedAnswer) {
      // If an answer was already selected, create a match
      setMatches(prev => ({ ...prev, [question]: selectedAnswer }))
      setSelectedQuestion(null)
      setSelectedAnswer(null)
    }
  }

  const handleAnswerClick = (answer: string) => {
    if (Object.values(matches).includes(answer)) {
      // If already matched, unselect it
      const questionToRemove = Object.keys(matches).find(key => matches[key] === answer)
      if (questionToRemove) {
        const newMatches = { ...matches }
        delete newMatches[questionToRemove]
        setMatches(newMatches)
      }
      setSelectedAnswer(null)
      return
    }
    setSelectedAnswer(answer)
    if (selectedQuestion) {
      // If a question was already selected, create a match
      setMatches(prev => ({ ...prev, [selectedQuestion]: answer }))
      setSelectedQuestion(null)
      setSelectedAnswer(null)
    }
  }

  useEffect(() => {
    if (quiz && Object.keys(matches).length === quiz.questions.length) {
      setIsComplete(true)
      gradeQuiz()
    }
  }, [matches, quiz])

  const gradeQuiz = () => {
    if (!quiz) return

    let correctCount = 0
    const graded: { [key: string]: { answer: string, isCorrect: boolean } } = {}

    quiz.questions.forEach(q => {
      const userAnswer = matches[q.question]
      const isCorrect = userAnswer === q.answer
      if (isCorrect) correctCount++
      graded[q.question] = { answer: userAnswer, isCorrect }
    })

    const calculatedScore = (correctCount / quiz.questions.length) * 100
    setScore(calculatedScore)
    setGradedMatches(graded)
  }

  const nextCard = () => {
    if (quiz) {
      setCurrentCardIndex((prevIndex) => (prevIndex + 1) % quiz.questions.length)
    }
  }

  const prevCard = () => {
    if (quiz) {
      setCurrentCardIndex((prevIndex) => (prevIndex - 1 + quiz.questions.length) % quiz.questions.length)
    }
  }

  const retakeQuiz = () => {
    initializeQuiz()
  }

  const getButtonVariant = (item: string, isQuestion: boolean) => {
    const baseClasses = "w-full justify-start text-left py-2 px-4 h-auto min-h-[2.5rem] whitespace-normal"
    if (isQuestion) {
      if (selectedQuestion === item) return `${baseClasses} bg-blue-500 text-white`
      if (matches[item]) return `${baseClasses} bg-blue-800 text-white`
      return `${baseClasses} bg-blue-100 text-blue-800 hover:bg-blue-200`
    } else {
      if (selectedAnswer === item) return `${baseClasses} bg-blue-500 text-white`
      if (Object.values(matches).includes(item)) return `${baseClasses} bg-green-500 text-white`
      return `${baseClasses} bg-green-100 text-green-800 hover:bg-green-200`
    }
  }

  if (!quiz) {
    return <div>Loading quiz...</div>
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">{quiz?.title}</h1>
          <p className="text-gray-600 mb-6">{quiz?.description}</p>
          <div className="flex justify-center mb-6">
            <Button onClick={() => setIsStudyMode(!isStudyMode)} className="bg-indigo-500 hover:bg-indigo-600 mr-2">
              {isStudyMode ? "Take Quiz" : "Study Mode"}
            </Button>
            {isComplete && (
              <Button onClick={retakeQuiz} className="bg-green-500 hover:bg-green-600">
                <RefreshCw className="mr-2 h-4 w-4" />
                Retake Quiz
              </Button>
            )}
          </div>
          {isStudyMode ? (
            <div className="relative h-[400px]">
              <AnimatePresence initial={false}>
                <motion.div
                  key={currentCardIndex}
                  initial={{ opacity: 0, x: 300 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -300 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="absolute inset-0"
                >
                  <Card className="h-full text-center">
                    <CardHeader>
                      <CardTitle>{quiz.questions[currentCardIndex].answer}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{quiz.questions[currentCardIndex].question}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </AnimatePresence>
              <div className="absolute bottom-4 left-0 right-0 flex justify-between px-4">
                <Button onClick={prevCard} variant="outline" size="icon">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button onClick={nextCard} variant="outline" size="icon">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Questions/Terms</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {randomizedQuestions.map((question, index) => (
                      <Button
                        key={index}
                        onClick={() => !isComplete && handleQuestionClick(question)}
                        className={getButtonVariant(question, true)}
                        disabled={isComplete}
                      >
                        <span className="block">{question}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Answers/Definitions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {randomizedAnswers.map((answer, index) => (
                      <Button
                        key={index}
                        onClick={() => !isComplete && handleAnswerClick(answer)}
                        className={getButtonVariant(answer, false)}
                        disabled={isComplete}
                      >
                        <span className="block">{answer}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          {isComplete && !isStudyMode && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                  Quiz Complete!
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="text-lg font-semibold">Your Score: {score !== null ? `${score.toFixed(2)}%` : 'Calculating...'}</p>
                </div>
                <div className="space-y-2">
                  {Object.entries(gradedMatches).map(([question, { answer, isCorrect }], index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="font-medium">{question}:</span>
                      <div className="flex items-center">
                        <span className={isCorrect ? "text-green-500" : "text-red-500"}>{answer}</span>
                        {isCorrect ? (
                          <CheckCircle className="ml-2 h-4 w-4 text-green-500" />
                        ) : (
                          <X className="ml-2 h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}