"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core"
import { arrayMove } from "@dnd-kit/sortable"
import { toast } from "sonner"
import { IdeasColumn } from "./ideas-column"
import { IdeaCard } from "./idea-card"
import { useUpdateIdea, type Idea } from "@/hooks/use-ideas"

const STATUSES = ["idea", "in_progress", "ready", "scheduled"] as const

type IdeasBoardProps = {
  readonly ideas: Idea[]
  readonly onEdit: (idea: Idea) => void
  readonly onPromote: (idea: Idea) => void
  readonly onDelete: (idea: Idea) => void
}

export function IdeasBoard({
  ideas: serverIdeas,
  onEdit,
  onPromote,
  onDelete,
}: IdeasBoardProps) {
  const [localIdeas, setLocalIdeas] = useState<Idea[]>(serverIdeas)
  const [activeId, setActiveId] = useState<string | null>(null)
  const updateIdea = useUpdateIdea()

  // Sync local state with server data
  useEffect(() => {
    setLocalIdeas(serverIdeas)
  }, [serverIdeas])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )

  const ideasByStatus = useMemo(() => {
    const grouped: Record<string, Idea[]> = {}
    for (const status of STATUSES) {
      grouped[status] = localIdeas
        .filter((idea) => idea.status === status)
        .sort((a, b) => a.position - b.position)
    }
    return grouped
  }, [localIdeas])

  const activeIdea = useMemo(
    () => localIdeas.find((i) => i.id === activeId) ?? null,
    [localIdeas, activeId]
  )

  function findColumnForItem(itemId: string): string | null {
    // Check if itemId is a status (droppable column id)
    if (STATUSES.includes(itemId as typeof STATUSES[number])) {
      return itemId
    }
    // Find the item's column
    const idea = localIdeas.find((i) => i.id === itemId)
    return idea?.status ?? null
  }

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      setActiveId(null)

      if (!over) return

      const activeItemId = active.id as string
      const overId = over.id as string

      const sourceColumn = findColumnForItem(activeItemId)
      const destColumn = findColumnForItem(overId)

      if (!sourceColumn || !destColumn) return

      const activeItem = localIdeas.find((i) => i.id === activeItemId)
      if (!activeItem) return

      // Store previous state for undo
      const previousIdeas = [...localIdeas]
      const previousStatus = activeItem.status
      const previousPosition = activeItem.position

      if (sourceColumn === destColumn) {
        // Same column reorder
        const columnItems = [...ideasByStatus[sourceColumn]]
        const oldIndex = columnItems.findIndex((i) => i.id === activeItemId)
        const overItem = columnItems.findIndex((i) => i.id === overId)

        if (oldIndex === -1 || overItem === -1 || oldIndex === overItem) return

        const reordered = arrayMove(columnItems, oldIndex, overItem)

        // Update positions
        const updatedIdeas = localIdeas.map((idea) => {
          const newIdx = reordered.findIndex((r) => r.id === idea.id)
          if (newIdx !== -1) {
            return { ...idea, position: newIdx }
          }
          return idea
        })

        setLocalIdeas(updatedIdeas)

        // Persist position updates
        reordered.forEach((item, idx) => {
          if (item.position !== idx) {
            updateIdea.mutate({ id: item.id, position: idx })
          }
        })
      } else {
        // Cross-column move
        const destItems = [...ideasByStatus[destColumn]]
        const newPosition = destItems.length

        // Optimistic update
        const updatedIdeas = localIdeas.map((idea) => {
          if (idea.id === activeItemId) {
            return {
              ...idea,
              status: destColumn as Idea["status"],
              position: newPosition,
            }
          }
          return idea
        })

        setLocalIdeas(updatedIdeas)

        // Persist
        updateIdea.mutate(
          {
            id: activeItemId,
            status: destColumn as Idea["status"],
            position: newPosition,
          },
          {
            onError: () => {
              // Revert on error
              setLocalIdeas(previousIdeas)
            },
          }
        )

        // Undo toast
        toast("Idee verschoben", {
          action: {
            label: "Rueckgaengig",
            onClick: () => {
              setLocalIdeas(previousIdeas)
              updateIdea.mutate({
                id: activeItemId,
                status: previousStatus,
                position: previousPosition,
              })
            },
          },
          duration: 5000,
        })
      }
    },
    [localIdeas, ideasByStatus, updateIdea]
  )

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STATUSES.map((status) => (
          <IdeasColumn
            key={status}
            status={status}
            ideas={ideasByStatus[status] ?? []}
            onEdit={onEdit}
            onPromote={onPromote}
            onDelete={onDelete}
            showInlineCreate={status === "idea"}
          />
        ))}
      </div>
      <DragOverlay>
        {activeIdea ? (
          <IdeaCard
            idea={activeIdea}
            onEdit={onEdit}
            onPromote={onPromote}
            onDelete={onDelete}
            isDragOverlay
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
