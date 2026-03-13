"use client"

import { Instagram } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { de } from "date-fns/locale"
import { ChannelActions } from "./channel-actions"
import type { Database } from "@/lib/supabase/types"
import type { ChannelHealthStatus } from "@/app/api/channels/health/route"

type Channel = Database["public"]["Tables"]["channels"]["Row"]

type ChannelCardProps = {
  readonly channel: Channel
  readonly healthStatus?: ChannelHealthStatus
}

const STATUS_CONFIG: Record<
  ChannelHealthStatus,
  { label: string; className: string }
> = {
  connected: {
    label: "Verbunden",
    className: "bg-green-100 text-green-800",
  },
  expiring: {
    label: "Laeuft bald ab",
    className: "bg-yellow-100 text-yellow-800",
  },
  disconnected: {
    label: "Getrennt",
    className: "bg-red-100 text-red-800",
  },
}

function PlatformIcon({ platform }: { readonly platform: string }) {
  // Use Instagram icon for instagram, a music note style for TikTok
  if (platform === "tiktok") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="currentColor"
        aria-label="TikTok"
      >
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.87a8.16 8.16 0 0 0 4.76 1.52v-3.4a4.85 4.85 0 0 1-1-.3z" />
      </svg>
    )
  }

  return <Instagram className="h-5 w-5" />
}

export function ChannelCard({ channel, healthStatus = "connected" }: ChannelCardProps) {
  const statusConfig = STATUS_CONFIG[healthStatus]

  return (
    <Card className="relative">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100">
              {channel.avatar_url ? (
                <img
                  src={channel.avatar_url}
                  alt={channel.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <PlatformIcon platform={channel.platform} />
              )}
            </div>
            <div>
              <p className="font-medium text-neutral-800">{channel.name}</p>
              <p className="text-xs capitalize text-neutral-500">
                {channel.platform}
              </p>
            </div>
          </div>
          <ChannelActions channel={channel} />
        </div>
        <div className="mt-3 flex items-center justify-between">
          <Badge className={statusConfig.className}>
            {statusConfig.label}
          </Badge>
          <span className="text-xs text-neutral-400">
            {formatDistanceToNow(new Date(channel.updated_at), {
              addSuffix: true,
              locale: de,
            })}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
