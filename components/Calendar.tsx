"use client"

import { useState } from 'react'
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay, isWithinInterval, parseISO, setHours, setMinutes, addHours, addMinutes } from 'date-fns'
import { WeekView } from './WeekView'
import { MonthView } from './MonthView'
import { CreateTaskForm } from './CreateTaskForm'
import { ComposioAI } from './ComposioAI'
import { Task } from '../types/Task'
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Menu } from 'lucide-react'
import { toast } from "@/components/ui/use-toast"
import { useToast } from "@/components/ui/use-toast"
import { cn } from '@/lib/utils'
import dayjs from 'dayjs'
import weekday from 'dayjs/plugin/weekday'
import weekOfYear from 'dayjs/plugin/weekOfYear'

dayjs.extend(weekday)
dayjs.extend(weekOfYear)

export function Calendar() {
  const today = dayjs()
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs>(today)
  const [tasks, setTasks] = useState<Task[]>([])
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const { toast } = useToast()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false)

  const handleDateSelect = (date: Date) => {
    setSelectedDate(dayjs(date))
  }

  const handleCreateOrUpdateTask = (newTask: Task) => {
    setTasks(prevTasks => {
      let updatedTasks = [...prevTasks]
      const existingTaskIndex = updatedTasks.findIndex(task => task.id === newTask.id)
      
      if (existingTaskIndex !== -1) {
        updatedTasks[existingTaskIndex] = newTask
      } else {
        const conflictingTasks = updatedTasks.filter(task => 
          isSameDay(new Date(task.date), new Date(newTask.date)) &&
          isOverlapping(task, newTask)
        )

        if (conflictingTasks.length > 0) {
          const highestPriorityConflict = conflictingTasks.reduce((highest, current) => 
            getPriorityValue(current.priority) > getPriorityValue(highest.priority) ? current : highest
          )

          if (getPriorityValue(newTask.priority) <= getPriorityValue(highestPriorityConflict.priority)) {
            toast({
              title: "Warning",
              description: "A higher or equal priority task already exists at this time.",
              variant: "destructive",
            })
            return updatedTasks // Return without adding the new task
          } else {
            updatedTasks.push(newTask)
            toast({
              title: "Task Added",
              description: "Your higher priority task has been added and will overlap with existing tasks.",
            })
          }
        } else {
          updatedTasks.push(newTask)
          toast({
            title: "Task Added",
            description: "Your new task has been successfully added to the calendar.",
          })
        }
      }

      return updatedTasks
    })
    setEditingTask(null)
  }

  const handleDeleteTask = (taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId))
    toast({
      title: "Task Deleted",
      description: "The task has been removed from your calendar.",
    })
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
  }

  const handleCancelEdit = () => {
    setEditingTask(null)
  }

  const handleJumpToToday = () => {
    setSelectedDate(today)
  }

  const handlePreviousWeek = () => {
    setSelectedDate(prevDate => prevDate.subtract(1, 'week'))
  }

  const handleNextWeek = () => {
    setSelectedDate(prevDate => prevDate.add(1, 'week'))
  }

  const handleAISuggestion = (suggestion: { 
    title: string; 
    description: string; 
    priority: 'low' | 'medium' | 'high';
    duration: string;
    date?: Date;
    startTime?: string;
  }) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: suggestion.title,
      date: suggestion.date || selectedDate.toDate(),
      startTime: suggestion.startTime || format(new Date(), 'HH:mm'),
      priority: suggestion.priority,
      duration: suggestion.duration,
      description: suggestion.description,
    }
    handleCreateOrUpdateTask(newTask)
  }

  const weekStart = selectedDate.startOf('week')
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart.toDate(), i))

  const isCurrentDay = (day: Date) => {
    return day.toISOString().split('T')[0] === format(new Date(), 'yyyy-MM-dd');
  };

  const isToday = (date: dayjs.Dayjs) => {
    return date.format('YYYY-MM-DD') === today.format('YYYY-MM-DD')
  }

  return (
    <div className="flex h-screen w-full flex-col md:flex-row">
      <div className="flex items-center justify-between p-2 md:hidden bg-white border-b">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="rounded-lg bg-gray-100 p-2 hover:bg-gray-200"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleJumpToToday}
          >
            Today
          </Button>
          <button
            onClick={() => setIsTaskFormOpen(!isTaskFormOpen)}
            className="rounded-lg bg-gray-100 p-2 hover:bg-gray-200"
          >
            Add Task
          </button>
        </div>
      </div>

      <div className={cn(
        "fixed inset-0 z-50 bg-white md:relative md:block md:w-64 md:min-w-64",
        "overflow-y-auto",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full",
        "md:translate-x-0"
      )}>
        <div className="sticky top-0 z-10 flex justify-end p-2 md:hidden bg-white border-b">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSidebarOpen(false)}
          >
            Close
          </Button>
        </div>
        <MonthView selectedDate={selectedDate.toDate()} onSelectDate={handleDateSelect} />
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="flex justify-between items-center p-4">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={handlePreviousWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">
              Week of {format(weekStart.toDate(), 'MMMM d, yyyy')}
            </h1>
            <Button variant="ghost" size="icon" onClick={handleNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={handleJumpToToday}>Today</Button>
        </div>
        <WeekView 
          dates={weekDates} 
          tasks={tasks} 
          onUpdateTask={handleCreateOrUpdateTask}
          onDeleteTask={handleDeleteTask}
          onEditTask={handleEditTask}
          selectedDate={selectedDate.toDate()}
        />
      </div>

      <div className={cn(
        "fixed inset-0 z-50 bg-white md:relative md:block md:w-96",
        "overflow-y-auto pb-20 md:pb-0",
        isTaskFormOpen ? "translate-x-0" : "translate-x-full",
        "md:translate-x-0 border-l"
      )}>
        <div className="sticky top-0 z-10 flex justify-end p-2 md:hidden bg-white border-b">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsTaskFormOpen(false)}
          >
            Close
          </Button>
        </div>
        <div className="h-full overflow-y-auto px-6 py-4">
          <CreateTaskForm 
            onCreateTask={handleCreateOrUpdateTask} 
            editTask={editingTask}
            onCancelEdit={handleCancelEdit}
          />
          <div className="mt-12 mb-20 md:mb-8">
            <ComposioAI onSuggestTask={handleAISuggestion} />
          </div>
        </div>
      </div>
    </div>
  )
}

