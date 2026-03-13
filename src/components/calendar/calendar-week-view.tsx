"use client"

import React from "react"
import { useCalendarStore } from "@/stores/calendar-store"
import { useDroppable } from "@dnd-kit/core"
import {
  getWeekHours,
  isToday,
  isSameDay,
  format,
  parseISO,
} from "@/lib/calendar-utils"
import { CalendarPostCard } from "./calendar-post-card"
import { cn } from "@/lib/utils"
import type { CalendarPost } from "@/hooks/use-calendar-posts"

type CalendarWeekViewProps = {
  readonly posts: CalendarPost[]
  readonly onPostClick?: (postId: string) => void
}

function getPostHour(post: CalendarPost): number | null {
  if (!post.scheduled_at) return null
  return parseISO(post.scheduled_at).getHours()
}

function DroppableSlot({
  id,
  date,
  children,
  className,
}: {
  readonly id: string
  readonly date: Date
  readonly children: React.ReactNode
  readonly className?: string
}) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { date },
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        className,
        isOver && "bg-accent/50 border-dashed border-primary"
      )}
    >
      {children}
    </div>
  )
}

function CalendarWeekViewInner({ posts, onPostClick }: CalendarWeekViewProps) {
  const currentDate = useCalendarStore((s) => s.currentDate)
  const weekData = getWeekHours(currentDate)

  // Group posts by day
  const postsByDay = new Map<string, CalendarPost[]>()
  for (const post of posts) {
    if (!post.scheduled_at) continue
    const parsed = parseISO(post.scheduled_at)
    for (const { day } of weekData) {
      if (isSameDay(parsed, day)) {
        const key = format(day, "yyyy-MM-dd")
        const existing = postsByDay.get(key) ?? []
        postsByDay.set(key, [...existing, post])
        break
      }
    }
  }

  // Posts without specific time go in all-day row
  const allDayPosts = new Map<string, CalendarPost[]>()
  const timedPosts = new Map<string, Map<number, CalendarPost[]>>()

  for (const [dayKey, dayPosts] of postsByDay) {
    for (const post of dayPosts) {
      const hour = getPostHour(post)
      if (hour === null) {
        const existing = allDayPosts.get(dayKey) ?? []
        allDayPosts.set(dayKey, [...existing, post])
      } else {
        if (!timedPosts.has(dayKey)) timedPosts.set(dayKey, new Map())
        const hourMap = timedPosts.get(dayKey)!
        const existing = hourMap.get(hour) ?? []
        hourMap.set(hour, [...existing, post])
      }
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-auto">
      {/* Day headers */}
      <div className="sticky top-0 z-10 grid grid-cols-[60px_repeat(7,1fr)] border-b border-neutral-200 bg-white">
        <div className="border-r border-neutral-200 p-1" />
        {weekData.map(({ day }) => (
          <div
            key={format(day, "yyyy-MM-dd")}
            className={cn(
              "border-r border-neutral-200 px-2 py-1.5 text-center",
              isToday(day) && "bg-[hsl(var(--magenta,330_80%_55%))]/10"
            )}
          >
            <div className="text-xs font-medium text-neutral-500">
              {format(day, "EEE")}
            </div>
            <div
              className={cn(
                "text-lg font-semibold",
                isToday(day)
                  ? "text-[hsl(var(--magenta,330_80%_55%))]"
                  : "text-neutral-700"
              )}
            >
              {format(day, "d")}
            </div>
          </div>
        ))}
      </div>

      {/* All-day row */}
      <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-neutral-300">
        <div className="flex items-center justify-center border-r border-neutral-200 p-1 text-xs text-neutral-400">
          Ganzt.
        </div>
        {weekData.map(({ day }) => {
          const dayKey = format(day, "yyyy-MM-dd")
          const dayAllDay = allDayPosts.get(dayKey) ?? []
          return (
            <DroppableSlot
              key={`allday-${dayKey}`}
              id={`slot-allday-${day.toISOString()}`}
              date={day}
              className="min-h-[32px] border-r border-neutral-200 p-0.5"
            >
              {dayAllDay.map((post) => (
                <CalendarPostCard
                  key={post.id}
                  post={post}
                  onClick={onPostClick}
                />
              ))}
            </DroppableSlot>
          )
        })}
      </div>

      {/* Hourly slots */}
      {Array.from({ length: 24 }, (_, hour) => (
        <div
          key={hour}
          className="grid h-[60px] grid-cols-[60px_repeat(7,1fr)] border-b border-neutral-100"
        >
          <div className="flex items-start justify-center border-r border-neutral-200 pt-0.5 text-xs text-neutral-400">
            {String(hour).padStart(2, "0")}:00
          </div>
          {weekData.map(({ day }) => {
            const dayKey = format(day, "yyyy-MM-dd")
            const hourPosts =
              timedPosts.get(dayKey)?.get(hour) ?? []
            const slotDate = new Date(day)
            slotDate.setHours(hour, 0, 0, 0)

            return (
              <DroppableSlot
                key={`${dayKey}-${hour}`}
                id={`slot-${slotDate.toISOString()}`}
                date={slotDate}
                className="border-r border-neutral-100 p-0.5"
              >
                {hourPosts.map((post) => (
                  <CalendarPostCard
                    key={post.id}
                    post={post}
                    onClick={onPostClick}
                  />
                ))}
              </DroppableSlot>
            )
          })}
        </div>
      ))}
    </div>
  )
}

export const CalendarWeekView = React.memo(CalendarWeekViewInner)
