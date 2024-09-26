'use client'

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, PlusCircle, Save, Image, MessageSquare } from "lucide-react"
import { useSearchParams } from 'next/navigation'
import { toast } from "@/hooks/use-toast"

// Sample quizzes
const sampleQuizzes = [
  {
    id: "math-sample",
    title: "Advanced Math Quiz",
    description: "Test your advanced math skills with this challenging quiz.",
    questions: [
      { question: "What is the derivative of f(x) = x^3 + 2x^2 - 5x + 3?", answer: "3x^2 + 4x - 5" },
      { question: "Solve for x: 2^x = 32", answer: "x = 5" },
      { question: "What is the sum of the infinite geometric series 1 + 1/2 + 1/4 + 1/8 + ...?", answer: "2" },
      { question: "What is the value of cos(π/4)?", answer: "√2/2" },
      { question: "What is the area of a circle with radius 5 units?", answer: "25π square units" },
      { question: "Simplify: (3 + 4i)(2 - 3i)", answer: "18 + i" },
      { question: "What is the limit of (sin x)/x as x approaches 0?", answer: "1" },
      { question: "Solve the equation: ln(x) = 2", answer: "x = e^2" },
      { question: "What is the volume of a sphere with radius 3 units?", answer: "36π cubic units" },
      { question: "What is the probability of rolling a sum of 7 with two fair six-sided dice?", answer: "1/6" }
    ]
  },
  {
    id: "science-sample",
    title: "Advanced Science Quiz",
    description: "Challenge yourself with this advanced science quiz covering various fields.",
    questions: [
      { question: "What is the half-life of Carbon-14?", answer: "5,730 years" },
      { question: "What is the chemical formula for sulfuric acid?", answer: "H2SO4" },
      { question: "What is the speed of light in vacuum?", answer: "299,792,458 meters per second" },
      { question: "What is the most abundant element in the Earth's crust?", answer: "Oxygen" },
      { question: "What is the process by which plants convert light energy into chemical energy?", answer: "Photosynthesis" },
      { question: "What is the name of the force that opposes the relative motion of surfaces in contact?", answer: "Friction" },
      { question: "What is the pH of a neutral solution at 25°C?", answer: "7" },
      { question: "What is the smallest unit of life that can replicate independently?", answer: "Cell" },
      { question: "What is the main function of mitochondria in a cell?", answer: "Energy production" },
      { question: "What is the atomic number of gold?", answer: "79" }
    ]
  },
  {
    id: "history-sample",
    title: "World History Challenge",
    description: "Test your knowledge of world history with this challenging quiz.",
    questions: [
      { question: "In which year did the French Revolution begin?", answer: "1789" },
      { question: "Who was the first Emperor of the Roman Empire?", answer: "Augustus" },
      { question: "What was the name of the peace treaty that ended World War I?", answer: "Treaty of Versailles" },
      { question: "Which ancient civilization built the city of Machu Picchu?", answer: "Inca" },
      { question: "Who wrote 'The Art of War', an ancient Chinese military treatise?", answer: "Sun Tzu" },
      { question: "In which year did the Berlin Wall fall?", answer: "1989" },
      { question: "Who was the first woman to win a Nobel Prize?", answer: "Marie Curie" },
      { question: "What was the name of the ship that brought the Pilgrims to America in 1620?", answer: "Mayflower" },
      { question: "Which empire was ruled by Genghis Khan in the 13th century?", answer: "Mongol Empire" },
      { question: "Who was the leader of the Indian independence movement against British rule?", answer: "Mahatma Gandhi" }
    ]
  }
]

