"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { getTaskSuggestions } from '@/utils/composio-client'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Brain } from 'lucide-react'

interface ComposioAIProps {
  onSuggestTask: (task: {
    title: string
    description: string
    priority: 'low' | 'medium' | 'high'
    duration: string
    date?: Date
    startTime?: string
  }) => void
}

export function ComposioAI({ onSuggestTask }: ComposioAIProps) {
  const [prompt, setPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<any[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const taskSuggestions = await getTaskSuggestions(prompt)
      setSuggestions(taskSuggestions)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get AI suggestions. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAcceptSuggestion = (suggestion: any) => {
    onSuggestTask({
      title: suggestion.title,
      description: suggestion.description,
      priority: suggestion.priority,
      duration: suggestion.duration,
      date: new Date(), // Set to current date
      startTime: suggestion.suggestedTime || '09:00', // Default to 9:00 AM if no time is suggested
    })
    setSuggestions([])
    setPrompt('')
    toast({
      title: "Task Created",
      description: "AI suggestion has been added to your calendar.",
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Brain className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold">Composio AI Assistant</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="ai-prompt">Ask AI for task suggestions</Label>
          <Textarea
            id="ai-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="E.g., Suggest a task for improving team communication"
            className="mt-1"
          />
        </div>
        <Button type="submit" disabled={isLoading || !prompt} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Getting Suggestions...
            </>
          ) : (
            'Get AI Suggestions'
          )}
        </Button>
      </form>

      {suggestions.length > 0 && (
        <div className="space-y-4">
          {suggestions.map((suggestion, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{suggestion.title}</CardTitle>
                <CardDescription>{suggestion.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={
                    suggestion.priority === 'high' ? 'destructive' :
                    suggestion.priority === 'medium' ? 'default' :
                    'secondary'
                  }>
                    {suggestion.priority} priority
                  </Badge>
                  <Badge variant="outline">{suggestion.duration}</Badge>
                  {suggestion.suggestedTime && (
                    <Badge variant="outline">at {suggestion.suggestedTime}</Badge>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => handleAcceptSuggestion(suggestion)} className="w-full">
                  Add to Calendar
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

