"use client"

import { useState, useRef } from 'react'
import { format, isSameDay, parseISO, setHours, addMinutes } from 'date-fns'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { Task } from '../types/Task'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from 'lucide-react'
import { MonthYearPicker } from '../components/MonthYearPicker'

interface WeekViewProps {
  dates: Date[]
  tasks: Task[]
  onUpdateTask: (task: Task) => void
  onDeleteTask: (taskId: string) => void
  onEditTask: (task: Task) => void
  selectedDate: Date
  onSelectDate?: (date: Date) => void
}

const HOURS = Array.from({ length: 24 }, (_, i) => (i + 7) % 24)

function getPriorityValue(priority: 'low' | 'medium' | 'high'): number {
  switch (priority) {
    case 'low': return 1
    case 'medium': return 2
    case 'high': return 3
    default: return 0
  }
}

function getDurationInMinutes(duration: string): number {
  if (!duration) return 60 // default to 1 hour
  const [value, unit] = duration.split(' ')
  const numericValue = parseFloat(value)
  return unit.startsWith('hour') ? numericValue * 60 : numericValue
}

function calculateTaskHeight(duration: string): number {
  const minutes = getDurationInMinutes(duration)
  const hours = minutes / 60
  // Each hour slot is 60px tall
  return hours * 60
}

function calculateTaskOffset(startTime: string): number {
  const minutes = parseInt(startTime.split(':')[1])
  return minutes >= 30 ? 30 : 0
}

