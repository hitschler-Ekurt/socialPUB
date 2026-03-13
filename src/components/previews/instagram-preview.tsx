"use client"

import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  ImageIcon,
} from "lucide-react"
import { PLATFORM_CHAR_LIMITS } from "@/lib/constants/platform-limits"

type InstagramPreviewProps = {
  readonly caption: string
  readonly hashtags: readonly string[]
  readonly mediaUrl: string | null
  readonly mediaType: "image" | "video"
  readonly channelName: string
  readonly channelAvatar: string | null
}

const PREVIEW_CUTOFF = PLATFORM_CHAR_LIMITS.instagram.previewCutoff

function truncateCaption(text: string, limit: number): { text: string; truncated: boolean } {
  if (text.length <= limit) {
    return { text, truncated: false }
  }
  return { text: text.slice(0, limit), truncated: true }
}

export function InstagramPreview({
  caption,
  hashtags,
  mediaUrl,
  mediaType,
  channelName,
  channelAvatar,
}: InstagramPreviewProps) {
  const { text: displayCaption, truncated } = truncateCaption(caption, PREVIEW_CUTOFF)

  return (
    <div className="w-full max-w-[375px] overflow-hidden rounded-xl bg-white shadow-md">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2">
        {channelAvatar ? (
          <img
            src={channelAvatar}
            alt={channelName}
            className="size-8 rounded-full object-cover"
          />
        ) : (
          <div className="flex size-8 items-center justify-center rounded-full bg-gray-200">
            <span className="text-xs font-semibold text-gray-500">
              {channelName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <span className="flex-1 text-sm font-semibold text-gray-900">{channelName}</span>
        <MoreHorizontal className="size-5 text-gray-600" />
      </div>

      {/* Media Area - 4:5 aspect ratio */}
      <div className="aspect-[4/5] w-full bg-gray-100">
        {mediaUrl ? (
          mediaType === "image" ? (
            <img
              src={mediaUrl}
              alt="Post preview"
              className="size-full object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-gray-900">
              <div className="flex flex-col items-center gap-2 text-white">
                <ImageIcon className="size-12 opacity-60" />
                <span className="text-xs opacity-60">Video</span>
              </div>
            </div>
          )
        ) : (
          <div className="flex size-full items-center justify-center">
            <ImageIcon className="size-12 text-gray-300" />
          </div>
        )}
      </div>

      {/* Action Row */}
      <div className="flex items-center px-3 py-2">
        <div className="flex flex-1 gap-3">
          <Heart className="size-6 text-gray-900" />
          <MessageCircle className="size-6 text-gray-900" />
          <Send className="size-6 text-gray-900" />
        </div>
        <Bookmark className="size-6 text-gray-900" />
      </div>

      {/* Caption Area */}
      <div className="px-3 pb-2">
        <p className="text-sm text-gray-900">
          <span className="font-semibold">{channelName}</span>{" "}
          {displayCaption}
          {truncated && (
            <span className="text-gray-400">... mehr</span>
          )}
        </p>

        {/* Hashtags */}
        {hashtags.length > 0 && (
          <p className="mt-1 text-sm text-[#1877F2]">
            {hashtags.map((tag) => (tag.startsWith("#") ? tag : `#${tag}`)).join(" ")}
          </p>
        )}
      </div>
    </div>
  )
}
