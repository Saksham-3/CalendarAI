interface TaskSuggestion {
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  duration: string
  suggestedDate?: string
  suggestedTime?: string
}

export async function getTaskSuggestions(prompt: string): Promise<TaskSuggestion[]> {
  try {
    const response = await fetch('/api/composio-ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error('Failed to get task suggestions');
    }

    const suggestions = await response.json();
    return Array.isArray(suggestions) ? suggestions : [suggestions];
  } catch (error) {
    console.error('Error getting task suggestions:', error);
    throw new Error('Failed to get task suggestions');
  }
}

