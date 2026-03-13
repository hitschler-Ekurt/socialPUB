"use client"

import { useState, useCallback, useMemo } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { useUpdateMediaTags, useDeleteMedia } from "@/hooks/use-media"
import { useRequireRole } from "@/hooks/use-require-role"
import { X, Trash2, ImageIcon, Film, FileImage } from "lucide-react"
import type { Database } from "@/lib/supabase/types"

type Media = Database["public"]["Tables"]["media"]["Row"]

type MediaDetailPanelProps = {
  readonly media: Media | null
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly storageUrl: string
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const MEDIA_TYPE_ICONS = {
  image: ImageIcon,
  video: Film,
  gif: FileImage,
} as const

const MEDIA_TYPE_LABELS = {
  image: "Bild",
  video: "Video",
  gif: "GIF",
} as const

export function MediaDetailPanel({
  media,
  open,
  onOpenChange,
  storageUrl,
}: MediaDetailPanelProps) {
  const { allowed: canEdit } = useRequireRole(["admin", "editor"])
  const updateTags = useUpdateMediaTags()
  const deleteMutation = useDeleteMedia()
  const [newTag, setNewTag] = useState("")
  const [deleteOpen, setDeleteOpen] = useState(false)

  const previewSrc = useMemo(() => {
    if (!media) return ""
    return `${storageUrl}/object/public/media/${media.file_path}`
  }, [media, storageUrl])

  const TypeIcon = media ? MEDIA_TYPE_ICONS[media.media_type] : ImageIcon

  const handleAddTag = useCallback(() => {
    if (!media || !newTag.trim()) return
    const updatedTags = [...media.tags, newTag.trim()]
    updateTags.mutate({ id: media.id, tags: updatedTags })
    setNewTag("")
  }, [media, newTag, updateTags])

  const handleRemoveTag = useCallback(
    (tagToRemove: string) => {
      if (!media) return
      const updatedTags = media.tags.filter((t) => t !== tagToRemove)
      updateTags.mutate({ id: media.id, tags: updatedTags })
    },
    [media, updateTags]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault()
        handleAddTag()
      }
    },
    [handleAddTag]
  )

  const handleDelete = useCallback(() => {
    if (!media) return
    deleteMutation.mutate(media.id, {
      onSuccess: () => onOpenChange(false),
    })
  }, [media, deleteMutation, onOpenChange])

  if (!media) return null

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-[400px] overflow-y-auto sm:max-w-[400px]">
          <SheetHeader>
            <SheetTitle className="truncate">{media.file_name}</SheetTitle>
          </SheetHeader>

          <div className="mt-4 space-y-6">
            <div className="overflow-hidden rounded-lg bg-neutral-100">
              {media.media_type === "video" ? (
                <video
                  src={previewSrc}
                  controls
                  className="w-full"
                  preload="metadata"
                />
              ) : (
                <img
                  src={previewSrc}
                  alt={media.file_name}
                  className="w-full object-contain"
                />
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TypeIcon className="h-4 w-4 text-neutral-400" />
                <Badge variant="secondary">
                  {MEDIA_TYPE_LABELS[media.media_type]}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                {media.width && media.height && (
                  <div>
                    <p className="text-neutral-400">Abmessungen</p>
                    <p className="text-neutral-700">
                      {media.width} x {media.height}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-neutral-400">Dateigroesse</p>
                  <p className="text-neutral-700">
                    {formatFileSize(media.file_size)}
                  </p>
                </div>
                {media.duration_seconds && (
                  <div>
                    <p className="text-neutral-400">Dauer</p>
                    <p className="text-neutral-700">
                      {Math.round(media.duration_seconds)}s
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-neutral-400">Verwendungen</p>
                  <p className="text-neutral-700">{media.usage_count}x</p>
                </div>
                <div className="col-span-2">
                  <p className="text-neutral-400">Hochgeladen</p>
                  <p className="text-neutral-700">
                    {formatDate(media.created_at)}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-neutral-700">Tags</p>

              {media.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {media.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="gap-1 pr-1"
                    >
                      {tag}
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-0.5 rounded-full p-0.5 hover:bg-neutral-200"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
              )}

              {canEdit && (
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Tag hinzufuegen..."
                    className="h-8 text-sm"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleAddTag}
                    disabled={!newTag.trim()}
                  >
                    +
                  </Button>
                </div>
              )}
            </div>

            {canEdit && (
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Datei loeschen
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Datei loeschen"
        description="Moechtest du diese Datei wirklich loeschen? Dies kann nicht rueckgaengig gemacht werden."
        confirmLabel="Loeschen"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </>
  )
}
