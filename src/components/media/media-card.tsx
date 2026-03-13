"use client"

import { Play } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import type { Database } from "@/lib/supabase/types"

type Media = Database["public"]["Tables"]["media"]["Row"]

type MediaCardProps = {
  readonly media: Media
  readonly selected: boolean
  readonly onSelect: (id: string) => void
  readonly onClick: (media: Media) => void
  readonly storageUrl: string
}

export function MediaCard({
  media,
  selected,
  onSelect,
  onClick,
  storageUrl,
}: MediaCardProps) {
  const thumbnailSrc =
    media.media_type === "video" && media.thumbnail_path
      ? `${storageUrl}/object/public/media/${media.thumbnail_path}`
      : `${storageUrl}/object/public/media/${media.file_path}`

  const dimensions =
    media.width && media.height ? `${media.width}x${media.height}` : null

  function handleClick(e: React.MouseEvent) {
    // If clicking the checkbox area, don't open detail panel
    if ((e.target as HTMLElement).closest("[data-checkbox]")) return
    onClick(media)
  }

  function handleCheckboxChange() {
    onSelect(media.id)
  }

  return (
    <div
      onClick={handleClick}
      className="group relative cursor-pointer overflow-hidden rounded-lg bg-neutral-100"
    >
      <div className="aspect-square">
        <img
          src={thumbnailSrc}
          alt={media.file_name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Video indicator */}
      {media.media_type === "video" && (
        <div className="absolute right-2 top-2 rounded-full bg-black/60 p-1">
          <Play className="h-3 w-3 fill-white text-white" />
        </div>
      )}

      {/* Checkbox */}
      <div
        data-checkbox
        className={`absolute left-2 top-2 transition-opacity ${
          selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      >
        <Checkbox
          checked={selected}
          onCheckedChange={handleCheckboxChange}
          className="h-5 w-5 border-2 border-white bg-white/80 shadow-sm"
        />
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/70 to-transparent p-2 transition-transform group-hover:translate-y-0">
        <p className="truncate text-xs font-medium text-white">
          {media.file_name}
        </p>
        {dimensions && (
          <p className="text-[10px] text-white/70">{dimensions}</p>
        )}
      </div>

      {/* Usage count badge */}
      {media.usage_count > 0 && (
        <div className="absolute bottom-2 right-2">
          <Badge
            variant="secondary"
            className="bg-black/60 text-[10px] text-white hover:bg-black/60"
          >
            {media.usage_count}x verwendet
          </Badge>
        </div>
      )}
    </div>
  )
}
