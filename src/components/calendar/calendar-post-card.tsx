"use client"

import { cn } from "@/lib/utils"
import { Instagram, Video, Circle } from "lucide-react"
import type { CalendarPost } from "@/hooks/use-calendar-posts"

type CalendarPostCardProps = {
  readonly post: CalendarPost
  readonly onClick?: (postId: string) => void
}

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-neutral-400",
  review: "bg-yellow-500",
  approved: "bg-blue-400",
  scheduled: "bg-blue-500",
  published: "bg-green-500",
  failed: "bg-red-500",
}

function getPlatformIcon(platform: string) {
  switch (platform) {
    case "instagram":
      return <Instagram className="size-3.5 text-neutral-500" />
    case "tiktok":
      return <Video className="size-3.5 text-neutral-500" />
    default:
      return <Circle className="size-3.5 text-neutral-500" />
  }
}

function getMediaThumbnailUrl(post: CalendarPost): string | null {
  const firstMedia = post.post_media?.[0]?.media
  if (!firstMedia?.file_path) return null

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) return null

  return `${supabaseUrl}/storage/v1/object/public/media/${firstMedia.file_path}`
}

export function CalendarPostCard({ post, onClick }: CalendarPostCardProps) {
  const thumbnailUrl = getMediaThumbnailUrl(post)
  const campaignColor = post.campaigns?.color ?? null
  const statusColor = STATUS_COLORS[post.status] ?? STATUS_COLORS.draft
  const firstChannel = post.post_channels?.[0]?.channels
  const caption = post.caption ?? ""

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onClick?.(post.id)
      }}
      className={cn(
        "flex w-full items-center gap-1.5 rounded px-1.5 py-1 text-left",
        "cursor-pointer transition-colors hover:bg-accent/50",
        "h-7 min-w-0"
      )}
      style={
        campaignColor
          ? { borderLeft: `2px solid ${campaignColor}` }
          : undefined
      }
    >
      {thumbnailUrl && (
        <img
          src={thumbnailUrl}
          alt=""
          className="size-5 shrink-0 rounded object-cover"
        />
      )}

      <span className="min-w-0 flex-1 truncate text-xs text-neutral-700">
        {caption.length > 100 ? `${caption.slice(0, 100)}...` : caption}
      </span>

      <span
        className={cn("size-2 shrink-0 rounded-full", statusColor)}
        title={post.status}
      />

      {firstChannel && getPlatformIcon(firstChannel.platform)}
    </button>
  )
}
