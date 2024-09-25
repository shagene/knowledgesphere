'use client'

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, PlusCircle, Save } from "lucide-react"
import { useSearchParams } from 'next/navigation'

export function HomePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [quizName, setQuizName] = useState(searchParams.get('name') || "")
  const [quizDescription, setQuizDescription] = useState(searchParams.get('description') || "")

  const handleCreateQuiz = (e: React.FormEvent) => {
    e.preventDefault()
    const queryParams = new URLSearchParams({
      name: quizName,
      description: quizDescription
    }).toString()
    router.push(`/create?${queryParams}`)
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className=" px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Welcome to KnowledgeSphere
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Create, take, and save interactive quizzes. Perfect for students and educators.
                </p>
              </div>
              <div className="w-full max-w-sm space-y-2">
                <form className="flex space-x-2">
                  <Input className="max-w-lg flex-1" placeholder="Enter a quiz code" type="text" />
                  <Button type="submit">Join Quiz</Button>
                </form>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Don't have a code? Try creating your own quiz!
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
                          <Label htmlFor="code">Quiz Code</Label>
                          <Input id="code" placeholder="Enter quiz code" />
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button className="w-full">Start Quiz</Button>
                      </CardFooter>
                    </Card>
                  </TabsContent>
                </Tabs>
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
                  Explore our collection of popular quizzes created by our community.
                </p>
              </div>
              <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Math Quiz</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500">Test your math skills with this interactive quiz.</p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      <Save className="mr-2 h-4 w-4" />
                      Save for Later
                    </Button>
                  </CardFooter>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Science Quiz</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500">Explore scientific concepts with this engaging quiz.</p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      <Save className="mr-2 h-4 w-4" />
                      Save for Later
                    </Button>
                  </CardFooter>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>History Quiz</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500">Journey through time with this history quiz.</p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      <Save className="mr-2 h-4 w-4" />
                      Save for Later
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}