export function HomePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [quizName, setQuizName] = useState(searchParams?.get('name') || "")
  const [quizDescription, setQuizDescription] = useState(searchParams?.get('description') || "")
  const [quizCode, setQuizCode] = useState("")

  const handleCreateQuiz = (e: React.FormEvent) => {
    e.preventDefault()
    const queryParams = new URLSearchParams({
      name: quizName,
      description: quizDescription
    }).toString()
    router.push(`/create?${queryParams}`)
  }

  const handleJoinQuiz = (e: React.FormEvent) => {
    e.preventDefault()
    if (!quizCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a quiz code or full share URL.",
        variant: "destructive",
      })
      return
    }

    // Extract the quiz code from the share link if a full URL is pasted
    const extractedCode = quizCode.split('/').pop() || quizCode

    // Redirect to the shared quiz page
    router.push(`/shared/${extractedCode}`)
  }

  const handleSampleQuiz = (quiz: typeof sampleQuizzes[0]) => {
    const queryParams = new URLSearchParams({
      id: quiz.id,
      name: quiz.title,
      description: quiz.description,
      questions: JSON.stringify(quiz.questions),
      isSample: 'true'
    }).toString()
    router.push(`/create?${queryParams}`)
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <main className="flex-1">
      <section className="w-full py-12 md:py-24 lg:py-32">
      <div className=" px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Welcome to KnowledgeSphere
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Revolutionize your learning experience with interactive quizzes powered by AI.
                </p>
              </div>
              <div className="mx-auto max-w-3xl space-y-4">
                <p className="text-gray-500 dark:text-gray-400">
                  KnowledgeSphere is your ultimate platform for creating, taking, and sharing quizzes. Whether you're a student looking to ace your exams, an educator aiming to engage your students, or a lifelong learner passionate about expanding your knowledge, we've got you covered.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-start space-x-2">
                    <svg
                      className=" h-6 w-6 text-green-500"
                      fill="none"
                      height="24"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      width="24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <div className="text-left">
                      <h3 className="font-bold">AI-Powered Creation</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Generate quizzes from images or through AI chat.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <svg
                      className=" h-6 w-6 text-green-500"
                      fill="none"
                      height="24"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      width="24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <div className="text-left">
                      <h3 className="font-bold">Customizable Quizzes</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Tailor quizzes to your specific learning needs.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <svg
                      className=" h-6 w-6 text-green-500"
                      fill="none"
                      height="24"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      width="24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <div className="text-left">
                      <h3 className="font-bold">Easy Sharing</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Share quizzes with friends or students effortlessly.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <svg
                      className=" h-6 w-6 text-green-500"
                      fill="none"
                      height="24"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      width="24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <div className="text-left">
                      <h3 className="font-bold">Multiple Creation Methods</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Create quizzes manually, import from JSON, or use AI assistance.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full max-w-sm space-y-2">
                <form className="flex space-x-2" onSubmit={handleJoinQuiz}>
                  <Input 
                    className="max-w-lg flex-1" 
                    placeholder="Enter a quiz code or share URL" 
                    type="text"
                    value={quizCode}
                    onChange={(e) => setQuizCode(e.target.value)}
                  />
                  <Button type="submit">Join Quiz</Button>
                </form>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Don't have a code? Try creating your own quiz or explore our featured quizzes below!
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className=" px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Create or Take a Quiz</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Choose to create a new quiz or take an existing one. Our platform makes it easy to learn and test your knowledge.
                </p>
              </div>
              <div className="w-full max-w-md space-y-2">
                <Tabs defaultValue="create" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="create">Create Quiz</TabsTrigger>
                    <TabsTrigger value="take">Take Quiz</TabsTrigger>
                  </TabsList>
                  <TabsContent value="create">
                    <Card>
                      <CardHeader>
                        <CardTitle>Create a New Quiz</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="space-y-1">
                          <Label htmlFor="name">Name</Label>
                          <Input 
                            id="name" 
                            placeholder="Enter quiz name" 
                            value={quizName}
                            onChange={(e) => setQuizName(e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="description">Description</Label>
                          <Input 
                            id="description" 
                            placeholder="Enter quiz description" 
                            value={quizDescription}
                            onChange={(e) => setQuizDescription(e.target.value)}
                          />
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button className="w-full" onClick={handleCreateQuiz}>
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Create Quiz
                        </Button>
                      </CardFooter>
                    </Card>
                  </TabsContent>
                  <TabsContent value="take">
                    <Card>
                      <CardHeader>
                        <CardTitle>Take a Quiz</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="space-y-1">
                          <Label htmlFor="code">Quiz Code or Share URL</Label>
                          <Input 
                            id="code" 
                            placeholder="Enter quiz code or full share URL" 
                            value={quizCode}
                            onChange={(e) => setQuizCode(e.target.value)}
                          />
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button className="w-full" onClick={handleJoinQuiz}>Start Quiz</Button>
                      </CardFooter>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </section>

        {/* New AI Features Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100">
          <div className=" px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">AI-Powered Quiz Creation</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Leverage the power of AI to create quizzes from images or through natural language conversations.
                </p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 md:gap-8">
                <Card className="w-full max-w-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-center">
                      <Image className="mr-2 h-6 w-6" />
                      Image to Quiz
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500">
                      Upload an image of your study material, and our AI will generate quiz questions based on the content.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" onClick={() => router.push('/create')}>
                      Try Image to Quiz
                    </Button>
                  </CardFooter>
                </Card>
                <Card className="w-full max-w-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-center">
                      <MessageSquare className="mr-2 h-6 w-6" />
                      Chat with AI
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500">
                      Engage in a conversation with our AI to create customized quizzes tailored to your needs.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" onClick={() => router.push('/create')}>
                      Start AI Chat
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className=" px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Featured Quizzes</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Explore our collection of sample quizzes to get started.
                </p>
              </div>
              <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
                {sampleQuizzes.map((quiz) => (
                  <Card key={quiz.id}>
                    <CardHeader>
                      <CardTitle>{quiz.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-500">{quiz.description}</p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full" onClick={() => handleSampleQuiz(quiz)}>
                        <BookOpen className="mr-2 h-4 w-4" />
                        Try This Quiz
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}