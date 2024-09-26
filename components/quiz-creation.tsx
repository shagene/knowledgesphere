"use client"

import React, { useCallback } from 'react'
import { useState, useEffect, useRef } from "react"
import { useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { BookOpen, Plus, Save, Trash2, Upload, Image, Loader2 } from "lucide-react"
import { useQuizStore } from '@/store/quizStore'
import { Quiz, QuizQuestion } from "@/types/quiz"
import { useRouter } from 'next/navigation'
import { toast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { PopupNotification } from "@/components/popup-notification"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useQueryClient } from '@tanstack/react-query'
import AIChatModal from '@/components/ai-chat-modal'
import AIQuizGeneratorModal from '@/components/ai-quiz-generator-modal'

const QuizCreationComponent: React.FC = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const [quizId, setQuizId] = useState<string | null>(null)
  const [quizName, setQuizName] = useState("")
  const [quizDescription, setQuizDescription] = useState("")
  const [pairs, setPairs] = useState<QuizQuestion[]>([{ question: "", answer: "" }])
  const [isShared, setIsShared] = useState(false)
  const { addQuiz, updateQuiz, getQuizById, quizNameExists } = useQuizStore()

  const [jsonInput, setJsonInput] = useState(JSON.stringify([
    {
      "question": "What is the capital of France?",
      "answer": "Paris"
    },
    {
      "question": "Who wrote 'Romeo and Juliet'?",
      "answer": "William Shakespeare"
    },
    {
      "question": "What is the chemical symbol for gold?",
      "answer": "Au"
    }
  ], null, 2))
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [isImageUploading, setIsImageUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [uploadButtonText, setUploadButtonText] = useState('Upload Image')
  const [isChatModalOpen, setIsChatModalOpen] = useState(false)
  const [extractedPairs, setExtractedPairs] = useState<QuizQuestion[]>([])

  const [isQuizGeneratorModalOpen, setIsQuizGeneratorModalOpen] = useState(false)

  useEffect(() => {
    if (isImageUploading) {
      setUploadButtonText('Processing...')
    } else {
      // Add a small delay before changing the text back
      const timer = setTimeout(() => setUploadButtonText('Upload Image'), 500)
      return () => clearTimeout(timer)
    }
  }, [isImageUploading])

  const validateQuiz = (): string[] => {
    const errors: string[] = [];
    if (!quizName.trim()) {
      errors.push("Quiz name is required.");
    }
    if (pairs.length < 2) {
      errors.push("At least two questions are required.");
    }
    if (pairs.some(pair => !pair.question.trim() || !pair.answer.trim())) {
      errors.push("All questions and answers must be filled out.");
    }
    return errors;
  };

  const getValidationErrors = (): string => {
    const errors = validateQuiz();
    return errors.length > 0 ? errors.join("\n") : "";
  };

  useEffect(() => {
    if (!searchParams) return;

    const id = searchParams.get('id')
    const name = searchParams.get('name')
    const description = searchParams.get('description')
    const questions = searchParams.get('questions')
    const shared = searchParams.get('isShared')

    if (id) setQuizId(id)
    if (name) setQuizName(name)
    if (description) setQuizDescription(description)
    if (questions) {
      try {
        const parsedQuestions = JSON.parse(questions)
        setPairs(parsedQuestions)
      } catch (error) {
        console.error("Failed to parse questions:", error)
      }
    }
    if (shared === 'true') {
      setIsShared(true)
    }
  }, [searchParams])

  const addPair = () => {
    setPairs([...pairs, { question: "", answer: "" }])
  }

  const removePair = (index: number) => {
    const newPairs = pairs.filter((_, i) => i !== index)
    setPairs(newPairs)
  }

  const updatePair = (index: number, field: "question" | "answer", value: string) => {
    const newPairs = [...pairs]
    newPairs[index][field] = value
    setPairs(newPairs)
  }

  const handleSave = () => {
    const validationErrors = validateQuiz();
    if (validationErrors.length > 0) {
      setNotification({
        message: validationErrors.join("\n"),
        type: "error"
      });
      return;
    }

    const existingQuiz = quizId ? getQuizById(quizId) : null

    if (quizNameExists(quizName, quizId || undefined)) {
      setNotification({
        message: "A quiz with this name already exists. Please choose a different name.",
        type: "error"
      });
      return;
    }

    const quizData: Quiz = {
      id: isShared ? Date.now().toString() : (quizId || Date.now().toString()),
      title: quizName,
      description: quizDescription,
      questions: pairs,
      createdAt: new Date().toISOString(),
      lastEdited: new Date().toISOString(),
      questionCount: pairs.length
    }

    console.log('Saving quiz:', quizData)

    let success: boolean = addQuiz(quizData)
    console.log('Added new quiz:', success ? 'success' : 'failed')

    if (success) {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] })
      
      setNotification({
        message: isShared ? "Shared quiz has been saved to your quizzes." : "Your new quiz has been successfully created.",
        type: "success"
      });

      setTimeout(() => {
        router.push('/saved')
      }, 1500)
    }
  }

  const handleImport = () => {
    try {
      const json = JSON.parse(jsonInput)
      if (Array.isArray(json) && json.every(item => 'question' in item && 'answer' in item)) {
        setPairs(json)
        setIsImportDialogOpen(false)
        setNotification({
          message: `Imported ${json.length} question-answer pairs.`,
          type: "success"
        });
      } else {
        throw new Error("Invalid JSON format")
      }
    } catch (error) {
      setNotification({
        message: "Please ensure the JSON is correctly formatted.",
        type: "error"
      });
    }
  }

  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImageUploading(true)
    setNotification({
      message: "Uploading and processing image...",
      type: "success"
    })

    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch('/api/process-image', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to process image')
      }

      const data = await response.json()
      
      setExtractedPairs(data.pairs)
      setIsChatModalOpen(true)

      setNotification({
        message: `Successfully extracted ${data.pairs.length} question-answer pairs from the image.`,
        type: "success"
      })
    } catch (error) {
      console.error('Error processing image:', error)
      setNotification({
        message: "Failed to process image. Please try again.",
        type: "error"
      })
    } finally {
      setIsImageUploading(false)
    }
  }, [])

  const handleChatModalClose = () => {
    setIsChatModalOpen(false)
  }

  const handleChatModalAccept = (updatedPairs: QuizQuestion[]) => {
    setPairs(updatedPairs)
    setIsChatModalOpen(false)
    setNotification({
      message: `Updated quiz with ${updatedPairs.length} question-answer pairs.`,
      type: "success"
    })
  }

  const handleQuizGeneratorModalAccept = (generatedPairs: QuizQuestion[]) => {
    setPairs(generatedPairs)
    setIsQuizGeneratorModalOpen(false)
    setNotification({
      message: `Generated ${generatedPairs.length} question-answer pairs.`,
      type: "success"
    })
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {notification && (
        <PopupNotification
          message={notification.message}
          type={notification.type}
        />
      )}
      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">
            {isShared ? "Save Shared Quiz" : (quizId ? "Edit Quiz" : "Create a New Quiz")}
          </h1>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Quiz Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="quiz-title">Name</Label>
                  <Input
                    id="quiz-title"
                    value={quizName}
                    onChange={(e) => setQuizName(e.target.value)}
                    placeholder="Enter quiz name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quiz-description">Description</Label>
                  <Textarea
                    id="quiz-description"
                    value={quizDescription}
                    onChange={(e) => setQuizDescription(e.target.value)}
                    placeholder="Enter quiz description"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-between mb-4">
            <Button onClick={addPair} className="bg-indigo-500 hover:bg-indigo-600">
              <Plus className="mr-2 h-4 w-4" /> Add Pair
            </Button>
            <div className="space-x-2">
              <Button 
                key={isImageUploading ? 'uploading' : 'idle'}
                onClick={() => fileInputRef.current?.click()} 
                variant="outline"
                disabled={isImageUploading}
              >
                {isImageUploading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Image className="mr-2 h-4 w-4" />
                )}
                {uploadButtonText}
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
              <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Upload className="mr-2 h-4 w-4" /> Import JSON
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Import JSON</DialogTitle>
                    <DialogDescription>
                      Below is an example JSON array of question-answer pairs. You can modify this example or replace it entirely with your own JSON data. Ensure each object has a "question" and an "answer" field.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <Textarea
                      value={jsonInput}
                      onChange={(e) => setJsonInput(e.target.value)}
                      rows={15}
                    />
                  </div>
                  <DialogFooter>
                    <Button onClick={handleImport}>Import</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button 
                onClick={() => setIsQuizGeneratorModalOpen(true)} 
                variant="outline"
              >
                <BookOpen className="mr-2 h-4 w-4" /> Chat with AI
              </Button>
            </div>
          </div>
          <div className="space-y-4">
            {pairs.map((pair, index) => (
              <Card key={index} className="mb-4">
                <CardHeader className="flex flex-row items-center">
                  <CardTitle className="flex-grow">Pair {index + 1}</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removePair(index)}
                    className="ml-auto"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor={`question-${index}`}>Question/Term</Label>
                      <Input
                        id={`question-${index}`}
                        value={pair.question}
                        onChange={(e) => updatePair(index, "question", e.target.value)}
                        placeholder="Enter question or term"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`answer-${index}`}>Answer/Definition</Label>
                      <Input
                        id={`answer-${index}`}
                        value={pair.answer}
                        onChange={(e) => updatePair(index, "answer", e.target.value)}
                        placeholder="Enter answer or definition"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex justify-end mt-6">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button 
                      onClick={handleSave} 
                      className="bg-green-500 hover:bg-green-600"
                      disabled={validateQuiz().length > 0}
                    >
                      <Save className="mr-2 h-4 w-4" /> {isShared ? "Save Shared Quiz" : "Save Quiz"}
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="whitespace-pre-line">{getValidationErrors() || "Ready to save!"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </main>
      <AIChatModal
        isOpen={isChatModalOpen}
        onClose={handleChatModalClose}
        initialData={extractedPairs}
        onAccept={handleChatModalAccept}
      />
      <AIQuizGeneratorModal
        isOpen={isQuizGeneratorModalOpen}
        onClose={() => setIsQuizGeneratorModalOpen(false)}
        onAccept={handleQuizGeneratorModalAccept}
      />
    </div>
  )
}

export default QuizCreationComponent