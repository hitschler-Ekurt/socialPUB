"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import type { Database } from "@/lib/supabase/types"
import type { CreateBioPageInput, UpdateBioPageInput } from "@/lib/validations/bio"

type BioPage = Database["public"]["Tables"]["linkinbio_pages"]["Row"]

const BIO_PAGES_KEY = ["bio-pages"] as const

export function useBioPages() {
  return useQuery<BioPage[]>({
    queryKey: BIO_PAGES_KEY,
    queryFn: async () => {
      const res = await fetch("/api/bio")
      if (!res.ok) throw new Error("Fehler beim Laden der Bio-Seiten")
      const json = await res.json()
      return json.data
    },
  })
}

export function useCreateBioPage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateBioPageInput) => {
      const res = await fetch("/api/bio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error ?? "Fehler beim Erstellen der Bio-Seite")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BIO_PAGES_KEY })
      toast.success("Bio-Seite erstellt")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useUpdateBioPage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ pageId, ...data }: UpdateBioPageInput & { pageId: string }) => {
      const res = await fetch(`/api/bio/${pageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error ?? "Fehler beim Aktualisieren der Bio-Seite")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BIO_PAGES_KEY })
      toast.success("Bio-Seite aktualisiert")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useDeleteBioPage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (pageId: string) => {
      const res = await fetch(`/api/bio/${pageId}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error ?? "Fehler beim Loeschen der Bio-Seite")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BIO_PAGES_KEY })
      toast.success("Bio-Seite geloescht")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
