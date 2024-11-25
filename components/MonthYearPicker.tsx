import { format, setYear, setMonth, getYear, getMonth } from 'date-fns'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, RefObject } from 'react'

interface MonthYearPickerProps {
  selectedDate: Date
  onSelect: (date: Date) => void
  onClose: () => void
  triggerRef: RefObject<HTMLButtonElement>
}

const months = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
]

export function MonthYearPicker({ selectedDate, onSelect, onClose, triggerRef }: MonthYearPickerProps) {
  const [displayYear, setDisplayYear] = useState(getYear(selectedDate))

  const handleYearChange = (increment: number) => {
    setDisplayYear(prev => prev + increment)
  }

  const handleMonthSelect = (monthIndex: number) => {
    const newDate = setMonth(setYear(selectedDate, displayYear), monthIndex)
    onSelect(newDate)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24">
      <div className="bg-background border rounded-lg shadow-lg p-4 w-[300px]">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => handleYearChange(-1)}>
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="font-semibold">{displayYear}</span>
          <button onClick={() => handleYearChange(1)}>
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          {months.map((month, index) => (
            <button
              key={month}
              className={cn(
                "p-2 rounded-md hover:bg-secondary/80 transition-colors",
                getMonth(selectedDate) === index && 
                getYear(selectedDate) === displayYear && 
                'bg-secondary'
              )}
              onClick={() => handleMonthSelect(index)}
            >
              {month}
            </button>
          ))}
        </div>
        
        <div className="mt-4 flex justify-end gap-2">
          <button
            className="px-4 py-2 rounded-md bg-secondary hover:bg-secondary/80"
            onClick={() => {
              onSelect(new Date())
              onClose()
            }}
          >
            Today
          </button>
          <button
            className="px-4 py-2 rounded-md border hover:bg-secondary/80"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
      
      <div 
        className="fixed inset-0 bg-black/50 -z-10" 
        onClick={onClose}
      />
    </div>
  )
} 