"use client"

import { useQuery } from "@tanstack/react-query"
import { useCalendarStore } from "@/stores/calendar-store"
import { getViewDateRange, groupPostsByDay } from "@/lib/calendar-utils"
import type { Database } from "@/lib/supabase/types"

type CalendarPost = Database["public"]["Tables"]["posts"]["Row"] & {
  campaigns: {
    id: string
    name: string
    color: string
    slug: string
  } | null
  post_channels: {
    channel_id: string
    channels: {
      id: string
      platform: string
      name: string
    } | null
  }[]
  post_media: {
    media_id: string
    media: {
      id: string
      file_path: string
      mime_type: string
    } | null
  }[]
}

const CALENDAR_POSTS_KEY = ["posts", "calendar"] as const

export function useCalendarPosts() {
  const currentDate = useCalendarStore((s) => s.currentDate)
  const view = useCalendarStore((s) => s.view)

  const { from, to } = getViewDateRange(currentDate, view)
  const fromISO = from.toISOString()
  const toISO = to.toISOString()

  const query = useQuery<CalendarPost[]>({
    queryKey: [...CALENDAR_POSTS_KEY, fromISO, toISO],
    queryFn: async () => {
      const params = new URLSearchParams({ from: fromISO, to: toISO })
      const res = await fetch(`/api/posts?${params.toString()}`)
      if (!res.ok) throw new Error("Fehler beim Laden der Kalender-Posts")
      const json = await res.json()
      return json.data
    },
  })

  const groupedPosts = query.data ? groupPostsByDay(query.data) : new Map()

  return {
    posts: query.data ?? [],
    groupedPosts,
    isLoading: query.isLoading,
    error: query.error,
  }
}

export type { CalendarPost }
