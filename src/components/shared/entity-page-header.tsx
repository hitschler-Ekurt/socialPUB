"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useRequireRole } from "@/hooks/use-require-role"

type EntityPageHeaderProps = {
  readonly title: string
  readonly description: string
  readonly actionLabel?: string
  readonly onAction?: () => void
}

export function EntityPageHeader({
  title,
  description,
  actionLabel,
  onAction,
}: EntityPageHeaderProps) {
  const { allowed: canCreate } = useRequireRole(["admin", "editor"])

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="font-display text-2xl font-bold text-neutral-800">
          {title}
        </h1>
        <p className="text-sm text-neutral-500">{description}</p>
      </div>
      {canCreate && actionLabel && onAction && (
        <Button onClick={onAction}>
          <Plus className="mr-2 h-4 w-4" />
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
