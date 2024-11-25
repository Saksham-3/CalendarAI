export interface Task {
  id: string
  title: string
  date: Date
  startTime: string
  priority: 'low' | 'medium' | 'high'
  duration: string
  description?: string
}

