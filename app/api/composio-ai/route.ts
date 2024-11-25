import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json()
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    // This is a mock response. In a real implementation, you would call the Composio API here.
    const mockSuggestions = [
      {
        title: "Team Communication Workshop",
        description: "Organize a workshop to improve team communication skills",
        priority: "high",
        duration: "2 hours",
        suggestedDate: new Date().toISOString().split('T')[0],
        suggestedTime: "14:00"
      },
      {
        title: "Daily Stand-up Meeting",
        description: "Implement daily stand-up meetings to enhance team coordination",
        priority: "medium",
        duration: "30 min",
        suggestedTime: "09:30"
      }
    ]

    return NextResponse.json(mockSuggestions)

  } catch (error) {
    console.error('Error in Composio AI route:', error)
    return NextResponse.json(
      { error: 'Failed to process AI request' },
      { status: 500 }
    )
  }
}

