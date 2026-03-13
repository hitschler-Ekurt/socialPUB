"use client"

import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Music,
  ImageIcon,
} from "lucide-react"
import { PLATFORM_CHAR_LIMITS } from "@/lib/constants/platform-limits"

type TikTokPreviewProps = {
  readonly caption: string
  readonly hashtags: readonly string[]
  readonly mediaUrl: string | null
  readonly mediaType: "image" | "video"
  readonly channelName: string
  readonly channelAvatar: string | null
}

const PREVIEW_CUTOFF = PLATFORM_CHAR_LIMITS.tiktok.previewCutoff

function truncateCaption(text: string, limit: number): { text: string; truncated: boolean } {
  if (text.length <= limit) {
    return { text, truncated: false }
  }
  return { text: text.slice(0, limit), truncated: true }
}

export function TikTokPreview({
  caption,
  hashtags,
  mediaUrl,
  mediaType,
  channelName,
  channelAvatar,
}: TikTokPreviewProps) {
  const { text: displayCaption, truncated } = truncateCaption(caption, PREVIEW_CUTOFF)

  return (
    <div className="relative w-full max-w-[375px] aspect-[9/16] overflow-hidden rounded-xl bg-black">
      {/* Background Media */}
      {mediaUrl ? (
        mediaType === "image" ? (
          <img
            src={mediaUrl}
            alt="Post preview"
            className="absolute inset-0 size-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <ImageIcon className="size-16 text-white/30" />
          </div>
        )
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900" />
      )}

      {/* Right Sidebar - Icons */}
      <div className="absolute right-3 bottom-24 flex flex-col items-center gap-5">
        {/* Profile Avatar */}
        {channelAvatar ? (
          <img
            src={channelAvatar}
            alt={channelName}
            className="size-10 rounded-full border-2 border-white object-cover"
          />
        ) : (
          <div className="flex size-10 items-center justify-center rounded-full border-2 border-white bg-gray-600">
            <span className="text-xs font-semibold text-white">
              {channelName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        {/* Heart */}
        <div className="flex flex-col items-center">
          <Heart className="size-7 text-white" />
          <span className="mt-0.5 text-xs text-white">0</span>
        </div>

        {/* Comment */}
        <div className="flex flex-col items-center">
          <MessageCircle className="size-7 text-white" />
          <span className="mt-0.5 text-xs text-white">0</span>
        </div>

        {/* Bookmark */}
        <div className="flex flex-col items-center">
          <Bookmark className="size-7 text-white" />
          <span className="mt-0.5 text-xs text-white">0</span>
        </div>

        {/* Share */}
        <div className="flex flex-col items-center">
          <Share2 className="size-7 text-white" />
          <span className="mt-0.5 text-xs text-white">0</span>
        </div>
      </div>

      {/* Bottom Overlay */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3 pb-4 pt-12">
        {/* Channel Name */}
        <p className="text-sm font-semibold text-white">@{channelName}</p>

        {/* Caption */}
        <p className="mt-1 text-sm text-white">
          {displayCaption}
          {truncated && (
            <span className="text-white/60">... mehr</span>
          )}
        </p>

        {/* Hashtags */}
        {hashtags.length > 0 && (
          <p className="mt-1 text-sm text-white">
            {hashtags.map((tag) => (tag.startsWith("#") ? tag : `#${tag}`)).join(" ")}
          </p>
        )}

        {/* Music Ticker */}
        <div className="mt-2 flex items-center gap-1.5">
          <Music className="size-3.5 text-white" />
          <span className="text-xs text-white">
            Originalton - {channelName}
          </span>
        </div>
      </div>
    </div>
  )
}
