"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import type { Database } from "@/lib/supabase/types"
import type { CreateCampaignInput, UpdateCampaignInput } from "@/lib/validations/campaign"

type Campaign = Database["public"]["Tables"]["campaigns"]["Row"] & {
  post_count: number
}

const CAMPAIGNS_KEY = ["campaigns"] as const

export function useCampaigns() {
  return useQuery<Campaign[]>({
    queryKey: CAMPAIGNS_KEY,
    queryFn: async () => {
      const res = await fetch("/api/campaigns")
      if (!res.ok) throw new Error("Fehler beim Laden der Kampagnen")
      const json = await res.json()
      return json.data
    },
  })
}

export function useCreateCampaign() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateCampaignInput) => {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error ?? "Fehler beim Erstellen")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CAMPAIGNS_KEY })
      toast.success("Kampagne erstellt")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useUpdateCampaign() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateCampaignInput & { id: string }) => {
      const res = await fetch(`/api/campaigns/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error ?? "Fehler beim Aktualisieren")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CAMPAIGNS_KEY })
      toast.success("Kampagne aktualisiert")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useDeleteCampaign() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/campaigns/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error ?? "Fehler beim Loeschen")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CAMPAIGNS_KEY })
      toast.success("Kampagne geloescht")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
