'use client'

import { useState } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, addMonths, subMonths } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from '@/components/ui/CoolIcons'
import { useRouter } from 'next/navigation'

export default function DashboardCalendar({ citasMes }: { citasMes: string[] }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const router = useRouter()

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  
  // To get the full grid including previous/next month filler days
  const startDate = new Date(monthStart)
  startDate.setDate(startDate.getDate() - (startDate.getDay() === 0 ? 6 : startDate.getDay() - 1))
  
  const endDate = new Date(monthEnd)
  if (endDate.getDay() !== 0) {
    endDate.setDate(endDate.getDate() + (7 - endDate.getDay()))
  }

  const days = eachDayOfInterval({ start: startDate, end: endDate })

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))

  const handleDayClick = (date: Date) => {
    // Navigate to citas filtered by date
    router.push(`/admin/citas?fecha=${format(date, 'yyyy-MM-dd')}`)
  }

  return (
    <div className="bg-[#0a0a0a] border border-[rgba(255,255,255,0.06)] rounded-xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.5)] w-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-serif italic text-[var(--blue)] text-lg">
          {format(currentDate, 'MMMM', { locale: es }).replace(/^\w/, c => c.toUpperCase())}{' '}
          <span className="font-sans text-[var(--fg)] not-italic text-base font-medium">{format(currentDate, 'yyyy')}</span>
        </h3>
        <div className="flex gap-1">
          <button onClick={prevMonth} className="w-7 h-7 rounded flex items-center justify-center border border-[var(--line-soft)] text-[var(--fg-dim)] hover:text-[var(--fg)] hover:border-[var(--blue)] transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={nextMonth} className="w-7 h-7 rounded flex items-center justify-center border border-[var(--line-soft)] text-[var(--fg-dim)] hover:text-[var(--fg)] hover:border-[var(--blue)] transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'].map((day) => (
          <div key={day} className="font-mono text-[0.65rem] tracking-[0.18em] uppercase text-[var(--fg-dim)] py-1">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, dayIdx) => {
          const isCurrentMonth = isSameMonth(day, monthStart)
          const isDayToday = isToday(day)
          // format local date to ISO yyyy-MM-dd for comparison
          const dayStr = format(day, 'yyyy-MM-dd')
          const hasEvent = citasMes.includes(dayStr)

          return (
            <button
              key={day.toString()}
              onClick={() => handleDayClick(day)}
              className={`
                relative aspect-square flex flex-col items-center justify-center rounded-lg text-xs transition-colors
                ${!isCurrentMonth ? 'text-[var(--fg-dim-2)] opacity-50' : 'text-[var(--fg-dim)] hover:bg-[var(--line-soft)] hover:text-[var(--fg)]'}
                ${isDayToday ? 'border border-[var(--blue)] text-[var(--fg)] font-semibold' : ''}
              `}
            >
              {format(day, 'd')}
              {hasEvent && (
                <span className="absolute bottom-1.5 w-1 h-1 rounded-full bg-[var(--blue)]" />
              )}
            </button>
          )
        })}
      </div>
      
      <div className="mt-4 text-center font-mono text-[0.62rem] tracking-[0.22em] uppercase text-[var(--fg-dim)]">
        Calendario de Consultas
      </div>
    </div>
  )
}
