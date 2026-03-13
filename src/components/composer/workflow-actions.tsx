"use client"

import { useState } from "react"
import { useWorkflowAction } from "@/hooks/use-workflow"
import { useRequireRole } from "@/hooks/use-require-role"
import { useComposerStore } from "@/stores/composer-store"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  AlertTriangle,
  RefreshCw,
  Shield,
} from "lucide-react"
import type { PostStatus } from "@/lib/workflow-transitions"
import type { Json } from "@/lib/supabase/types"

type PublishError = {
  readonly message?: string
  readonly review_comment?: string
  readonly reviewer_name?: string
  readonly timestamp?: string
  readonly statusCode?: number
}

function parsePublishErrors(errors: Json): PublishError | null {
  if (!errors || typeof errors !== "object" || Array.isArray(errors)) return null
  return errors as unknown as PublishError
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ""
  const date = new Date(dateStr)
  return date.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

type WorkflowActionsProps = {
  readonly postId: string
  readonly currentStatus: PostStatus
  readonly publishErrors?: Json
  readonly scheduledAt?: string | null
  readonly publishedAt?: string | null
  readonly onStatusChange?: () => void
}

export function WorkflowActions({
  postId,
  currentStatus,
  publishErrors,
  scheduledAt,
  publishedAt,
  onStatusChange,
}: WorkflowActionsProps) {
  const workflowAction = useWorkflowAction()
  const { allowed: isEditorOrAdmin, loading: roleLoading } = useRequireRole([
    "admin",
    "editor",
  ] as const)
  const { allowed: isAdmin } = useRequireRole("admin" as const)
  const composerScheduledAt = useComposerStore((s) => s.scheduledAt)

  const [rejectComment, setRejectComment] = useState("")
  const [showRejectInput, setShowRejectInput] = useState(false)

  const isPending = workflowAction.isPending

  function handleAction(
    action: string,
    comment?: string,
    actionScheduledAt?: string
  ) {
    workflowAction.mutate(
      {
        postId,
        action: action as Parameters<typeof workflowAction.mutate>[0]["action"],
        comment,
        scheduledAt: actionScheduledAt,
      },
      {
        onSuccess: () => {
          setRejectComment("")
          setShowRejectInput(false)
          onStatusChange?.()
        },
      }
    )
  }

  if (roleLoading) {
    return null
  }

  const parsedErrors = publishErrors ? parsePublishErrors(publishErrors) : null

  // Rejection banner for posts returned to draft
  const rejectionBanner =
    currentStatus === "draft" && parsedErrors?.review_comment ? (
      <div className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 p-3">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />
        <div className="min-w-0 text-sm">
          <p className="font-medium text-amber-800">
            Abgelehnt
            {parsedErrors.reviewer_name
              ? ` von ${parsedErrors.reviewer_name}`
              : ""}
          </p>
          <p className="text-amber-700">{parsedErrors.review_comment}</p>
          {parsedErrors.timestamp && (
            <p className="mt-1 text-xs text-amber-500">
              {formatDate(parsedErrors.timestamp)}
            </p>
          )}
        </div>
      </div>
    ) : null

  return (
    <div className="space-y-3">
      {rejectionBanner}

      {currentStatus === "draft" && isEditorOrAdmin && (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() => handleAction("submit_review")}
          >
            <Send className="mr-1.5 size-4" />
            Zur Review einreichen
          </Button>
        </div>
      )}

      {currentStatus === "review" && isAdmin && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              disabled={isPending}
              className="bg-green-600 hover:bg-green-700"
              onClick={() => handleAction("approve")}
            >
              <CheckCircle2 className="mr-1.5 size-4" />
              Freigeben
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={isPending}
              onClick={() => setShowRejectInput(!showRejectInput)}
            >
              <XCircle className="mr-1.5 size-4" />
              Ablehnen
            </Button>
          </div>
          {showRejectInput && (
            <div className="space-y-2">
              <textarea
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
                placeholder="Ablehnungsgrund..."
                rows={2}
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
              />
              <Button
                variant="destructive"
                size="sm"
                disabled={isPending || rejectComment.trim().length === 0}
                onClick={() => handleAction("reject", rejectComment.trim())}
              >
                Ablehnung bestaetigen
              </Button>
            </div>
          )}
        </div>
      )}

      {currentStatus === "approved" && isEditorOrAdmin && (
        <div className="flex items-center gap-3">
          <Badge
            variant="secondary"
            className="border-green-200 bg-green-50 text-green-700"
          >
            <Shield className="mr-1 size-3" />
            Freigegeben
          </Badge>
          <Button
            size="sm"
            disabled={isPending || !composerScheduledAt}
            onClick={() =>
              handleAction("schedule", undefined, composerScheduledAt ?? undefined)
            }
          >
            <Clock className="mr-1.5 size-4" />
            Einplanen
          </Button>
          {!composerScheduledAt && (
            <span className="text-xs text-muted-foreground">
              Bitte zuerst einen Zeitpunkt waehlen
            </span>
          )}
        </div>
      )}

      {currentStatus === "scheduled" && (
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className="border-blue-200 bg-blue-50 text-blue-700"
          >
            <Clock className="mr-1 size-3" />
            Eingeplant
          </Badge>
          {scheduledAt && (
            <span className="text-sm text-muted-foreground">
              {formatDate(scheduledAt)}
            </span>
          )}
        </div>
      )}

      {currentStatus === "published" && (
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className="border-green-200 bg-green-50 text-green-700"
          >
            <CheckCircle2 className="mr-1 size-3" />
            Veroeffentlicht
          </Badge>
          {publishedAt && (
            <span className="text-sm text-muted-foreground">
              {formatDate(publishedAt)}
            </span>
          )}
        </div>
      )}

      {currentStatus === "failed" && (
        <div className="space-y-2">
          <div className="flex items-start gap-2 rounded-md border border-red-300 bg-red-50 p-3">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-600" />
            <div className="min-w-0 text-sm">
              <p className="font-medium text-red-800">
                Veroeffentlichung fehlgeschlagen
              </p>
              {parsedErrors?.message && (
                <p className="text-red-700">{parsedErrors.message}</p>
              )}
              {parsedErrors?.statusCode && (
                <p className="text-xs text-red-500">
                  Status: {parsedErrors.statusCode}
                </p>
              )}
              {parsedErrors?.timestamp && (
                <p className="text-xs text-red-500">
                  {formatDate(parsedErrors.timestamp)}
                </p>
              )}
            </div>
          </div>
          {isEditorOrAdmin && (
            <Button
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={() => handleAction("retry")}
            >
              <RefreshCw className="mr-1.5 size-4" />
              Erneut versuchen
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
