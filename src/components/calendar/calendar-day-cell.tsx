"use client"

import { cn } from "@/lib/utils"
import { format } from "@/lib/calendar-utils"
import { CalendarPostCard } from "./calendar-post-card"
import type { CalendarPost } from "@/hooks/use-calendar-posts"

type CalendarDayCellProps = {
  readonly date: Date
  readonly posts: CalendarPost[]
  readonly isCurrentMonth: boolean
  readonly isToday: boolean
  readonly onClick?: (date: Date) => void
  readonly onPostClick?: (postId: string) => void
}

const MAX_VISIBLE_POSTS = 3

export function CalendarDayCell({
  date,
  posts,
  isCurrentMonth,
  isToday,
  onClick,
  onPostClick,
}: CalendarDayCellProps) {
  const visiblePosts = posts.slice(0, MAX_VISIBLE_POSTS)
  const overflowCount = posts.length - MAX_VISIBLE_POSTS

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick?.(date)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onClick?.(date)
        }
      }}
      className={cn(
        "min-h-[120px] border-b border-r border-neutral-200 p-1",
        "cursor-pointer transition-colors hover:bg-neutral-50",
        !isCurrentMonth && "bg-neutral-50/50",
        isToday && "ring-2 ring-inset ring-[hsl(var(--magenta,330_80%_55%))]"
      )}
    >
      <span
        className={cn(
          "mb-1 inline-flex size-6 items-center justify-center rounded-full text-xs font-medium",
          !isCurrentMonth && "text-neutral-400",
          isCurrentMonth && "text-neutral-700",
          isToday && "bg-[hsl(var(--magenta,330_80%_55%))] text-white"
        )}
      >
        {format(date, "d")}
      </span>

      <div className="flex flex-col gap-0.5">
        {visiblePosts.map((post) => (
          <CalendarPostCard
            key={post.id}
            post={post}
            onClick={onPostClick}
          />
        ))}

        {overflowCount > 0 && (
          <span className="px-1.5 text-xs text-neutral-500">
            +{overflowCount} weitere
          </span>
        )}
      </div>
    </div>
  )
}
