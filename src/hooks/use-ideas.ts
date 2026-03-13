"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import type { Database } from "@/lib/supabase/types"
import type { CreateIdeaInput, UpdateIdeaInput } from "@/lib/validations/idea"

type Draft = Database["public"]["Tables"]["drafts"]["Row"]

export type Idea = Draft & {
  campaigns: {
    id: string
    name: string
    color: string
    slug: string
  } | null
  profiles: {
    id: string
    full_name: string
    avatar_url: string | null
  } | null
}

type IdeaFilters = {
  readonly search?: string
  readonly campaignId?: string
  readonly status?: string
}

const IDEAS_KEY = ["ideas"] as const

export function useIdeas(filters?: IdeaFilters) {
  return useQuery<Idea[]>({
    queryKey: [...IDEAS_KEY, filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters?.search) params.set("search", filters.search)
      if (filters?.campaignId) params.set("campaignId", filters.campaignId)
      if (filters?.status) params.set("status", filters.status)

      const qs = params.toString()
      const url = qs ? `/api/ideas?${qs}` : "/api/ideas"

      const res = await fetch(url)
      if (!res.ok) throw new Error("Fehler beim Laden der Ideen")
      const json = await res.json()
      return json.data
    },
  })
}

export function useCreateIdea() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateIdeaInput) => {
      const res = await fetch("/api/ideas", {
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
      queryClient.invalidateQueries({ queryKey: IDEAS_KEY })
      toast.success("Idee erstellt")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useUpdateIdea() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: UpdateIdeaInput & { id: string }) => {
      const res = await fetch(`/api/ideas/${id}`, {
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
      queryClient.invalidateQueries({ queryKey: IDEAS_KEY })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useDeleteIdea() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/ideas/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error ?? "Fehler beim Loeschen")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: IDEAS_KEY })
      toast.success("Idee geloescht")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
