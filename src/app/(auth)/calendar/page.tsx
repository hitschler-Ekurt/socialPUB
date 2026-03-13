"use client"

import { useCalendarPosts } from "@/hooks/use-calendar-posts"
import { useCalendarStore } from "@/stores/calendar-store"
import { CalendarHeader } from "@/components/calendar/calendar-header"
import { CalendarMonthView } from "@/components/calendar/calendar-month-view"
import { CalendarWeekView } from "@/components/calendar/calendar-week-view"
import { CalendarDayView } from "@/components/calendar/calendar-day-view"
import { Button } from "@/components/ui/button"
import { CalendarDays, Plus, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import type { CalendarPost } from "@/hooks/use-calendar-posts"

export default function CalendarPage() {
  const router = useRouter()
  const view = useCalendarStore((s) => s.view)
  const { posts, groupedPosts, isLoading, error } = useCalendarPosts()

  const handlePostClick = (postId: string) => {
    // Will be wired to detail view in Plan 02
    router.push(`/composer?edit=${postId}`)
  }

  const handleDayClick = (date: Date) => {
    router.push(`/composer?scheduledAt=${date.toISOString()}`)
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8">
        <p className="text-sm text-red-500">
          Fehler beim Laden der Kalender-Daten
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col">
      <CalendarHeader />

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="size-6 animate-spin text-neutral-400" />
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
          <CalendarDays className="size-12 text-neutral-300" />
          <div className="text-center">
            <p className="font-medium text-neutral-700">
              Noch keine Posts geplant
            </p>
            <p className="mt-1 text-sm text-neutral-500">
              Erstelle deinen ersten Post, um ihn im Kalender zu sehen.
            </p>
          </div>
          <Button onClick={() => router.push("/composer")}>
            <Plus className="mr-2 size-4" />
            Ersten Post erstellen
          </Button>
        </div>
      ) : (
        <>
          {view === "month" && (
            <CalendarMonthView
              groupedPosts={groupedPosts as Map<string, CalendarPost[]>}
              onPostClick={handlePostClick}
              onDayClick={handleDayClick}
            />
          )}
          {view === "week" && (
            <CalendarWeekView
              posts={posts}
              onPostClick={handlePostClick}
            />
          )}
          {view === "day" && (
            <CalendarDayView
              posts={posts}
              onPostClick={handlePostClick}
            />
          )}
        </>
      )}
    </div>
  )
}
