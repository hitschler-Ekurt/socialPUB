"use client"

import { Target } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/shared/empty-state"
import { CampaignCard } from "./campaign-card"
import type { Database } from "@/lib/supabase/types"

type Campaign = Database["public"]["Tables"]["campaigns"]["Row"] & {
  post_count: number
}

type CampaignGridProps = {
  readonly campaigns: Campaign[] | undefined
  readonly isLoading: boolean
  readonly onEdit: (campaign: Campaign) => void
  readonly onDelete: (campaign: Campaign) => void
  readonly onCreateFirst: () => void
}

function CampaignSkeleton() {
  return (
    <div className="rounded-lg border p-4" style={{ borderLeft: "4px solid #e5e5e5" }}>
      <Skeleton className="mb-2 h-5 w-32" />
      <Skeleton className="mb-2 h-4 w-48" />
      <Skeleton className="h-4 w-20" />
    </div>
  )
}

export function CampaignGrid({
  campaigns,
  isLoading,
  onEdit,
  onDelete,
  onCreateFirst,
}: CampaignGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <CampaignSkeleton />
        <CampaignSkeleton />
        <CampaignSkeleton />
      </div>
    )
  }

  if (!campaigns || campaigns.length === 0) {
    return (
      <EmptyState
        icon={Target}
        title="Noch keine Kampagnen"
        description="Erstelle deine erste Kampagne um Posts zu organisieren"
        actionLabel="Erste Kampagne erstellen"
        onAction={onCreateFirst}
      />
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {campaigns.map((campaign) => (
        <CampaignCard
          key={campaign.id}
          campaign={campaign}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
