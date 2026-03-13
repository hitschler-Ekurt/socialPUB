"use client"

import { useCallback, useRef, useState } from "react"
import { EntityPageHeader } from "@/components/shared/entity-page-header"
import { MediaUploadZone } from "@/components/media/media-upload-zone"
import { MediaFilterBar } from "@/components/media/media-filter-bar"
import { MediaGrid } from "@/components/media/media-grid"
import { MediaDetailPanel } from "@/components/media/media-detail-panel"
import { MediaBulkToolbar } from "@/components/media/media-bulk-toolbar"
import { useMedia } from "@/hooks/use-media"
import type { Database } from "@/lib/supabase/types"

type Media = Database["public"]["Tables"]["media"]["Row"]

const STORAGE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""

export default function MediaPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Filter state
  const [mediaType, setMediaType] = useState<string | undefined>(undefined)
  const [search, setSearch] = useState<string | undefined>(undefined)
  const [page, setPage] = useState(1)

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Detail panel state
  const [detailMedia, setDetailMedia] = useState<Media | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  // Fetch media
  const filters = {
    media_type: mediaType as "image" | "video" | "gif" | undefined,
    search,
    page,
  }
  const { data: response, isLoading } = useMedia(filters)

  const mediaItems = response?.data ?? []
  const pagination = response?.pagination ?? null

  // Handlers
  const handleMediaTypeChange = useCallback((value: string | undefined) => {
    setMediaType(value)
    setPage(1)
  }, [])

  const handleSearchChange = useCallback((value: string | undefined) => {
    setSearch(value)
    setPage(1)
  }, [])

  const handleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const handleClick = useCallback((media: Media) => {
    setDetailMedia(media)
    setDetailOpen(true)
  }, [])

  const handleClearSelection = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  return (
    <div className="space-y-6">
      <MediaUploadZone />

      <EntityPageHeader
        title="Media Library"
        description="Verwalte Bilder und Videos fuer deine Posts"
      />

      <MediaFilterBar
        mediaType={mediaType}
        search={search}
        onMediaTypeChange={handleMediaTypeChange}
        onSearchChange={handleSearchChange}
      />

      <MediaGrid
        media={mediaItems}
        isLoading={isLoading}
        selectedIds={selectedIds}
        onSelect={handleSelect}
        onClick={handleClick}
        pagination={pagination}
        onPageChange={setPage}
        onUploadClick={handleUploadClick}
        storageUrl={STORAGE_URL}
      />

      <MediaDetailPanel
        media={detailMedia}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        storageUrl={STORAGE_URL}
      />

      <MediaBulkToolbar
        selectedIds={selectedIds}
        mediaItems={mediaItems}
        onClearSelection={handleClearSelection}
      />

      {/* Hidden file input for empty state CTA */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        className="hidden"
      />
    </div>
  )
}
