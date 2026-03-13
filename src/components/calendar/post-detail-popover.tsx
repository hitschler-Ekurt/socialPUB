"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { X, Pencil, Instagram, Video, Circle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { format, parseISO } from "@/lib/calendar-utils"
import type { CalendarPost } from "@/hooks/use-calendar-posts"

type PostDetailPopoverProps = {
  readonly post: CalendarPost
  readonly anchor: { x: number; y: number }
  readonly onClose: () => void
}

const STATUS_LABELS: Record<string, string> = {
  draft: "Entwurf",
  review: "Pruefung",
  approved: "Genehmigt",
  scheduled: "Geplant",
  published: "Veroeffentlicht",
  failed: "Fehlgeschlagen",
}

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-neutral-100 text-neutral-600",
  review: "bg-yellow-100 text-yellow-700",
  approved: "bg-blue-100 text-blue-700",
  scheduled: "bg-blue-100 text-blue-700",
  published: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
}

function getPlatformIcon(platform: string) {
  switch (platform) {
    case "instagram":
      return <Instagram className="size-4" />
    case "tiktok":
      return <Video className="size-4" />
    default:
      return <Circle className="size-4" />
  }
}

function getMediaUrl(post: CalendarPost): string | null {
  const firstMedia = post.post_media?.[0]?.media
  if (!firstMedia?.file_path) return null
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) return null
  return `${supabaseUrl}/storage/v1/object/public/media/${firstMedia.file_path}`
}

export function PostDetailPopover({ post, anchor, onClose }: PostDetailPopoverProps) {
  const router = useRouter()
  const popoverRef = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    // Delay to avoid immediate close from the triggering click
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside)
    }, 0)
    return () => {
      clearTimeout(timer)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [onClose])

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [onClose])

  const mediaUrl = getMediaUrl(post)
  const statusLabel = STATUS_LABELS[post.status] ?? post.status
  const statusColor = STATUS_COLORS[post.status] ?? STATUS_COLORS.draft
  const scheduledDate = post.scheduled_at
    ? format(parseISO(post.scheduled_at), "dd.MM.yyyy HH:mm")
    : "Nicht geplant"
  const caption = post.caption ?? ""
  const channels = post.post_channels ?? []
  const campaignName = post.campaigns?.name ?? null
  const campaignColor = post.campaigns?.color ?? null

  // Position: keep within viewport
  const popoverWidth = 320
  const popoverMaxHeight = 400
  const left = Math.min(
    Math.max(anchor.x - popoverWidth / 2, 8),
    window.innerWidth - popoverWidth - 8
  )
  const top = Math.min(
    Math.max(anchor.y + 8, 8),
    window.innerHeight - popoverMaxHeight - 8
  )

  return (
    <div
      ref={popoverRef}
      className="fixed z-50 w-[320px] rounded-lg border border-neutral-200 bg-white shadow-xl"
      style={{ left, top }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-100 px-3 py-2">
        <span className={cn("rounded px-2 py-0.5 text-xs font-medium", statusColor)}>
          {statusLabel}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="rounded p-0.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Media preview */}
      {mediaUrl && (
        <div className="border-b border-neutral-100 px-3 py-2">
          <img
            src={mediaUrl}
            alt=""
            className="w-full max-w-[200px] rounded object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="space-y-3 px-3 py-3">
        {/* Caption */}
        <p className="text-sm text-neutral-700 whitespace-pre-wrap">
          {caption || "Keine Beschreibung"}
        </p>

        {/* Schedule */}
        <div className="text-xs text-neutral-500">
          {scheduledDate}
        </div>

        {/* Campaign */}
        {campaignName && (
          <div className="flex items-center gap-1.5">
            {campaignColor && (
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: campaignColor }}
              />
            )}
            <span className="text-xs text-neutral-600">{campaignName}</span>
          </div>
        )}

        {/* Channels */}
        {channels.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {channels.map((pc) => (
              <span
                key={pc.channel_id}
                className="inline-flex items-center gap-1 rounded bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600"
              >
                {pc.channels && getPlatformIcon(pc.channels.platform)}
                {pc.channels?.name ?? pc.channel_id}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-neutral-100 px-3 py-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
        >
          Schliessen
        </Button>
        <Button
          size="sm"
          onClick={() => {
            onClose()
            router.push(`/composer?postId=${post.id}`)
          }}
        >
          <Pencil className="mr-1.5 size-3.5" />
          Bearbeiten
        </Button>
      </div>
    </div>
  )
}
