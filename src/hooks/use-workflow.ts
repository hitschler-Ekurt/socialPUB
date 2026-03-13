"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import type { WorkflowAction } from "@/lib/workflow-transitions"

interface WorkflowActionPayload {
  postId: string
  action: WorkflowAction
  comment?: string
  scheduledAt?: string
}

export function useWorkflowAction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ postId, action, comment, scheduledAt }: WorkflowActionPayload) => {
      const res = await fetch(`/api/posts/${postId}/workflow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, comment, scheduledAt }),
      })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error ?? "Fehler bei Workflow-Aktion")
      }

      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] })
      queryClient.invalidateQueries({ queryKey: ["calendar-posts"] })
      toast.success("Status aktualisiert")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
