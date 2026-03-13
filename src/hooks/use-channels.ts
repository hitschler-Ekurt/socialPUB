"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { ChannelHealthStatus } from "@/app/api/channels/health/route"
import type { Database } from "@/lib/supabase/types"

type Channel = Database["public"]["Tables"]["channels"]["Row"]

type ChannelHealthItem = {
  channelId: string
  accountId: string | null
  status: ChannelHealthStatus
  expiresAt: string | null
}

const CHANNELS_KEY = ["channels"] as const
const CHANNELS_HEALTH_KEY = ["channels", "health"] as const

export function useChannels() {
  return useQuery<Channel[]>({
    queryKey: CHANNELS_KEY,
    queryFn: async () => {
      const res = await fetch("/api/channels")
      if (!res.ok) throw new Error("Fehler beim Laden der Kanaele")
      const json = await res.json()
      return json.data
    },
  })
}

export function useChannelHealth() {
  return useQuery<ChannelHealthItem[]>({
    queryKey: CHANNELS_HEALTH_KEY,
    queryFn: async () => {
      const res = await fetch("/api/channels/health")
      if (!res.ok) throw new Error("Fehler beim Laden des Kanal-Status")
      const json = await res.json()
      return json.data
    },
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  })
}

export function useConnectChannel() {
  return useMutation({
    mutationFn: async (platform: "instagram" | "tiktok") => {
      const res = await fetch(
        `/api/channels/connect?platform=${encodeURIComponent(platform)}`
      )
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error ?? "Fehler beim Verbinden")
      }
      const json = await res.json()
      return json.authUrl as string
    },
    onSuccess: (authUrl) => {
      window.location.href = authUrl
    },
  })
}

export function useDisconnectChannel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (channelId: string) => {
      const res = await fetch(`/api/channels/${channelId}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error ?? "Fehler beim Trennen")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHANNELS_KEY })
    },
  })
}
