"use client"

import { useState, useEffect, useRef } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns'
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { MonthYearPicker } from './MonthYearPicker'

interface MonthViewProps {
  selectedDate: Date
  onSelectDate: (date: Date) => void
}

export function MonthView({ selectedDate, onSelectDate }: MonthViewProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(selectedDate)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isSameMonth(currentMonth, selectedDate)) {
      setCurrentMonth(selectedDate)
    }
  }, [selectedDate])

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarDays = eachDayOfInterval({ 
    start: startOfWeek(monthStart), 
    end: endOfWeek(monthEnd) 
  })

  return (
    <div className="relative p-4">
      <div className="flex justify-between items-center mb-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setCurrentMonth(prev => subMonths(prev, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <Button
          ref={triggerRef}
          variant="ghost"
          className="text-lg font-semibold hover:bg-transparent px-2"
          onClick={() => setIsPickerOpen(true)}
        >
          {format(currentMonth, 'MMMM yyyy')}
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setCurrentMonth(prev => addMonths(prev, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {isPickerOpen && (
        <MonthYearPicker
          selectedDate={currentMonth}
          onSelect={(date) => {
            setCurrentMonth(date)
            onSelectDate(date)
            setIsPickerOpen(false)
          }}
          onClose={() => setIsPickerOpen(false)}
          triggerRef={triggerRef}
        />
      )}
      
      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center font-semibold text-xs">{day}</div>
        ))}
        {calendarDays.map(day => (
          <button
            key={day.toString()}
            onClick={() => {
              onSelectDate(day)
              if (!isSameMonth(day, currentMonth)) setCurrentMonth(day)
            }}
            className="p-2 text-center text-sm relative"
          >
            <div className={`w-8 h-8 flex items-center justify-center mx-auto ${
              !isSameMonth(day, currentMonth) ? 'text-gray-300' :
              isSameDay(day, selectedDate) ? 'bg-gray-200 rounded-full' : ''
            }`}>
              {format(day, 'd')}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

