"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { generateVideoThumbnail } from "@/lib/utils/video-thumbnail"
import type { Database } from "@/lib/supabase/types"

type Media = Database["public"]["Tables"]["media"]["Row"]

type MediaFilters = {
  readonly media_type?: "image" | "video" | "gif"
  readonly tags?: string
  readonly search?: string
  readonly page?: number
}

type MediaResponse = {
  readonly data: Media[]
  readonly pagination: {
    readonly page: number
    readonly limit: number
    readonly total: number
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

async function getSignedUploadUrl(fileName: string, contentType: string) {
  const res = await fetch("/api/media/upload-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileName, contentType }),
  })
  if (!res.ok) throw new Error("Fehler beim Erstellen der Upload-URL")
  return res.json() as Promise<{
    uploadUrl: string
    filePath: string
    token: string
  }>
}

async function uploadFileToStorage(uploadUrl: string, file: Blob, contentType: string) {
  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: file,
  })
  if (!res.ok) throw new Error("Fehler beim Hochladen der Datei")
}

async function createMediaRecord(metadata: Record<string, unknown>) {
  const res = await fetch("/api/media", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(metadata),
  })
  if (!res.ok) throw new Error("Fehler beim Speichern der Metadaten")
  return res.json()
}

function getMediaType(mimeType: string): "image" | "video" | "gif" {
  if (mimeType === "image/gif") return "gif"
  if (mimeType.startsWith("video/")) return "video"
  return "image"
}

export function useUploadMedia() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (file: File) => {
      // Step 1: Get signed URL
      const { uploadUrl, filePath } = await getSignedUploadUrl(
        file.name,
        file.type
      )

      // Step 2: Upload file to storage
      await uploadFileToStorage(uploadUrl, file, file.type)

      // Step 3: Handle video thumbnail
      let thumbnailPath: string | null = null
      const mediaType = getMediaType(file.type)

      if (mediaType === "video") {
        try {
          const thumbnailBlob = await generateVideoThumbnail(file)
          const thumbnailName = `thumb_${file.name.replace(/\.[^.]+$/, "")}.jpg`
          const thumbResult = await getSignedUploadUrl(thumbnailName, "image/jpeg")
          await uploadFileToStorage(thumbResult.uploadUrl, thumbnailBlob, "image/jpeg")
          thumbnailPath = thumbResult.filePath
        } catch {
          // Thumbnail generation is non-critical, continue without it
          console.warn("Video-Thumbnail konnte nicht erstellt werden")
        }
      }

      // Step 4: Create media record
      const metadata = {
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        mime_type: file.type,
        media_type: mediaType,
        thumbnail_path: thumbnailPath,
      }

      return createMediaRecord(metadata)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEDIA_KEY })
    },
    onError: (error: Error) => {
      toast.error(error.message || "Upload fehlgeschlagen")
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
  })
}

export function useBulkDeleteMedia() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const results = await Promise.all(
        ids.map(async (id) => {
          const res = await fetch(`/api/media/${id}`, { method: "DELETE" })
          if (!res.ok) throw new Error(`Fehler beim Loeschen von ${id}`)
          return res.json()
        })
      )
      return results
    },
    onSuccess: (_data, ids) => {
      queryClient.invalidateQueries({ queryKey: MEDIA_KEY })
      toast.success(`${ids.length} Dateien geloescht`)
    },
  })
}

export function useBulkTagMedia() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      ids,
      tags,
      existingMedia,
    }: {
      ids: string[]
      tags: string[]
      existingMedia: Media[]
    }) => {
      const results = await Promise.all(
        ids.map(async (id) => {
          const existing = existingMedia.find((m) => m.id === id)
          const currentTags = existing?.tags ?? []
          const mergedTags = [...new Set([...currentTags, ...tags])]

          const res = await fetch(`/api/media/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tags: mergedTags }),
          })
          if (!res.ok) throw new Error(`Fehler beim Taggen von ${id}`)
          return res.json()
        })
      )
      return results
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEDIA_KEY })
      toast.success("Tags hinzugefuegt")
    },
  })
}
