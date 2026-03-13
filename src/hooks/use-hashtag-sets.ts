"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import type { Database } from "@/lib/supabase/types"
import type { CreateHashtagSetInput, UpdateHashtagSetInput } from "@/lib/validations/hashtag-set"

type HashtagSet = Database["public"]["Tables"]["hashtag_sets"]["Row"]

const HASHTAG_SETS_KEY = ["hashtag-sets"] as const

export function useHashtagSets() {
  return useQuery<HashtagSet[]>({
    queryKey: HASHTAG_SETS_KEY,
    queryFn: async () => {
      const res = await fetch("/api/hashtag-sets")
      if (!res.ok) throw new Error("Fehler beim Laden der Hashtag-Sets")
      const json = await res.json()
      return json.data
    },
  })
}

export function useCreateHashtagSet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateHashtagSetInput) => {
      const res = await fetch("/api/hashtag-sets", {
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
      queryClient.invalidateQueries({ queryKey: HASHTAG_SETS_KEY })
      toast.success("Hashtag-Set erstellt")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useUpdateHashtagSet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateHashtagSetInput & { id: string }) => {
      const res = await fetch(`/api/hashtag-sets/${id}`, {
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
      queryClient.invalidateQueries({ queryKey: HASHTAG_SETS_KEY })
      toast.success("Hashtag-Set aktualisiert")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useDeleteHashtagSet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/hashtag-sets/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error ?? "Fehler beim Loeschen")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HASHTAG_SETS_KEY })
      toast.success("Hashtag-Set geloescht")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
