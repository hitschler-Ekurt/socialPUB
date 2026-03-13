"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useMedia } from "@/hooks/use-media"
import { useComposerStore } from "@/stores/composer-store"
import { ImagePlus, X, ChevronUp, ChevronDown, Check, Play } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Database } from "@/lib/supabase/types"

type Media = Database["public"]["Tables"]["media"]["Row"]

const STORAGE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""

function getMediaUrl(media: Media): string {
  if (media.media_type === "video" && media.thumbnail_path) {
    return `${STORAGE_URL}/storage/v1/object/public/media/${media.thumbnail_path}`
  }
  return `${STORAGE_URL}/storage/v1/object/public/media/${media.file_path}`
}

export function MediaPicker() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [dialogSelection, setDialogSelection] = useState<string[]>([])

  const selectedMediaIds = useComposerStore((s) => s.selectedMediaIds)
  const setSelectedMediaIds = useComposerStore((s) => s.setSelectedMediaIds)

  const { data: mediaResponse, isLoading } = useMedia({ search: search || undefined })
  const mediaItems = mediaResponse?.data ?? []

  function handleOpen() {
    setDialogSelection([...selectedMediaIds])
    setOpen(true)
  }

  function toggleDialogItem(id: string) {
    setDialogSelection((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  function handleConfirm() {
    setSelectedMediaIds(dialogSelection)
    setOpen(false)
  }

  function handleRemove(id: string) {
    setSelectedMediaIds(selectedMediaIds.filter((i) => i !== id))
  }

  const moveItem = useCallback(
    (index: number, direction: "up" | "down") => {
      const newIds = [...selectedMediaIds]
      const targetIndex = direction === "up" ? index - 1 : index + 1
      if (targetIndex < 0 || targetIndex >= newIds.length) return
      const temp = newIds[index]
      newIds[index] = newIds[targetIndex]
      newIds[targetIndex] = temp
      setSelectedMediaIds(newIds)
    },
    [selectedMediaIds, setSelectedMediaIds]
  )

  // Build a lookup for selected media details
  const allMedia = mediaResponse?.data ?? []

  return (
    <div className="space-y-3">
      <Button variant="outline" size="sm" onClick={handleOpen}>
        <ImagePlus className="mr-1.5 size-4" />
        Medien hinzufuegen
      </Button>

      {/* Selected media thumbnails */}
      {selectedMediaIds.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedMediaIds.map((id, index) => {
            const media = allMedia.find((m) => m.id === id)
            return (
              <div
                key={id}
                className="group relative flex size-16 items-center justify-center overflow-hidden rounded-lg border bg-neutral-100"
              >
                {media && (
                  <img
                    src={getMediaUrl(media)}
                    alt={media.file_name}
                    className="size-full object-cover"
                  />
                )}
                {/* Position number */}
                <span className="absolute left-1 top-1 flex size-5 items-center justify-center rounded-full bg-black/60 text-[10px] font-medium text-white">
                  {index + 1}
                </span>
                {/* Controls */}
                <div className="absolute right-0 top-0 flex flex-col opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => moveItem(index, "up")}
                    disabled={index === 0}
                    className="rounded-bl bg-black/60 p-0.5 text-white hover:bg-black/80 disabled:opacity-30"
                  >
                    <ChevronUp className="size-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveItem(index, "down")}
                    disabled={index === selectedMediaIds.length - 1}
                    className="bg-black/60 p-0.5 text-white hover:bg-black/80 disabled:opacity-30"
                  >
                    <ChevronDown className="size-3" />
                  </button>
                </div>
                {/* Remove */}
                <button
                  type="button"
                  onClick={() => handleRemove(id)}
                  className="absolute bottom-0 right-0 rounded-tl bg-black/60 p-0.5 text-white opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100"
                >
                  <X className="size-3" />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Media picker dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Medien auswaehlen</DialogTitle>
          </DialogHeader>

          <Input
            placeholder="Medien suchen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-3"
          />

          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square animate-pulse rounded-lg bg-muted"
                  />
                ))}
              </div>
            ) : mediaItems.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Keine Medien gefunden
              </p>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {mediaItems.map((media) => {
                  const isSelected = dialogSelection.includes(media.id)
                  return (
                    <button
                      key={media.id}
                      type="button"
                      onClick={() => toggleDialogItem(media.id)}
                      className={cn(
                        "relative aspect-square overflow-hidden rounded-lg border-2 transition-colors",
                        isSelected
                          ? "border-primary"
                          : "border-transparent hover:border-neutral-300"
                      )}
                    >
                      <img
                        src={getMediaUrl(media)}
                        alt={media.file_name}
                        className="size-full object-cover"
                        loading="lazy"
                      />
                      {media.media_type === "video" && (
                        <div className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5">
                          <Play className="size-2.5 fill-white text-white" />
                        </div>
                      )}
                      {isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center bg-primary/20">
                          <div className="flex size-6 items-center justify-center rounded-full bg-primary text-white">
                            <Check className="size-3.5" />
                          </div>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <DialogFooter>
            <span className="mr-auto text-sm text-muted-foreground">
              {dialogSelection.length} ausgewaehlt
            </span>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleConfirm}>Uebernehmen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
