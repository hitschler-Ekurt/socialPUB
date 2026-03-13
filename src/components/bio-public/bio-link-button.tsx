"use client"

import type { Database } from "@/lib/supabase/types"

type BioItem = Database["public"]["Tables"]["linkinbio_items"]["Row"] & {
  links: Database["public"]["Tables"]["links"]["Row"] | null
}

type BioLinkButtonProps = {
  readonly item: BioItem
}

export function BioLinkButton({ item }: BioLinkButtonProps) {
  const displayTitle =
    item.custom_title ||
    item.links?.title ||
    item.links?.original_url ||
    "Link"

  // Use short URL for click tracking, fall back to original URL
  const href = item.links?.short_url || item.links?.original_url || "#"

  const thumbnailUrl = item.custom_image_url

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3 w-full rounded-xl border-2 border-[#E6007E]/20 bg-white px-4 py-4 text-sm font-medium text-neutral-800 transition-all hover:border-[#E6007E] hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
    >
      {thumbnailUrl && (
        <img
          src={thumbnailUrl}
          alt=""
          className="h-10 w-10 rounded-lg object-cover shrink-0"
        />
      )}
      <span className="flex-1 text-center">{displayTitle}</span>
    </a>
  )
}
