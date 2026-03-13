"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import type { Database } from "@/lib/supabase/types"
import type { CreatePostInput, UpdatePostInput } from "@/lib/validations/post"

type Post = Database["public"]["Tables"]["posts"]["Row"] & {
  campaigns: {
    id: string
    name: string
    color: string
    slug: string
  } | null
}

type PostDetail = Post & {
  channels: string[]
  media: Database["public"]["Tables"]["post_media"]["Row"][]
}

const POSTS_KEY = ["posts"] as const

export function usePosts() {
  return useQuery<Post[]>({
    queryKey: POSTS_KEY,
    queryFn: async () => {
      const res = await fetch("/api/posts")
      if (!res.ok) throw new Error("Fehler beim Laden der Posts")
      const json = await res.json()
      return json.data
    },
  })
}

export function usePost(id: string | undefined) {
  return useQuery<PostDetail>({
    queryKey: [...POSTS_KEY, id],
    queryFn: async () => {
      const res = await fetch(`/api/posts/${id}`)
      if (!res.ok) throw new Error("Fehler beim Laden des Posts")
      const json = await res.json()
      return json.data
    },
    enabled: !!id,
  })
}

export function useCreatePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreatePostInput) => {
      const res = await fetch("/api/posts", {
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
      queryClient.invalidateQueries({ queryKey: POSTS_KEY })
      toast.success("Post erstellt")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useUpdatePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdatePostInput & { id: string }) => {
      const res = await fetch(`/api/posts/${id}`, {
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
      queryClient.invalidateQueries({ queryKey: POSTS_KEY })
      queryClient.invalidateQueries({ queryKey: [...POSTS_KEY, variables.id] })
      toast.success("Post aktualisiert")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useDeletePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/posts/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error ?? "Fehler beim Loeschen")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: POSTS_KEY })
      toast.success("Post geloescht")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
