import { useState, useEffect, useRef } from 'react'
import { format, setYear, setMonth } from 'date-fns'
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from "@/lib/utils"

interface MonthYearPickerProps {
  selectedDate: Date
  onSelect: (date: Date) => void
  onClose: () => void
  triggerRef: React.RefObject<HTMLButtonElement>
}

export function MonthYearPicker({ selectedDate, onSelect, onClose, triggerRef }: MonthYearPickerProps) {
  const [viewYear, setViewYear] = useState(selectedDate.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(selectedDate.getMonth())
  const containerRef = useRef<HTMLDivElement>(null)

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr',
    'May', 'Jun', 'Jul', 'Aug',
    'Sep', 'Oct', 'Nov', 'Dec'
  ]

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  useEffect(() => {
    if (containerRef.current && triggerRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect()
      containerRef.current.style.top = `${triggerRect.bottom + window.scrollY + 4}px`
      containerRef.current.style.left = `${triggerRect.left + window.scrollX}px`
    }
  }, [triggerRef])

  const handleYearChange = (increment: number) => {
    setViewYear(prev => prev + increment)
  }

  const handleSelect = (month: number) => {
    const newDate = setMonth(setYear(selectedDate, viewYear), month)
    onSelect(newDate)
    onClose()
  }

  return (
    <div 
      ref={containerRef}
      className="fixed z-50 bg-white rounded-xl shadow-lg border border-gray-100 p-3 w-[240px]"
      style={{
        transform: 'translateY(8px)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
      }}
    >
      {/* Year selector */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 hover:bg-gray-100 rounded-full"
          onClick={() => handleYearChange(-1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-semibold">{viewYear}</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 hover:bg-gray-100 rounded-full"
          onClick={() => handleYearChange(1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Month grid */}
      <div className="grid grid-cols-4 gap-1 mb-4">
        {months.map((month, index) => (
          <Button
            key={month}
            variant="ghost"
            className={cn(
              "h-8 rounded-lg text-xs font-medium hover:bg-gray-100 p-0",
              index === selectedMonth && viewYear === selectedDate.getFullYear()
                ? "bg-gray-900 text-white hover:bg-gray-800"
                : "text-gray-600"
            )}
            onClick={() => handleSelect(index)}
          >
            {month}
          </Button>
        ))}
      </div>

      {/* Bottom buttons */}
      <div className="flex justify-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs rounded-full"
          onClick={() => handleSelect(new Date().getMonth())}
        >
          Today
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs rounded-full"
          onClick={onClose}
        >
          Cancel
        </Button>
      </div>
    </div>
  )
} 