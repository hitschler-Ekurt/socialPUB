"use client"

import React from "react"
import { useCalendarStore } from "@/stores/calendar-store"
import {
  getMonthDays,
  isSameMonth,
  isToday,
  format,
} from "@/lib/calendar-utils"
import { CalendarDayCell } from "./calendar-day-cell"
import type { CalendarPost } from "@/hooks/use-calendar-posts"

type CalendarMonthViewProps = {
  readonly groupedPosts: Map<string, CalendarPost[]>
  readonly onPostClick?: (postId: string) => void
  readonly onDayClick?: (date: Date) => void
}

const DAY_HEADERS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"]

function CalendarMonthViewInner({
  groupedPosts,
  onPostClick,
  onDayClick,
}: CalendarMonthViewProps) {
  const currentDate = useCalendarStore((s) => s.currentDate)
  const weeks = getMonthDays(currentDate)

  return (
    <div className="flex-1 overflow-auto">
      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 border-b border-neutral-200">
        {DAY_HEADERS.map((day) => (
          <div
            key={day}
            className="border-r border-neutral-200 px-2 py-1.5 text-center text-xs font-medium text-neutral-500"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Week rows */}
      {weeks.map((week, weekIdx) => (
        <div key={weekIdx} className="grid grid-cols-7">
          {week.map((day) => {
            const dayKey = format(day, "yyyy-MM-dd")
            const dayPosts = (groupedPosts.get(dayKey) ?? []) as CalendarPost[]

            return (
              <CalendarDayCell
                key={dayKey}
                date={day}
                posts={dayPosts}
                isCurrentMonth={isSameMonth(day, currentDate)}
                isToday={isToday(day)}
                onClick={onDayClick}
                onPostClick={onPostClick}
              />
            )
          })}
        </div>
      ))}
    </div>
  )
}

export const CalendarMonthView = React.memo(CalendarMonthViewInner)
