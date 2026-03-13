"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import type { Database } from "@/lib/supabase/types"
import { generateVideoThumbnail } from "@/lib/utils/video-thumbnail"

type Media = Database["public"]["Tables"]["media"]["Row"]

type MediaFilters = {
  media_type?: "image" | "video" | "gif"
  tags?: string
  search?: string
  page?: number
}

type MediaResponse = {
  data: Media[]
  pagination: {
    page: number
    limit: number
    total: number
  }
}

const MEDIA_KEY = ["media"] as const

export function useMedia(filters: MediaFilters = {}) {
  return useQuery<MediaResponse>({
    queryKey: [...MEDIA_KEY, filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters.media_type) params.set("media_type", filters.media_type)
      if (filters.tags) params.set("tags", filters.tags)
      if (filters.search) params.set("search", filters.search)
      if (filters.page) params.set("page", String(filters.page))

      const res = await fetch(`/api/media?${params.toString()}`)
      if (!res.ok) throw new Error("Fehler beim Laden der Medien")
      return res.json()
    },
  })
}

export function useUploadMedia() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (file: File) => {
      // 1. Get signed upload URL
      const urlRes = await fetch("/api/media/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
        }),
      })
      if (!urlRes.ok) {
        const json = await urlRes.json()
        throw new Error(json.error ?? "Fehler beim Erstellen der Upload-URL")
      }
      const { uploadUrl, filePath } = await urlRes.json()

      // 2. Upload file directly to Supabase Storage
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      })
      if (!uploadRes.ok) {
        throw new Error("Fehler beim Hochladen der Datei")
      }

      // 3. Generate thumbnail for videos
      let thumbnailPath: string | null = null
      if (file.type.startsWith("video/")) {
        try {
          const thumbnailBlob = await generateVideoThumbnail(file)
          const thumbFileName = `thumb_${file.name.replace(/\.[^.]+$/, ".jpg")}`

          // Get signed URL for thumbnail
          const thumbUrlRes = await fetch("/api/media/upload-url", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fileName: thumbFileName,
              contentType: "image/jpeg",
            }),
          })
          if (thumbUrlRes.ok) {
            const thumbData = await thumbUrlRes.json()
            const thumbUploadRes = await fetch(thumbData.uploadUrl, {
              method: "PUT",
              body: thumbnailBlob,
              headers: { "Content-Type": "image/jpeg" },
            })
            if (thumbUploadRes.ok) {
              thumbnailPath = thumbData.filePath
            }
          }
        } catch {
          // Thumbnail generation failed -- continue without it
          console.warn("Video-Thumbnail konnte nicht erstellt werden")
        }
      }

      // 4. Determine media type
      let mediaType: "image" | "video" | "gif" = "image"
      if (file.type.startsWith("video/")) {
        mediaType = "video"
      } else if (file.type === "image/gif") {
        mediaType = "gif"
      }

      // 5. Create media record
      const metaRes = await fetch("/api/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type,
          media_type: mediaType,
          thumbnail_path: thumbnailPath,
        }),
      })
      if (!metaRes.ok) {
        const json = await metaRes.json()
        throw new Error(json.error ?? "Fehler beim Speichern der Metadaten")
      }

      return metaRes.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEDIA_KEY })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useUpdateMediaTags() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, tags }: { id: string; tags: string[] }) => {
      const res = await fetch(`/api/media/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tags }),
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error ?? "Fehler beim Aktualisieren der Tags")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEDIA_KEY })
      toast.success("Tags aktualisiert")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useDeleteMedia() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/media/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error ?? "Fehler beim Loeschen")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEDIA_KEY })
      toast.success("Datei geloescht")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useBulkDeleteMedia() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const results = await Promise.all(
        ids.map(async (id) => {
          const res = await fetch(`/api/media/${id}`, {
            method: "DELETE",
          })
          if (!res.ok) {
            const json = await res.json()
            throw new Error(json.error ?? `Fehler beim Loeschen von ${id}`)
          }
          return res.json()
        })
      )
      return results
    },
    onSuccess: (_data, ids) => {
      queryClient.invalidateQueries({ queryKey: MEDIA_KEY })
      toast.success(`${ids.length} Dateien geloescht`)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useBulkTagMedia() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      ids,
      tags,
      existingTagsMap,
    }: {
      ids: string[]
      tags: string[]
      existingTagsMap: Record<string, string[]>
    }) => {
      const results = await Promise.all(
        ids.map(async (id) => {
          const existing = existingTagsMap[id] ?? []
          const merged = [...new Set([...existing, ...tags])]
          const res = await fetch(`/api/media/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tags: merged }),
          })
          if (!res.ok) {
            const json = await res.json()
            throw new Error(
              json.error ?? `Fehler beim Taggen von ${id}`
            )
          }
          return res.json()
        })
      )
      return results
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEDIA_KEY })
      toast.success("Tags hinzugefuegt")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
