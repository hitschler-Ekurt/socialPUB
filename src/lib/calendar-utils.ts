import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  eachHourOfInterval,
  startOfDay,
  endOfDay,
  addHours,
  format,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
} from "date-fns"
import { de } from "date-fns/locale"
import type { Database } from "@/lib/supabase/types"

type Post = Database["public"]["Tables"]["posts"]["Row"]

const WEEK_OPTIONS = { weekStartsOn: 1 as const }

/**
 * Returns a 2D grid of dates for a month view (5-6 rows x 7 columns).
 * Week starts on Monday. Includes padding days from prev/next months.
 */
export function getMonthDays(date: Date): Date[][] {
  const monthStart = startOfMonth(date)
  const monthEnd = endOfMonth(date)
  const gridStart = startOfWeek(monthStart, WEEK_OPTIONS)
  const gridEnd = endOfWeek(monthEnd, WEEK_OPTIONS)

  const allDays = eachDayOfInterval({ start: gridStart, end: gridEnd })

  const weeks: Date[][] = []
  for (let i = 0; i < allDays.length; i += 7) {
    weeks.push(allDays.slice(i, i + 7))
  }

  return weeks
}

/**
 * Returns 7 days with 24 hourly slots each for a week view.
 */
export function getWeekHours(date: Date): { day: Date; hours: Date[] }[] {
  const weekStart = startOfWeek(date, WEEK_OPTIONS)
  const weekEnd = endOfWeek(date, WEEK_OPTIONS)
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd })

  return days.map((day) => ({
    day,
    hours: eachHourOfInterval({
      start: startOfDay(day),
      end: addHours(startOfDay(day), 23),
    }),
  }))
}

/**
 * Returns 24 hourly slots for a single day.
 */
export function getDayHours(date: Date): Date[] {
  const dayStart = startOfDay(date)
  return eachHourOfInterval({
    start: dayStart,
    end: addHours(dayStart, 23),
  })
}

/**
 * Groups posts by their scheduled day (yyyy-MM-dd key).
 * Posts without scheduled_at are excluded.
 */
export function groupPostsByDay(posts: Post[]): Map<string, Post[]> {
  const map = new Map<string, Post[]>()

  for (const post of posts) {
    if (!post.scheduled_at) continue
    const key = format(parseISO(post.scheduled_at), "yyyy-MM-dd")
    const existing = map.get(key) ?? []
    map.set(key, [...existing, post])
  }

  return map
}

/**
 * Formats a date as "Maerz 2026" style using German locale.
 */
export function formatMonthYear(date: Date): string {
  return format(date, "LLLL yyyy", { locale: de })
}

/**
 * Formats a week range like "10. - 16. Maerz 2026".
 */
export function formatWeekRange(date: Date): string {
  const weekStart = startOfWeek(date, WEEK_OPTIONS)
  const weekEnd = endOfWeek(date, WEEK_OPTIONS)

  if (weekStart.getMonth() === weekEnd.getMonth()) {
    return `${format(weekStart, "d.", { locale: de })} - ${format(weekEnd, "d. LLLL yyyy", { locale: de })}`
  }

  return `${format(weekStart, "d. LLLL", { locale: de })} - ${format(weekEnd, "d. LLLL yyyy", { locale: de })}`
}

/**
 * Formats a day header like "Donnerstag, 13. Maerz".
 */
export function formatDayHeader(date: Date): string {
  return format(date, "EEEE, d. LLLL", { locale: de })
}

/**
 * Gets the start of the visible grid for a given view/date combination.
 */
export function getViewDateRange(
  date: Date,
  view: "month" | "week" | "day"
): { from: Date; to: Date } {
  switch (view) {
    case "month": {
      const monthStart = startOfMonth(date)
      const monthEnd = endOfMonth(date)
      return {
        from: startOfWeek(monthStart, WEEK_OPTIONS),
        to: endOfWeek(monthEnd, WEEK_OPTIONS),
      }
    }
    case "week": {
      return {
        from: startOfWeek(date, WEEK_OPTIONS),
        to: endOfWeek(date, WEEK_OPTIONS),
      }
    }
    case "day": {
      return {
        from: startOfDay(date),
        to: endOfDay(date),
      }
    }
  }
}

// Re-export date-fns helpers used by components
export {
  isSameMonth,
  isSameDay,
  isToday,
  format,
  parseISO,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  startOfDay,
}
