"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { MoreHorizontal, Pencil, ArrowUpRight, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import type { Idea } from "@/hooks/use-ideas"

type IdeaCardProps = {
  readonly idea: Idea
  readonly onEdit: (idea: Idea) => void
  readonly onPromote: (idea: Idea) => void
  readonly onDelete: (idea: Idea) => void
  readonly isDragOverlay?: boolean
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Heute"
  if (diffDays === 1) return "Gestern"
  if (diffDays < 7) return `vor ${diffDays} Tagen`
  if (diffDays < 30) return `vor ${Math.floor(diffDays / 7)} Wo.`
  return date.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" })
}

export function IdeaCard({
  idea,
  onEdit,
  onPromote,
  onDelete,
  isDragOverlay = false,
}: IdeaCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: idea.id,
    disabled: isDragOverlay,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="group rounded-lg border bg-card p-3 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-snug truncate">
            {idea.title}
          </p>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={(props) => (
                <Button
                  {...props}
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation()
                    props.onClick?.(e)
                  }}
                  onPointerDown={(e) => {
                    e.stopPropagation()
                    props.onPointerDown?.(e)
                  }}
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              )}
            />
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(idea)
                }}
              >
                <Pencil className="mr-2 h-3.5 w-3.5" />
                Bearbeiten
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onPromote(idea)
                }}
              >
                <ArrowUpRight className="mr-2 h-3.5 w-3.5" />
                Zu Post umwandeln
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(idea)
                }}
              >
                <Trash2 className="mr-2 h-3.5 w-3.5" />
                Loeschen
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
        {idea.campaigns && (
          <span className="flex items-center gap-1">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: idea.campaigns.color }}
            />
            <span className="truncate max-w-[100px]">
              {idea.campaigns.name}
            </span>
          </span>
        )}
        {idea.profiles && (
          <span
            className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] font-medium shrink-0"
            title={idea.profiles.full_name}
          >
            {idea.profiles.avatar_url ? (
              <img
                src={idea.profiles.avatar_url}
                alt={idea.profiles.full_name}
                className="h-5 w-5 rounded-full object-cover"
              />
            ) : (
              idea.profiles.full_name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()
            )}
          </span>
        )}
        <span className="ml-auto shrink-0">
          {formatRelativeDate(idea.created_at)}
        </span>
      </div>
    </div>
  )
}
