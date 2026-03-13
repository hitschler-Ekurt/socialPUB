"use client"

import { useMemo } from "react"
import type { Database } from "@/lib/supabase/types"

type BioPage = Database["public"]["Tables"]["linkinbio_pages"]["Row"]
type BioItem = Database["public"]["Tables"]["linkinbio_items"]["Row"] & {
  links: Database["public"]["Tables"]["links"]["Row"] | null
}

type BioPreviewProps = {
  readonly bioPage: BioPage
  readonly items: readonly BioItem[]
}

function isItemVisible(item: BioItem): boolean {
  if (!item.is_visible) return false
  if (item.expires_at && new Date(item.expires_at) < new Date()) return false
  return true
}

export function BioPreview({ bioPage, items }: BioPreviewProps) {
  const visibleItems = useMemo(
    () =>
      [...items]
        .filter(isItemVisible)
        .sort((a, b) => a.position - b.position),
    [items]
  )

  return (
    <div className="mx-auto max-w-sm rounded-2xl border-2 border-muted bg-white shadow-sm overflow-hidden">
      {/* Phone-like frame */}
      <div className="px-6 py-8 space-y-6">
        {/* Logo */}
        {bioPage.logo_url ? (
          <div className="flex justify-center">
            <img
              src={bioPage.logo_url}
              alt={bioPage.title}
              className="h-16 w-16 rounded-full object-cover"
            />
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-[#E6007E] flex items-center justify-center text-white font-bold text-xl">
              {bioPage.title.charAt(0).toUpperCase()}
            </div>
          </div>
        )}

        {/* Title & description */}
        <div className="text-center space-y-1">
          <h3 className="text-xl font-bold text-neutral-800">
            {bioPage.title}
          </h3>
          {bioPage.description && (
            <p className="text-sm text-neutral-500">{bioPage.description}</p>
          )}
        </div>

        {/* Link buttons */}
        <div className="space-y-3">
          {visibleItems.map((item) => {
            const displayTitle =
              item.custom_title ||
              item.links?.title ||
              item.links?.original_url ||
              "Link"
            const shortUrl =
              item.links?.short_url || item.links?.original_url || "#"

            return (
              <a
                key={item.id}
                href={shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full rounded-xl border-2 border-[#E6007E]/20 bg-white px-4 py-4 text-center text-sm font-medium text-neutral-800 transition-all hover:border-[#E6007E] hover:shadow-md hover:scale-[1.02]"
              >
                {displayTitle}
              </a>
            )
          })}

          {visibleItems.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Keine sichtbaren Links
            </p>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-neutral-400 pt-4">
          Powered by hitschies Publisher
        </p>
      </div>
    </div>
  )
}
