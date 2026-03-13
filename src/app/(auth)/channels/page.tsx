"use client"

import { useEffect, useMemo, useState } from "react"
import { Radio } from "lucide-react"
import { toast } from "sonner"
import { EntityPageHeader } from "@/components/shared/entity-page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { ChannelGrid } from "@/components/channels/channel-grid"
import { ConnectChannelDialog } from "@/components/channels/connect-channel-dialog"
import { useChannels, useChannelHealth } from "@/hooks/use-channels"
import type { ChannelHealthStatus } from "@/app/api/channels/health/route"

const EXPIRING_TOAST_KEY = "hitschies-expiring-toast-shown"

export default function ChannelsPage() {
  const [connectOpen, setConnectOpen] = useState(false)
  const { data: channels, isLoading: channelsLoading } = useChannels()
  const { data: healthData } = useChannelHealth()

  const healthMap = useMemo(() => {
    const map = new Map<string, ChannelHealthStatus>()
    if (healthData) {
      for (const item of healthData) {
        map.set(item.channelId, item.status)
      }
    }
    return map
  }, [healthData])

  // Show toast warning for expiring tokens (once per session)
  useEffect(() => {
    if (!healthData) return

    const hasExpiring = healthData.some((item) => item.status === "expiring")
    if (!hasExpiring) return

    const alreadyShown = sessionStorage.getItem(EXPIRING_TOAST_KEY)
    if (alreadyShown) return

    sessionStorage.setItem(EXPIRING_TOAST_KEY, "true")
    toast.warning("Token laeuft bald ab", {
      description:
        "Mindestens ein Kanal hat ein ablaufendes Token. Bitte verbinde den Kanal erneut.",
      duration: 8000,
    })
  }, [healthData])

  const activeChannels = useMemo(
    () => (channels ?? []).filter((c) => c.is_active !== false),
    [channels]
  )

  const isEmpty = !channelsLoading && activeChannels.length === 0

  return (
    <div className="space-y-6">
      <EntityPageHeader
        title="Kanaele"
        description="Verbinde deine Social-Media-Accounts"
        actionLabel="Kanal verbinden"
        onAction={() => setConnectOpen(true)}
      />

      {isEmpty ? (
        <EmptyState
          icon={Radio}
          title="Noch keine Kanaele verbunden"
          description="Verbinde deinen ersten Instagram- oder TikTok-Account"
          actionLabel="Ersten Kanal verbinden"
          onAction={() => setConnectOpen(true)}
        />
      ) : (
        <ChannelGrid
          channels={activeChannels}
          healthMap={healthMap}
          isLoading={channelsLoading}
        />
      )}

      <ConnectChannelDialog open={connectOpen} onOpenChange={setConnectOpen} />
    </div>
  )
}