export function WeekView({ dates, tasks, onUpdateTask, onDeleteTask, onEditTask, selectedDate, onSelectDate }: WeekViewProps) {
  const gridRef = useRef<HTMLDivElement>(null)
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const triggerRef = useRef<HTMLButtonElement>(null)

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const { source, destination, draggableId } = result
    
    const taskToMove = tasks.find(task => task.id === draggableId)
    if (!taskToMove) return

    const [, dateIndex, hourString] = destination.droppableId.split('-')
    const newDate = dates[parseInt(dateIndex)]
    const newHour = parseInt(hourString)
    
    const updatedTask: Task = {
      ...taskToMove,
      date: newDate,
      startTime: `${newHour.toString().padStart(2, '0')}:${taskToMove.startTime.split(':')[1]}`
    }

    onUpdateTask(updatedTask)
  }

  const getTasksForDateAndHour = (date: Date, hour: number) => 
    tasks.filter(task => {
      const taskDate = new Date(task.date)
      const taskHour = parseInt(task.startTime.split(':')[0])
      const taskMinute = parseInt(task.startTime.split(':')[1])
      return isSameDay(taskDate, date) && taskHour === hour
    }).sort((a, b) => {
      // First sort by start time
      const aTime = parseISO(`2000-01-01T${a.startTime}`)
      const bTime = parseISO(`2000-01-01T${b.startTime}`)
      if (aTime.getTime() !== bTime.getTime()) {
        return aTime.getTime() - bTime.getTime()
      }
      // If start times are equal, sort by priority
      return getPriorityValue(b.priority) - getPriorityValue(a.priority)
    })

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex-1 overflow-auto mobile-calendar-container h-[calc(100vh-120px)] md:h-[calc(100vh-100px)]">
        <div className="week-grid min-w-[800px]">
          <div className="flex">
            <div className="w-20 flex-shrink-0" style={{ position: 'relative' }}>
              {isPickerOpen && (
                <MonthYearPicker
                  selectedDate={currentMonth}
                  onSelect={(date) => {
                    setCurrentMonth(date)
                    onSelectDate?.(date)
                  }}
                  onClose={() => setIsPickerOpen(false)}
                  triggerRef={triggerRef}
                />
              )}
            </div>
            {dates.map((date, index) => (
              <div 
                key={index} 
                className={cn(
                  "flex-1 text-center border-t border-gray-200",
                  isSameDay(date, selectedDate) 
                    ? "bg-gray-100" 
                    : "",
                  index === 0 ? "border-l border-gray-200" : "",
                  "border-r border-gray-200"
                )}
              >
                <div className="sticky top-0 bg-inherit z-10 py-2">
                  <h2 className="text-sm font-semibold">{format(date, 'EEE')}</h2>
                  <p className="text-xs text-gray-500">{format(date, 'MMM d')}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="relative" ref={gridRef}>
            {HOURS.map((hour) => (
              <div key={hour} className="flex">
                <div className="w-20 flex-shrink-0 text-right pr-2 py-2 text-xs text-gray-500">
                  {format(setHours(new Date(), hour), 'h a')}
                </div>
                {dates.map((date, dateIndex) => (
                  <Droppable key={`${dateIndex}-${hour}`} droppableId={`date-${dateIndex}-${hour}`}>
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={cn(
                          "flex-1 h-[60px] relative border-b border-gray-200",
                          isSameDay(date, selectedDate)
                            ? "bg-gray-100" 
                            : "bg-white",
                          dateIndex === 0 ? "border-l border-gray-200" : "",
                          "border-r border-gray-200"
                        )}
                      >
                        {getTasksForDateAndHour(date, hour).map((task, taskIndex, tasksArray) => (
                          <Draggable key={task.id} draggableId={task.id} index={taskIndex}>
                            {(provided) => (
                              <>
                                {/* Background stack of cards for lower priority tasks */}
                                {tasksArray.slice(taskIndex + 1).map((lowerTask, stackIndex) => (
                                  <div 
                                    key={`${task.id}-stack-${stackIndex}`}
                                    className={cn(
                                      "absolute top-0 left-0 right-0 m-1 rounded",
                                      lowerTask.priority === 'high' ? 'bg-red-100' :
                                      lowerTask.priority === 'medium' ? 'bg-yellow-100' :
                                      'bg-green-100'
                                    )}
                                    style={{
                                      height: `${calculateTaskHeight(task.duration)}px`,
                                      transform: `translateY(${parseInt(task.startTime.split(':')[1]) >= 30 ? '50%' : '0'}) translateY(${(stackIndex + 1) * 4}px)`,
                                      zIndex: tasksArray.length - taskIndex - stackIndex - 1,
                                    }}
                                  />
                                ))}
                                {/* Main task card */}
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={cn(
                                    "absolute left-0 right-0 mx-1 p-1.5 text-xs rounded shadow-md group overflow-hidden",
                                    "border border-gray-300",
                                    task.priority === 'high' ? 'bg-red-200' :
                                    task.priority === 'medium' ? 'bg-yellow-200' :
                                    'bg-green-200',
                                  )}
                                  style={{
                                    height: `${calculateTaskHeight(task.duration)}px`,
                                    top: `${calculateTaskOffset(task.startTime)}px`,
                                    zIndex: tasksArray.length + 1 - taskIndex,
                                    ...provided.draggableProps.style
                                  }}
                                >
                                  {/* Priority badge - now at top right and hides on hover */}
                                  <span 
                                    className={cn(
                                      "absolute top-1 right-1 text-[9px] font-medium px-1 rounded bg-opacity-50 bg-gray-200",
                                      "group-hover:hidden"
                                    )}
                                  >
                                    {task.priority}
                                  </span>

                                  {/* Different layouts for long vs short tasks */}
                                  {getDurationInMinutes(task.duration) >= 45 ? (
                                    <>
                                      <h3 className="font-semibold truncate text-[11px] pr-14" title={task.title}>
                                        {task.title}
                                      </h3>
                                      <p className="truncate text-[10px] text-gray-600">
                                        {format(new Date(task.date), 'EEE, MMM d')}
                                      </p>
                                      <p className="truncate text-[10px] text-gray-600">
                                        {format(parseISO(`2000-01-01T${task.startTime}`), 'h:mm a')}
                                        {" - "}
                                        {format(addMinutes(parseISO(`2000-01-01T${task.startTime}`), getDurationInMinutes(task.duration)), 'h:mm a')}
                                      </p>
                                    </>
                                  ) : (
                                    // Updated 30-minute task view with inline time
                                    <h3 className="font-semibold truncate text-[11px] pr-14" title={task.title}>
                                      {task.title}
                                      <span className="font-normal text-gray-600">
                                        {" - "}
                                        {format(parseISO(`2000-01-01T${task.startTime}`), 'h:mm a')}
                                      </span>
                                    </h3>
                                  )}

                                  {/* Edit/Delete buttons - increased size and padding */}
                                  <div className="absolute top-0.5 right-0.5 hidden group-hover:flex space-x-1">
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-5 w-5 p-0.5 hover:bg-black/10"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        onEditTask(task)
                                      }}
                                    >
                                      <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-5 w-5 p-0.5 hover:bg-black/10"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        onDeleteTask(task.id)
                                      }}
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                </div>
                              </>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </DragDropContext>
  )
}

