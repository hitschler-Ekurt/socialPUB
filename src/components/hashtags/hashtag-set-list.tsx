"use client"

import { useMemo } from "react"
import { Hash } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/shared/empty-state"
import { HashtagSetItem } from "./hashtag-set-item"
import type { Database } from "@/lib/supabase/types"

type HashtagSet = Database["public"]["Tables"]["hashtag_sets"]["Row"]

type HashtagSetListProps = {
  readonly hashtagSets: HashtagSet[] | undefined
  readonly isLoading: boolean
  readonly onEdit: (set: HashtagSet) => void
  readonly onDelete: (set: HashtagSet) => void
  readonly onCreateFirst: () => void
}

type GroupedSets = {
  readonly label: string
  readonly key: string
  readonly sets: HashtagSet[]
}

const GROUP_ORDER: { key: string; label: string }[] = [
  { key: "brand", label: "Brand" },
  { key: "produkt", label: "Produkt" },
  { key: "kampagne", label: "Kampagne" },
  { key: "uncategorized", label: "Unkategorisiert" },
]

function HashtagSetSkeleton() {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-5 w-32" />
        <Skeleton className="ml-auto h-5 w-16" />
      </div>
    </div>
  )
}

function groupByCategory(sets: HashtagSet[]): GroupedSets[] {
  const grouped = new Map<string, HashtagSet[]>()

  for (const set of sets) {
    const key = set.category ?? "uncategorized"
    const existing = grouped.get(key) ?? []
    grouped.set(key, [...existing, set])
  }

  return GROUP_ORDER
    .filter((g) => grouped.has(g.key))
    .map((g) => ({
      label: g.label,
      key: g.key,
      sets: grouped.get(g.key)!,
    }))
}

export function HashtagSetList({
  hashtagSets,
  isLoading,
  onEdit,
  onDelete,
  onCreateFirst,
}: HashtagSetListProps) {
  const groups = useMemo(
    () => (hashtagSets ? groupByCategory(hashtagSets) : []),
    [hashtagSets]
  )

  if (isLoading) {
    return (
      <div className="space-y-3">
        <HashtagSetSkeleton />
        <HashtagSetSkeleton />
        <HashtagSetSkeleton />
      </div>
    )
  }

  if (!hashtagSets || hashtagSets.length === 0) {
    return (
      <EmptyState
        icon={Hash}
        title="Noch keine Hashtag-Sets"
        description="Erstelle Sets fuer haeufig verwendete Hashtags"
        actionLabel="Erstes Set erstellen"
        onAction={onCreateFirst}
      />
    )
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <div key={group.key}>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-400">
            {group.label}
          </h3>
          <div className="space-y-2">
            {group.sets.map((set) => (
              <HashtagSetItem
                key={set.id}
                hashtagSet={set}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
