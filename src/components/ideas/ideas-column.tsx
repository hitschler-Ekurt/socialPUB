"use client"

import { useDroppable } from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { Badge } from "@/components/ui/badge"
import { IdeaCard } from "./idea-card"
import { IdeaCreateInline } from "./idea-create-inline"
import type { Idea } from "@/hooks/use-ideas"

const STATUS_LABELS: Record<string, string> = {
  idea: "Idee",
  in_progress: "In Bearbeitung",
  ready: "Bereit",
  scheduled: "Geplant",
}

type IdeasColumnProps = {
  readonly status: string
  readonly ideas: Idea[]
  readonly onEdit: (idea: Idea) => void
  readonly onPromote: (idea: Idea) => void
  readonly onDelete: (idea: Idea) => void
  readonly showInlineCreate?: boolean
}

export function IdeasColumn({
  status,
  ideas,
  onEdit,
  onPromote,
  onDelete,
  showInlineCreate = false,
}: IdeasColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status })

  const itemIds = ideas.map((idea) => idea.id)

  return (
    <div className="flex flex-col min-w-[280px] w-[280px]">
      <div className="flex items-center gap-2 px-2 py-3">
        <h3 className="text-sm font-semibold text-muted-foreground">
          {STATUS_LABELS[status] ?? status}
        </h3>
        <Badge variant="secondary" className="text-xs px-1.5 py-0">
          {ideas.length}
        </Badge>
      </div>
      <div
        ref={setNodeRef}
        className={`flex-1 rounded-lg p-2 space-y-2 min-h-[200px] transition-colors ${
          isOver
            ? "bg-accent/30 border-2 border-dashed border-accent"
            : "bg-muted/30"
        }`}
      >
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          {ideas.map((idea) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              onEdit={onEdit}
              onPromote={onPromote}
              onDelete={onDelete}
            />
          ))}
        </SortableContext>
        {ideas.length === 0 && !showInlineCreate && (
          <p className="text-xs text-muted-foreground text-center py-8">
            Keine Ideen
          </p>
        )}
        {showInlineCreate && <IdeaCreateInline />}
      </div>
    </div>
  )
}
