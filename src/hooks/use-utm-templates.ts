"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import type { Database } from "@/lib/supabase/types"
import type { CreateUtmTemplateInput, UpdateUtmTemplateInput } from "@/lib/validations/utm-template"

type UtmTemplate = Database["public"]["Tables"]["utm_templates"]["Row"]

const UTM_TEMPLATES_KEY = ["utm-templates"] as const

export function useUtmTemplates() {
  return useQuery<UtmTemplate[]>({
    queryKey: UTM_TEMPLATES_KEY,
    queryFn: async () => {
      const res = await fetch("/api/utm-templates")
      if (!res.ok) throw new Error("Fehler beim Laden der UTM-Vorlagen")
      const json = await res.json()
      return json.data
    },
  })
}

export function useCreateUtmTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateUtmTemplateInput) => {
      const res = await fetch("/api/utm-templates", {
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
      queryClient.invalidateQueries({ queryKey: UTM_TEMPLATES_KEY })
      toast.success("UTM-Vorlage erstellt")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useUpdateUtmTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateUtmTemplateInput & { id: string }) => {
      const res = await fetch(`/api/utm-templates/${id}`, {
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
      queryClient.invalidateQueries({ queryKey: UTM_TEMPLATES_KEY })
      toast.success("UTM-Vorlage aktualisiert")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useDeleteUtmTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/utm-templates/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error ?? "Fehler beim Loeschen")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: UTM_TEMPLATES_KEY })
      toast.success("UTM-Vorlage geloescht")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
