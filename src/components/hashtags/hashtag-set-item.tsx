"use client"

import { useState, useCallback } from "react"
import { ChevronDown, ChevronRight, Pencil, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useRequireRole } from "@/hooks/use-require-role"
import type { Database } from "@/lib/supabase/types"

type HashtagSet = Database["public"]["Tables"]["hashtag_sets"]["Row"]

type HashtagSetItemProps = {
  readonly hashtagSet: HashtagSet
  readonly onEdit: (set: HashtagSet) => void
  readonly onDelete: (set: HashtagSet) => void
}

const CATEGORY_STYLES: Record<string, { label: string; className: string }> = {
  brand: {
    label: "Brand",
    className: "bg-purple-100 text-purple-700 hover:bg-purple-100",
  },
  produkt: {
    label: "Produkt",
    className: "bg-blue-100 text-blue-700 hover:bg-blue-100",
  },
  kampagne: {
    label: "Kampagne",
    className: "bg-orange-100 text-orange-700 hover:bg-orange-100",
  },
}

export function HashtagSetItem({
  hashtagSet,
  onEdit,
  onDelete,
}: HashtagSetItemProps) {
  const [expanded, setExpanded] = useState(false)
  const { allowed: canEdit } = useRequireRole(["admin", "editor"])

  const toggle = useCallback(() => {
    setExpanded((prev) => !prev)
  }, [])

  const hashtags = hashtagSet.hashtags ?? []
  const preview = hashtags.slice(0, 3).join(" ")
  const categoryStyle = hashtagSet.category
    ? CATEGORY_STYLES[hashtagSet.category]
    : null

  return (
    <div className="rounded-lg border bg-white transition-shadow hover:shadow-sm">
      <button
        type="button"
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
        onClick={toggle}
      >
        {expanded ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-neutral-400" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-neutral-400" />
        )}

        <span className="min-w-0 flex-1">
          <span className="font-medium text-neutral-800">
            {hashtagSet.name}
          </span>
        </span>

        {categoryStyle && (
          <Badge variant="secondary" className={categoryStyle.className}>
            {categoryStyle.label}
          </Badge>
        )}

        <span className="shrink-0 text-sm text-neutral-400">
          {hashtags.length} {hashtags.length === 1 ? "Tag" : "Tags"}
        </span>

        {!expanded && hashtags.length > 0 && (
          <span className="hidden truncate text-sm text-neutral-400 md:block md:max-w-[200px]">
            {preview}
            {hashtags.length > 3 ? " ..." : ""}
          </span>
        )}
      </button>

      {expanded && (
        <div className="border-t px-4 py-3">
          <div className="flex flex-wrap gap-2">
            {hashtags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-neutral-100 px-2 py-0.5 text-sm text-neutral-700"
              >
                {tag}
              </span>
            ))}
          </div>

          {canEdit && (
            <div className="mt-3 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(hashtagSet)}
              >
                <Pencil className="mr-1 h-3 w-3" />
                Bearbeiten
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700"
                onClick={() => onDelete(hashtagSet)}
              >
                <Trash2 className="mr-1 h-3 w-3" />
                Loeschen
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
