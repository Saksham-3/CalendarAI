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
      className={cn(
        "absolute bg-white rounded-lg shadow-lg border z-[100]",
        // Mobile positioning
        "md:left-0 md:top-full md:mt-1",
        // On mobile, center in screen
        "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:transform-none",
        "w-[90vw] md:w-auto md:min-w-[240px]", // Responsive width
        "max-h-[80vh] md:max-h-none overflow-auto" // Handle overflow on mobile
      )}
    >
      <div className="p-4 space-y-4">
        {/* Add mobile close button */}
        <div className="flex justify-between items-center md:hidden">
          <h2 className="font-semibold">Select Date</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
        
        {/* Existing picker content */}
        <div className="grid grid-cols-3 gap-2 text-center">
          {/* ... months ... */}
        </div>
        
        <div className="grid grid-cols-4 gap-2 text-center">
          {/* ... years ... */}
        </div>
        
        <div className="flex justify-between mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onSelect(new Date())
              onClose()
            }}
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
} 