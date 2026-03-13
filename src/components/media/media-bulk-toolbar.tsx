"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { useBulkDeleteMedia, useBulkTagMedia } from "@/hooks/use-media"
import { Tags, Trash2 } from "lucide-react"
import type { Database } from "@/lib/supabase/types"

type Media = Database["public"]["Tables"]["media"]["Row"]

type MediaBulkToolbarProps = {
  readonly selectedIds: Set<string>
  readonly mediaItems: Media[]
  readonly onClearSelection: () => void
}

export function MediaBulkToolbar({
  selectedIds,
  mediaItems,
  onClearSelection,
}: MediaBulkToolbarProps) {
  const bulkDelete = useBulkDeleteMedia()
  const bulkTag = useBulkTagMedia()
  const [tagDialogOpen, setTagDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [tagInput, setTagInput] = useState("")

  const count = selectedIds.size

  const handleBulkDelete = useCallback(() => {
    bulkDelete.mutate(Array.from(selectedIds), {
      onSuccess: () => onClearSelection(),
    })
  }, [selectedIds, bulkDelete, onClearSelection])

  const handleBulkTag = useCallback(() => {
    const tags = tagInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)

    if (tags.length === 0) return

    const existingTagsMap: Record<string, string[]> = {}
    for (const id of selectedIds) {
      const item = mediaItems.find((m) => m.id === id)
      existingTagsMap[id] = item?.tags ?? []
    }

    bulkTag.mutate(
      { ids: Array.from(selectedIds), tags, existingTagsMap },
      {
        onSuccess: () => {
          setTagDialogOpen(false)
          setTagInput("")
          onClearSelection()
        },
      }
    )
  }, [selectedIds, tagInput, mediaItems, bulkTag, onClearSelection])

  if (count === 0) return null

  return (
    <>
      <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-lg border bg-white px-4 py-3 shadow-lg">
        <span className="text-sm font-medium text-neutral-700">
          {count} ausgewaehlt
        </span>

        <Button
          size="sm"
          variant="outline"
          onClick={() => setTagDialogOpen(true)}
        >
          <Tags className="mr-1.5 h-4 w-4" />
          Tags hinzufuegen
        </Button>

        <Button
          size="sm"
          variant="destructive"
          onClick={() => setDeleteDialogOpen(true)}
        >
          <Trash2 className="mr-1.5 h-4 w-4" />
          Loeschen
        </Button>

        <Button size="sm" variant="ghost" onClick={onClearSelection}>
          Abbrechen
        </Button>
      </div>

      <Dialog open={tagDialogOpen} onOpenChange={setTagDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Tags hinzufuegen</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <p className="text-sm text-neutral-500">
              Tags werden zu {count} {count === 1 ? "Datei" : "Dateien"}{" "}
              hinzugefuegt (kommagetrennt)
            </p>
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="z.B. produkt, sommer, kampagne"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleBulkTag()
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setTagDialogOpen(false)}
            >
              Abbrechen
            </Button>
            <Button
              onClick={handleBulkTag}
              disabled={!tagInput.trim() || bulkTag.isPending}
            >
              {bulkTag.isPending ? "Speichern..." : "Hinzufuegen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={`${count} ${count === 1 ? "Datei" : "Dateien"} loeschen`}
        description={`Moechtest du ${count} ${count === 1 ? "Datei" : "Dateien"} wirklich loeschen? Dies kann nicht rueckgaengig gemacht werden.`}
        confirmLabel="Loeschen"
        onConfirm={handleBulkDelete}
        variant="destructive"
      />
    </>
  )
}