function isOverlapping(task1: Task, task2: Task): boolean {
  const task1Start = parseISO(`2000-01-01T${task1.startTime}`)
  const task1End = addMinutes(task1Start, getDurationInMinutes(task1.duration))
  const task2Start = parseISO(`2000-01-01T${task2.startTime}`)
  const task2End = addMinutes(task2Start, getDurationInMinutes(task2.duration))

  // Check if the tasks are on the same day
  if (!isSameDay(new Date(task1.date), new Date(task2.date))) {
    return false
  }

  // Allow tasks to start exactly when another ends
  if (task1End.getTime() === task2Start.getTime() || 
      task2End.getTime() === task1Start.getTime()) {
    return false
  }

  return task1Start < task2End && task1End > task2Start
}

function getEndTime(task: Task): string {
  const [hours, minutes] = task.startTime.split(':').map(Number)
  const durationInMinutes = getDurationInMinutes(task.duration)
  const endDate = addMinutes(setHours(setMinutes(new Date(), minutes), hours), durationInMinutes)
return format(endDate, 'HH:mm')
}

function getDurationInMinutes(duration: string | undefined): number {
  if (!duration) return 60 // default to 1 hour
  const [value, unit] = duration.split(' ')
  const numericValue = parseFloat(value)
  return unit.startsWith('hour') ? numericValue * 60 : numericValue
}

function getPriorityValue(priority: 'low' | 'medium' | 'high'): number {
  switch (priority) {
    case 'low': return 1
    case 'medium': return 2
    case 'high': return 3
    default: return 0
  }
}

