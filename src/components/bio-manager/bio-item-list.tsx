"use client"

import { useState, useMemo, useCallback } from "react"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable"
import {
  useAddBioItem,
  useReorderBioItems,
  useRemoveBioItem,
  useUpdateBioItem,
} from "@/hooks/use-bio-items"
import { useLinks } from "@/hooks/use-links"
import { BioItemCard } from "./bio-item-card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { Plus, Search } from "lucide-react"
import type { Database } from "@/lib/supabase/types"

type BioItem = Database["public"]["Tables"]["linkinbio_items"]["Row"] & {
  links: Database["public"]["Tables"]["links"]["Row"] | null
}

type BioItemListProps = {
  readonly pageId: string
  readonly items: readonly BioItem[]
}

export function BioItemList({ pageId, items }: BioItemListProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [removeTarget, setRemoveTarget] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const { data: allLinks } = useLinks()
  const addBioItem = useAddBioItem()
  const reorderBioItems = useReorderBioItems()
  const removeBioItem = useRemoveBioItem()
  const updateBioItem = useUpdateBioItem()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => a.position - b.position),
    [items]
  )

  const itemIds = useMemo(
    () => sortedItems.map((item) => item.id),
    [sortedItems]
  )

  const activeItem = useMemo(
    () => sortedItems.find((item) => item.id === activeId) ?? null,
    [sortedItems, activeId]
  )

  // Filter links not already added to bio page
  const existingLinkIds = useMemo(
    () => new Set(items.map((item) => item.link_id)),
    [items]
  )

  const availableLinks = useMemo(() => {
    if (!allLinks) return []
    const lowerQuery = searchQuery.toLowerCase()
    return allLinks
      .filter((link) => !existingLinkIds.has(link.id))
      .filter((link) => {
        if (!lowerQuery) return true
        const matchesTitle = link.title?.toLowerCase().includes(lowerQuery)
        const matchesUrl = link.original_url.toLowerCase().includes(lowerQuery)
        return matchesTitle || matchesUrl
      })
  }, [allLinks, existingLinkIds, searchQuery])

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      setActiveId(null)

      if (!over || active.id === over.id) return

      const oldIndex = sortedItems.findIndex((i) => i.id === active.id)
      const newIndex = sortedItems.findIndex((i) => i.id === over.id)

      if (oldIndex === -1 || newIndex === -1) return

      const reordered = arrayMove(sortedItems, oldIndex, newIndex)
      const reorderPayload = reordered.map((item, idx) => ({
        id: item.id,
        position: idx,
      }))

      reorderBioItems.mutate({ pageId, items: reorderPayload })
    },
    [sortedItems, pageId, reorderBioItems]
  )

  function handleAddLink(linkId: string) {
    const nextPosition = items.length
    addBioItem.mutate({ pageId, linkId, position: nextPosition })
    setAddDialogOpen(false)
    setSearchQuery("")
  }

  function handleRemoveConfirm() {
    if (removeTarget) {
      removeBioItem.mutate({ pageId, itemId: removeTarget })
      setRemoveTarget(null)
    }
  }

  function handleToggleVisibility(itemId: string, isVisible: boolean) {
    updateBioItem.mutate({ pageId, itemId, isVisible })
  }

  function handleUpdateItem(
    itemId: string,
    data: { customTitle?: string | null; expiresAt?: string | null }
  ) {
    updateBioItem.mutate({ pageId, itemId, ...data })
  }

  function isExpired(expiresAt: string | null | undefined): boolean {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-2">
          <SortableContext
            items={itemIds}
            strategy={verticalListSortingStrategy}
          >
            {sortedItems.map((item) => (
              <BioItemCard
                key={item.id}
                item={item}
                isExpired={isExpired(item.expires_at)}
                onRemove={() => setRemoveTarget(item.id)}
                onToggleVisibility={(visible) =>
                  handleToggleVisibility(item.id, visible)
                }
                onUpdate={(data) => handleUpdateItem(item.id, data)}
              />
            ))}
          </SortableContext>

          {sortedItems.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              Noch keine Links hinzugefuegt
            </p>
          )}

          <Button
            variant="outline"
            className="w-full"
            onClick={() => setAddDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Link hinzufuegen
          </Button>
        </div>

        <DragOverlay>
          {activeItem ? (
            <BioItemCard
              item={activeItem}
              isExpired={isExpired(activeItem.expires_at)}
              onRemove={() => {}}
              onToggleVisibility={() => {}}
              onUpdate={() => {}}
              isDragOverlay
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Add link dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link hinzufuegen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Link suchen..."
                className="pl-9"
              />
            </div>
            <div className="max-h-[300px] overflow-y-auto space-y-1">
              {availableLinks.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Keine verfuegbaren Links gefunden
                </p>
              )}
              {availableLinks.map((link) => (
                <button
                  key={link.id}
                  type="button"
                  className="w-full text-left rounded-md px-3 py-2 hover:bg-accent transition-colors"
                  onClick={() => handleAddLink(link.id)}
                >
                  <p className="text-sm font-medium truncate">
                    {link.title || link.original_url}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {link.short_url || link.original_url}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Remove confirmation */}
      <ConfirmDialog
        open={!!removeTarget}
        onOpenChange={(open) => {
          if (!open) setRemoveTarget(null)
        }}
        title="Link entfernen?"
        description="Der Link wird von der Bio-Seite entfernt. Der Link selbst bleibt in der Link-Bibliothek erhalten."
        confirmLabel="Entfernen"
        onConfirm={handleRemoveConfirm}
        variant="destructive"
      />
    </>
  )
}
