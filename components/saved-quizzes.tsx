"use client"

import { useQuery } from '@tanstack/react-query'
import { useQuizStore } from '@/store/quizStore'
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { BookOpen, Edit, Eye, Search, Share2, Trash2, Download, Upload } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { Quiz } from "@/types/quiz"

const SavedQuizzesComponent: React.FC = () => {
  const router = useRouter()
  const { deleteQuiz, loadQuizzes } = useQuizStore()
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [shareLink, setShareLink] = useState("")

  const { data: quizzes, isLoading, error } = useQuery<Quiz[], Error>({
    queryKey: ['quizzes'],
    queryFn: loadQuizzes,
    staleTime: Infinity, // Prevents automatic refetching
  })

  const handleShare = async (quiz: Quiz) => {
    try {
      const response = await fetch('/api/share-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quiz),
      });
      const { shareLink } = await response.json();
      setShareLink(shareLink);
      setShareDialogOpen(true);
    } catch (error) {
      toast({
        title: "Error sharing quiz",
        description: "There was an error generating the share link. Please try again.",
        variant: "destructive",
      });
    }
  }

  const handleExport = (quiz: Quiz) => {
    const jsonString = JSON.stringify(quiz);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${quiz.title.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({
      title: "Quiz exported",
      description: "The quiz has been exported as a JSON file.",
    });
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const quiz = JSON.parse(e.target?.result as string);
          // Add validation here to ensure the JSON is in the correct format
          useQuizStore.getState().addQuiz(quiz);
          toast({
            title: "Quiz imported",
            description: "The quiz has been successfully imported.",
          });
        } catch (error) {
          toast({
            title: "Error importing quiz",
            description: "There was an error importing the quiz. Please ensure the file is valid.",
            variant: "destructive",
          });
        }
      };
      reader.readAsText(file);
    }
  }

  const handleView = (quizId: string) => {
    router.push(`/take/${quizId}`)
  }

  const handleDelete = (quizId: string) => {
    deleteQuiz(quizId)
    toast({
      title: "Quiz deleted",
      description: "The quiz has been successfully removed from your saved quizzes.",
    })
  }

  const handleEdit = (quiz: Quiz) => {
    const queryParams = new URLSearchParams({
      id: quiz.id,
      name: quiz.title,
      description: quiz.description,
      questions: JSON.stringify(quiz.questions)
    }).toString();
    router.push(`/create?${queryParams}`);
  };

  const filteredQuizzes = quizzes?.filter(quiz => 
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quiz.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>An error occurred: {error.message}</div>

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Saved Quizzes</h1>
          <div className="mb-6 flex justify-between items-center">
            <div className="relative flex-grow mr-4">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input 
                placeholder="Search quizzes" 
                className="pl-8" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <label htmlFor="import-quiz" className="cursor-pointer">
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Import Quiz
              </Button>
              <input
                id="import-quiz"
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImport}
              />
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredQuizzes.map((quiz) => (
              <Card key={quiz.id}>
                <CardHeader>
                  <CardTitle>{quiz.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">Questions: {quiz.questionCount}</p>
                  <p className="text-sm text-gray-500">Last edited: {new Date(quiz.lastEdited).toLocaleDateString()}</p>
                </CardContent>
                <CardFooter className="flex flex-wrap justify-between gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleView(quiz.id)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(quiz)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleShare(quiz)}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleExport(quiz)}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(quiz.id)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <AlertDialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Share Quiz</AlertDialogTitle>
            <AlertDialogDescription>
              Use this link to share the quiz. The link will expire after 24 hours.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex items-center space-x-2">
            <Input
              readOnly
              value={shareLink}
              className="flex-1"
            />
            <Button onClick={() => {
              navigator.clipboard.writeText(shareLink);
              toast({
                title: "Link copied",
                description: "The share link has been copied to your clipboard.",
              });
            }}>Copy</Button>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default SavedQuizzesComponent