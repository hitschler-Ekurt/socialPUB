"use client"

import type { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

type EmptyStateProps = {
  readonly icon: LucideIcon
  readonly title: string
  readonly description: string
  readonly actionLabel?: string
  readonly onAction?: () => void
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary-50">
        <Icon className="h-10 w-10 text-primary-500" />
      </div>
      <h2 className="mb-2 font-display text-xl font-bold text-neutral-800">
        {title}
      </h2>
      <p className="mb-6 max-w-md text-sm text-neutral-500">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  )
}
