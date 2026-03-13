"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import type { Database } from "@/lib/supabase/types"
import type {
  CreateBioItemInput,
  UpdateBioItemInput,
  ReorderBioItemsInput,
} from "@/lib/validations/bio"

type BioItem = Database["public"]["Tables"]["linkinbio_items"]["Row"] & {
  links: Database["public"]["Tables"]["links"]["Row"] | null
}

const BIO_ITEMS_KEY = ["bio-items"] as const

export function useBioItems(pageId: string | undefined) {
  return useQuery<BioItem[]>({
    queryKey: [...BIO_ITEMS_KEY, pageId],
    queryFn: async () => {
      const res = await fetch(`/api/bio/${pageId}/items`)
      if (!res.ok) throw new Error("Fehler beim Laden der Bio-Items")
      const json = await res.json()
      return json.data
    },
    enabled: !!pageId,
  })
}

export function useAddBioItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ pageId, ...data }: CreateBioItemInput & { pageId: string }) => {
      const res = await fetch(`/api/bio/${pageId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error ?? "Fehler beim Hinzufuegen des Items")
      }
      return res.json()
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [...BIO_ITEMS_KEY, variables.pageId] })
      toast.success("Item hinzugefuegt")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useReorderBioItems() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      pageId,
      items,
    }: ReorderBioItemsInput & { pageId: string }) => {
      const res = await fetch(`/api/bio/${pageId}/items`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error ?? "Fehler beim Sortieren der Items")
      }
      return res.json()
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [...BIO_ITEMS_KEY, variables.pageId] })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useRemoveBioItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ pageId, itemId }: { pageId: string; itemId: string }) => {
      const res = await fetch(`/api/bio/${pageId}/items?itemId=${itemId}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error ?? "Fehler beim Entfernen des Items")
      }
      return res.json()
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [...BIO_ITEMS_KEY, variables.pageId] })
      toast.success("Item entfernt")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useUpdateBioItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      pageId,
      itemId,
      ...data
    }: UpdateBioItemInput & { pageId: string; itemId: string }) => {
      const res = await fetch(`/api/bio/${pageId}/items`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, ...data }),
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error ?? "Fehler beim Aktualisieren des Items")
      }
      return res.json()
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [...BIO_ITEMS_KEY, variables.pageId] })
      toast.success("Item aktualisiert")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
