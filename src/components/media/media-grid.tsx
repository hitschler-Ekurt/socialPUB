"use client"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/shared/empty-state"
import { MediaCard } from "./media-card"
import { ImageIcon, ChevronLeft, ChevronRight } from "lucide-react"
import type { Database } from "@/lib/supabase/types"

type Media = Database["public"]["Tables"]["media"]["Row"]

type MediaGridProps = {
  readonly media: Media[]
  readonly isLoading: boolean
  readonly selectedIds: Set<string>
  readonly onSelect: (id: string) => void
  readonly onClick: (media: Media) => void
  readonly pagination: { page: number; limit: number; total: number } | null
  readonly onPageChange: (page: number) => void
  readonly onUploadClick: () => void
  readonly storageUrl: string
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <Skeleton key={i} className="aspect-square rounded-lg" />
      ))}
    </div>
  )
}

export function MediaGrid({
  media,
  isLoading,
  selectedIds,
  onSelect,
  onClick,
  pagination,
  onPageChange,
  onUploadClick,
  storageUrl,
}: MediaGridProps) {
  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (media.length === 0) {
    return (
      <EmptyState
        icon={ImageIcon}
        title="Noch keine Medien hochgeladen"
        description="Lade Bilder und Videos hoch um sie in Posts zu verwenden"
        actionLabel="Erste Datei hochladen"
        onAction={onUploadClick}
      />
    )
  }

  const totalPages = pagination
    ? Math.ceil(pagination.total / pagination.limit)
    : 1
  const currentPage = pagination?.page ?? 1

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {media.map((item) => (
          <MediaCard
            key={item.id}
            media={item}
            selected={selectedIds.has(item.id)}
            onSelect={onSelect}
            onClick={onClick}
            storageUrl={storageUrl}
          />
        ))}
      </div>

      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
            Zurueck
          </Button>
          <span className="text-sm text-neutral-500">
            Seite {currentPage} von {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
          >
            Weiter
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
