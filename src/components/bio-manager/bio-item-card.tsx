"use client"

import { useState } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Eye, EyeOff, Trash2, Pencil, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Database } from "@/lib/supabase/types"

type BioItem = Database["public"]["Tables"]["linkinbio_items"]["Row"] & {
  links: Database["public"]["Tables"]["links"]["Row"] | null
}

type BioItemCardProps = {
  readonly item: BioItem
  readonly isExpired: boolean
  readonly onRemove: () => void
  readonly onToggleVisibility: (visible: boolean) => void
  readonly onUpdate: (data: {
    customTitle?: string | null
    expiresAt?: string | null
  }) => void
  readonly isDragOverlay?: boolean
}

export function BioItemCard({
  item,
  isExpired,
  onRemove,
  onToggleVisibility,
  onUpdate,
  isDragOverlay = false,
}: BioItemCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(item.custom_title ?? "")
  const [editExpires, setEditExpires] = useState(
    item.expires_at ? item.expires_at.slice(0, 16) : ""
  )

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
    disabled: isDragOverlay,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const displayTitle =
    item.custom_title || item.links?.title || item.links?.original_url || "Unbenannter Link"
  const shortUrl = item.links?.short_url || item.links?.original_url || ""

  function handleSaveEdit() {
    onUpdate({
      customTitle: editTitle || null,
      expiresAt: editExpires ? new Date(editExpires).toISOString() : null,
    })
    setIsEditing(false)
  }

  function handleCancelEdit() {
    setEditTitle(item.custom_title ?? "")
    setEditExpires(item.expires_at ? item.expires_at.slice(0, 16) : "")
    setIsEditing(false)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-2 rounded-lg border p-3 transition-colors ${
        isExpired ? "bg-muted/50 opacity-60" : "bg-card"
      } ${isDragOverlay ? "shadow-lg" : ""}`}
    >
      {/* Drag handle */}
      <button
        type="button"
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground shrink-0"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <div className="space-y-2">
            <div className="space-y-1">
              <Label className="text-xs">Titel</Label>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Eigener Titel (optional)"
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Ablaufdatum</Label>
              <Input
                type="datetime-local"
                value={editExpires}
                onChange={(e) => setEditExpires(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="default"
                className="h-7 text-xs"
                onClick={handleSaveEdit}
              >
                Speichern
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs"
                onClick={handleCancelEdit}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium truncate">{displayTitle}</p>
              {isExpired && (
                <Badge variant="secondary" className="text-xs shrink-0 bg-amber-100 text-amber-800">
                  Abgelaufen
                </Badge>
              )}
              {!item.is_visible && !isExpired && (
                <Badge variant="secondary" className="text-xs shrink-0">
                  Verborgen
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">{shortUrl}</p>
            {item.expires_at && !isExpired && (
              <p className="text-xs text-muted-foreground">
                Laeuft ab:{" "}
                {new Date(item.expires_at).toLocaleDateString("de-DE", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}
          </>
        )}
      </div>

      {/* Actions */}
      {!isEditing && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setIsEditing(true)}
            title="Bearbeiten"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onToggleVisibility(!item.is_visible)}
            title={item.is_visible ? "Verbergen" : "Anzeigen"}
          >
            {item.is_visible ? (
              <Eye className="h-3.5 w-3.5" />
            ) : (
              <EyeOff className="h-3.5 w-3.5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={onRemove}
            title="Entfernen"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  )
}
