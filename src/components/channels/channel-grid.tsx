"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { ChannelCard } from "./channel-card"
import type { Database } from "@/lib/supabase/types"
import type { ChannelHealthStatus } from "@/app/api/channels/health/route"

type Channel = Database["public"]["Tables"]["channels"]["Row"]

type ChannelGridProps = {
  readonly channels: Channel[]
  readonly healthMap: Map<string, ChannelHealthStatus>
  readonly isLoading: boolean
}

function ChannelCardSkeleton() {
  return (
    <div className="rounded-xl border p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div>
            <Skeleton className="mb-1 h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <Skeleton className="h-8 w-8" />
      </div>
      <div className="mt-3 flex items-center justify-between">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  )
}

export function ChannelGrid({ channels, healthMap, isLoading }: ChannelGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <ChannelCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {channels.map((channel) => (
        <ChannelCard
          key={channel.id}
          channel={channel}
          healthStatus={healthMap.get(channel.id) ?? "connected"}
        />
      ))}
    </div>
  )
}
