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

interface AIQuizGeneratorModalProps {
  isOpen: boolean
  onClose: () => void
  onAccept: (data: { question: string; answer: string }[]) => void
}

const AIQuizGeneratorModal: React.FC<AIQuizGeneratorModalProps> = ({ isOpen, onClose, onAccept }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      setMessages([{ role: 'assistant', content: "Hello! I'm here to help you generate quiz questions. Let's start by discussing the topic of your quiz. What subject would you like to create questions about?" }])
    }
  }, [isOpen])

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const formatAnswers = (content: string) => {
    const lines = content.split('\n');
    let formattedContent = '';

    for (let line of lines) {
      if (line.match(/^\d+\.\s*Question:/)) {
        const question = line.replace(/^\d+\.\s*Question:\s*/, '').trim();
        const answer = generateAnswer(question);
        const options = generateOptions(answer);
        
        formattedContent += `${line}\n`;
        formattedContent += 'Options:\n';
        options.forEach((option, index) => {
          formattedContent += `${String.fromCharCode(97 + index)}) ${option}\n`;
        });
        formattedContent += `Answer: ${String.fromCharCode(97 + options.indexOf(answer))}\n\n`;
      }
    }

    return formattedContent;
  };

  const generateAnswer = (question: string): string => {
    // Simple logic to generate answers based on the question
    if (question.includes("largest ocean")) return "Pacific Ocean";
    if (question.includes("long body and a sharp nose")) return "Swordfish";
    if (question.includes("highest part of a wave")) return "Crest";
    if (question.includes("hard shell and eight arms")) return "Octopus";
    if (question.includes("Great Barrier Reef")) return "Pacific Ocean";
    return "Unknown"; // Default answer if no match is found
  };

  const generateOptions = (correctAnswer: string) => {
    const options = [correctAnswer];
    while (options.length < 4) {
      const fakeAnswer = generateFakeAnswer(correctAnswer, options);
      if (!options.includes(fakeAnswer)) {
        options.push(fakeAnswer);
      }
    }
    return shuffleArray(options);
  };

  const generateFakeAnswer = (correctAnswer: string, existingOptions: string[]) => {
    const oceanRelatedWords = [
      'Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean', 'Southern Ocean',
      'Shark', 'Whale', 'Dolphin', 'Jellyfish',
      'Trough', 'Base', 'Whitecap', 'Breaker',
      'Squid', 'Cuttlefish', 'Nautilus', 'Crab',
      'Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean', 'Caribbean Sea'
    ];
    
    let fakeAnswer;
    do {
      fakeAnswer = oceanRelatedWords[Math.floor(Math.random() * oceanRelatedWords.length)];
    } while (existingOptions.includes(fakeAnswer) || fakeAnswer === correctAnswer);
    
    return fakeAnswer;
  };

  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const handleSendMessage = async () => {
    if (input.trim() === '') return;

    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      const formattedContent = formatAnswers(data.message);
      setMessages(prev => [...prev, { role: 'assistant', content: formattedContent }]);
    } catch (error) {
      console.error('Error in chat:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = () => {
    const pairs = messages
      .filter(m => m.role === 'assistant')
      .flatMap(m => {
        const content = m.content;
        const regex = /(\d+\.\s*Question:[\s\S]*?(?=\n\d+\.\s*Question:|$))/g;
        const matches = content.match(regex) || [];
        
        return matches.map(match => {
          const [questionPart, ...answerParts] = match.split('\nAnswer:');
          const question = questionPart.replace(/^\d+\.\s*Question:\s*/i, '').trim();
          const answer = answerParts.join('\nAnswer:').trim();
          return { question, answer };
        });
      })
      .filter(pair => pair.question && pair.answer); // Ensure both question and answer exist

    onAccept(pairs);
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Generate Quiz with AI</DialogTitle>
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

export default AIQuizGeneratorModal