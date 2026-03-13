"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import type { Database } from "@/lib/supabase/types"
import type { CreateLinkInput, UpdateLinkInput } from "@/lib/validations/link"

type Link = Database["public"]["Tables"]["links"]["Row"] & {
  campaigns: {
    id: string
    name: string
    color: string
    slug: string
  } | null
}

type LinkDetail = Link & {
  post_count: number
}

const LINKS_KEY = ["links"] as const

export function useLinks() {
  return useQuery<Link[]>({
    queryKey: LINKS_KEY,
    queryFn: async () => {
      const res = await fetch("/api/links")
      if (!res.ok) throw new Error("Fehler beim Laden der Links")
      const json = await res.json()
      return json.data
    },
  })
}

export function useLink(id: string | undefined) {
  return useQuery<LinkDetail>({
    queryKey: [...LINKS_KEY, id],
    queryFn: async () => {
      const res = await fetch(`/api/links/${id}`)
      if (!res.ok) throw new Error("Fehler beim Laden des Links")
      const json = await res.json()
      return json.data
    },
    enabled: !!id,
  })
}

export function useCreateLink() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateLinkInput) => {
      const res = await fetch("/api/links", {
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
      queryClient.invalidateQueries({ queryKey: LINKS_KEY })
      toast.success("Link erstellt")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useUpdateLink() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateLinkInput & { id: string }) => {
      const res = await fetch(`/api/links/${id}`, {
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
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: LINKS_KEY })
      queryClient.invalidateQueries({ queryKey: [...LINKS_KEY, variables.id] })
      toast.success("Link aktualisiert")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useDeleteLink() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/links/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error ?? "Fehler beim Loeschen")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LINKS_KEY })
      toast.success("Link geloescht")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
