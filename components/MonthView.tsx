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
    // Update current month when selected date changes
    if (!isSameMonth(currentMonth, selectedDate)) {
      setCurrentMonth(selectedDate)
    }
  }, [selectedDate])

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)

  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const handlePrevMonth = () => {
    setCurrentMonth(prevMonth => subMonths(prevMonth, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(prevMonth => addMonths(prevMonth, 1))
  }

  const handleDateSelect = (date: Date) => {
    onSelectDate(date)
    if (!isSameMonth(date, currentMonth)) {
      setCurrentMonth(date)
    }
  }

  return (
    <div className="relative p-4">
      <div className="flex justify-between items-center mb-4">
        <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="inline-block">
          <Button
            ref={triggerRef}
            variant="ghost"
            className="text-lg font-semibold hover:bg-transparent px-2 whitespace-nowrap [&:not(:hover)]:text-[clamp(0.875rem,2.5vw,1.125rem)]"
            onClick={() => setIsPickerOpen(true)}
          >
            {format(currentMonth, 'MMMM yyyy')}
          </Button>
        </div>

        <Button variant="ghost" size="icon" onClick={handleNextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      {isPickerOpen && (
        <>
          <div className="fixed inset-0 bg-transparent" onClick={() => setIsPickerOpen(false)} />
          <MonthYearPicker
            selectedDate={currentMonth}
            onSelect={(date) => {
              setCurrentMonth(date)
              onSelectDate(date)
            }}
            onClose={() => setIsPickerOpen(false)}
            triggerRef={triggerRef}
          />
        </>
      )}
      
      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center font-semibold text-xs">{day}</div>
        ))}
        {calendarDays.map(day => (
          <button
            key={day.toString()}
            onClick={() => handleDateSelect(day)}
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

