"use client"

import { useState, useCallback, useRef } from "react"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import type { DragStartEvent, DragEndEvent } from "@dnd-kit/core"
import { useCalendarPosts } from "@/hooks/use-calendar-posts"
import { useCalendarStore } from "@/stores/calendar-store"
import { useUpdatePost } from "@/hooks/use-posts"
import { CalendarHeader } from "@/components/calendar/calendar-header"
import { CalendarMonthView } from "@/components/calendar/calendar-month-view"
import { CalendarWeekView } from "@/components/calendar/calendar-week-view"
import { CalendarDayView } from "@/components/calendar/calendar-day-view"
import { CalendarPostCard } from "@/components/calendar/calendar-post-card"
import { PostDetailPopover } from "@/components/calendar/post-detail-popover"
import { Button } from "@/components/ui/button"
import { CalendarDays, Plus, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { CalendarPost } from "@/hooks/use-calendar-posts"

export default function CalendarPage() {
  const router = useRouter()
  const view = useCalendarStore((s) => s.view)
  const { posts, groupedPosts, isLoading, error } = useCalendarPosts()
  const updatePost = useUpdatePost()

  const [activeId, setActiveId] = useState<string | null>(null)
  const [popoverPostId, setPopoverPostId] = useState<string | null>(null)
  const [popoverAnchor, setPopoverAnchor] = useState<{ x: number; y: number } | null>(null)
  const oldScheduledAtRef = useRef<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )

  const activePost = activeId
    ? posts.find((p) => p.id === activeId) ?? null
    : null

  const popoverPost = popoverPostId
    ? posts.find((p) => p.id === popoverPostId) ?? null
    : null

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const post = event.active.data.current?.post as CalendarPost | undefined
    if (post) {
      setActiveId(post.id)
      oldScheduledAtRef.current = post.scheduled_at
    }
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null)

      const { active, over } = event
      if (!over) return

      const postId = active.id as string
      const newDate = over.data.current?.date as Date | undefined
      if (!newDate) return

      const previousScheduledAt = oldScheduledAtRef.current

      updatePost.mutate(
        { id: postId, scheduledAt: newDate.toISOString() },
        {
          onSuccess: () => {
            toast("Post verschoben", {
              action: {
                label: "Rueckgaengig",
                onClick: () => {
                  updatePost.mutate({
                    id: postId,
                    scheduledAt: previousScheduledAt,
                  })
                },
              },
              duration: 5000,
            })
          },
        }
      )
    },
    [updatePost]
  )

  const handleDragCancel = useCallback(() => {
    setActiveId(null)
  }, [])

  const handlePostClick = useCallback(
    (postId: string, event?: React.MouseEvent) => {
      const rect = event?.currentTarget?.getBoundingClientRect()
      setPopoverPostId(postId)
      setPopoverAnchor(
        rect
          ? { x: rect.left + rect.width / 2, y: rect.top }
          : { x: window.innerWidth / 2, y: window.innerHeight / 2 }
      )
    },
    []
  )

  const handlePostClickFromCard = useCallback(
    (postId: string) => {
      // Without mouse event, center the popover
      setPopoverPostId(postId)
      setPopoverAnchor({ x: window.innerWidth / 2, y: window.innerHeight / 3 })
    },
    []
  )

  const handleDayClick = useCallback(
    (date: Date) => {
      router.push(`/composer?scheduledAt=${date.toISOString()}`)
    },
    [router]
  )

  const handleClosePopover = useCallback(() => {
    setPopoverPostId(null)
    setPopoverAnchor(null)
  }, [])

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
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
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
                onPostClick={handlePostClickFromCard}
                onDayClick={handleDayClick}
              />
            )}
            {view === "week" && (
              <CalendarWeekView
                posts={posts}
                onPostClick={handlePostClickFromCard}
              />
            )}
            {view === "day" && (
              <CalendarDayView
                posts={posts}
                onPostClick={handlePostClickFromCard}
              />
            )}
          </>
        )}
      </div>

      <DragOverlay>
        {activePost ? (
          <CalendarPostCard post={activePost} isDragOverlay />
        ) : null}
      </DragOverlay>

      {popoverPost && popoverAnchor && (
        <PostDetailPopover
          post={popoverPost}
          anchor={popoverAnchor}
          onClose={handleClosePopover}
        />
      )}
    </DndContext>
  )
}
