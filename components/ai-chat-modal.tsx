import React, { useState, useEffect, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2 } from "lucide-react"

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface AIChatModalProps {
  isOpen: boolean
  onClose: () => void
  initialData: { question: string; answer: string }[]
  onAccept: (data: { question: string; answer: string }[]) => void
}

const AIChatModal: React.FC<AIChatModalProps> = ({ isOpen, onClose, initialData, onAccept }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && initialData.length > 0) {
      const initialMessage = `Here are the extracted question-answer pairs:\n\n${initialData.map((pair, index) => 
        `${index + 1}. Question: ${pair.question}\n   Answer: ${pair.answer}`
      ).join('\n\n')}\n\nHow would you like to modify these?`
      setMessages([{ role: 'assistant', content: initialMessage }])
    }
  }, [isOpen, initialData])

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = async () => {
    if (input.trim() === '') return

    const userMessage = { role: 'user' as const, content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      })

      if (!response.ok) throw new Error('Failed to get response')

      const data = await response.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }])
    } catch (error) {
      console.error('Error in chat:', error)
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleAccept = () => {
    const lastAssistantMessage = messages.filter(m => m.role === 'assistant').pop()
    if (lastAssistantMessage) {
      const pairs = lastAssistantMessage.content.split('\n\n')
        .filter(pair => pair.includes('Question:') && pair.includes('Answer:'))
        .map(pair => {
          const [questionLine, answerLine] = pair.split('\n').map(line => line.trim())
          const question = questionLine.replace(/^\d+\.\s*Question:\s*/, '')
          const answer = answerLine.replace(/Answer:\s*/, '')
          return { question, answer }
        })
      onAccept(pairs)
    }
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Chat with AI</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[300px] pr-4" ref={scrollAreaRef}>
          {messages.map((message, index) => (
            <div key={index} className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
              <div className={`inline-block p-2 rounded-lg ${message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                {message.content}
              </div>
            </div>
          ))}
        </ScrollArea>
        <div className="flex items-center mt-4">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <Button onClick={handleSendMessage} disabled={isLoading} className="ml-2">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send'}
          </Button>
        </div>
        <DialogFooter>
          <Button onClick={handleAccept}>Accept and Populate Quiz</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default AIChatModal