"use client"

import { useMemo } from "react"
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
  const filterChannelId = useCalendarStore((s) => s.filterChannelId)
  const filterStatus = useCalendarStore((s) => s.filterStatus)
  const filterCampaignId = useCalendarStore((s) => s.filterCampaignId)

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

  // Apply client-side filters
  const filteredPosts = useMemo(() => {
    const allPosts = query.data ?? []

    return allPosts.filter((post) => {
      // Channel filter: post must have at least one matching channel
      if (filterChannelId) {
        const hasChannel = post.post_channels?.some(
          (pc) => pc.channel_id === filterChannelId
        )
        if (!hasChannel) return false
      }

      // Status filter
      if (filterStatus && post.status !== filterStatus) {
        return false
      }

      // Campaign filter
      if (filterCampaignId && post.campaign_id !== filterCampaignId) {
        return false
      }

      return true
    })
  }, [query.data, filterChannelId, filterStatus, filterCampaignId])

  const groupedPosts = useMemo(
    () => groupPostsByDay(filteredPosts),
    [filteredPosts]
  )

  return {
    posts: filteredPosts,
    groupedPosts,
    isLoading: query.isLoading,
    error: query.error,
  }
}

export type { CalendarPost }
