"use client"

import { useState, useEffect } from 'react'
import { format, parse } from 'date-fns'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Task } from '../types/Task'

const TIME_OPTIONS = Array.from({ length: 34 }, (_, i) => {
  const hours = Math.floor(i / 2) + 7
  const minutes = i % 2 === 0 ? '00' : '30'
  return `${hours.toString().padStart(2, '0')}:${minutes}`
})

const DURATION_OPTIONS = ['30 min', '1 hour', '1.5 hours', '2 hours', '2.5 hours', '3 hours']

interface CreateTaskFormProps {
  onCreateTask: (task: Task) => void
  editTask?: Task | null
  onCancelEdit?: () => void
}

export function CreateTaskForm({ onCreateTask, editTask, onCancelEdit }: CreateTaskFormProps) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('07:00')
  const [duration, setDuration] = useState('1 hour')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (editTask) {
      setTitle(editTask.title)
      setDate(format(new Date(editTask.date), 'yyyy-MM-dd'))
      setStartTime(editTask.startTime)
      setDuration(editTask.duration || '1 hour')
      setPriority(editTask.priority)
      setDescription(editTask.description || '')
    } else {
      resetForm()
    }
  }, [editTask])

  const resetForm = () => {
    setTitle('')
    setDate(format(new Date(), 'yyyy-MM-dd'))
    setStartTime('07:00')
    setDuration('1 hour')
    setPriority('medium')
    setDescription('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const [year, month, day] = date.split('-').map(Number)
    const taskDate = new Date(year, month - 1, day)
    const [hours, minutes] = startTime.split(':').map(Number)
    taskDate.setHours(hours, minutes, 0, 0)

    const newTask: Task = {
      id: editTask?.id || Date.now().toString(),
      title,
      date: taskDate,
      startTime,
      duration,
      priority,
      description,
    }
    onCreateTask(newTask)
    if (!editTask) {
      resetForm()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Task Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="startTime">Start Time</Label>
        <Select value={startTime} onValueChange={setStartTime}>
          <SelectTrigger>
            <SelectValue placeholder="Select start time" />
          </SelectTrigger>
          <SelectContent className="h-[200px]">
            {TIME_OPTIONS.map((time) => (
              <SelectItem key={time} value={time}>
                {format(parse(time, 'HH:mm', new Date()), 'h:mm a')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="duration">Duration</Label>
        <Select value={duration} onValueChange={setDuration}>
          <SelectTrigger>
            <SelectValue placeholder="Select duration" />
          </SelectTrigger>
          <SelectContent>
            {DURATION_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>{option}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="priority">Priority</Label>
        <Select value={priority} onValueChange={(value: 'low' | 'medium' | 'high') => setPriority(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter task description"
        />
      </div>
      <div className="flex justify-between">
        <Button type="submit">{editTask ? 'Update Task' : 'Create Task'}</Button>
        {editTask && (
          <Button type="button" variant="outline" onClick={onCancelEdit}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}

