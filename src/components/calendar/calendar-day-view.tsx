"use client"

import React from "react"
import { useCalendarStore } from "@/stores/calendar-store"
import {
  getDayHours,
  isToday,
  isSameDay,
  format,
  parseISO,
} from "@/lib/calendar-utils"
import { CalendarPostCard } from "./calendar-post-card"
import { cn } from "@/lib/utils"
import type { CalendarPost } from "@/hooks/use-calendar-posts"

type CalendarDayViewProps = {
  readonly posts: CalendarPost[]
  readonly onPostClick?: (postId: string) => void
}

function CalendarDayViewInner({ posts, onPostClick }: CalendarDayViewProps) {
  const currentDate = useCalendarStore((s) => s.currentDate)
  const hours = getDayHours(currentDate)
  const isTodayView = isToday(currentDate)
  const currentHour = new Date().getHours()

  // Filter posts for this day
  const dayPosts = posts.filter(
    (p) => p.scheduled_at && isSameDay(parseISO(p.scheduled_at), currentDate)
  )

  // Group by hour
  const postsByHour = new Map<number, CalendarPost[]>()
  const allDayPosts: CalendarPost[] = []

  for (const post of dayPosts) {
    if (!post.scheduled_at) continue
    const hour = parseISO(post.scheduled_at).getHours()
    // If time is exactly midnight and appears intentional, treat as all-day
    if (hour === 0 && parseISO(post.scheduled_at).getMinutes() === 0) {
      allDayPosts.push(post)
    } else {
      const existing = postsByHour.get(hour) ?? []
      postsByHour.set(hour, [...existing, post])
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-auto">
      {/* All-day row */}
      {allDayPosts.length > 0 && (
        <div className="flex border-b border-neutral-300">
          <div className="flex w-[60px] shrink-0 items-center justify-center border-r border-neutral-200 text-xs text-neutral-400">
            Ganzt.
          </div>
          <div className="flex-1 p-1">
            {allDayPosts.map((post) => (
              <CalendarPostCard
                key={post.id}
                post={post}
                onClick={onPostClick}
              />
            ))}
          </div>
        </div>
      )}

      {/* Hourly slots */}
      <div className="relative">
        {hours.map((hourDate, idx) => {
          const hour = idx
          const hourPosts = postsByHour.get(hour) ?? []

          return (
            <div
              key={hour}
              className="relative flex h-[60px] border-b border-neutral-100"
            >
              <div className="flex w-[60px] shrink-0 items-start justify-center border-r border-neutral-200 pt-0.5 text-xs text-neutral-400">
                {format(hourDate, "HH:mm")}
              </div>
              <div className="flex-1 p-0.5">
                {hourPosts.map((post) => (
                  <CalendarPostCard
                    key={post.id}
                    post={post}
                    onClick={onPostClick}
                  />
                ))}
              </div>
            </div>
          )
        })}

        {/* Current time indicator */}
        {isTodayView && (
          <div
            className="pointer-events-none absolute left-[60px] right-0 z-10 border-t-2 border-[hsl(var(--magenta,330_80%_55%))]"
            style={{
              top: `${(currentHour / 24) * (24 * 60)}px`,
            }}
          >
            <div className="absolute -left-1.5 -top-1.5 size-3 rounded-full bg-[hsl(var(--magenta,330_80%_55%))]" />
          </div>
        )}
      </div>
    </div>
  )
}

export const CalendarDayView = React.memo(CalendarDayViewInner)
