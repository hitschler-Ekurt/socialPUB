"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useChannels } from "@/hooks/use-channels"
import { useComposerStore } from "@/stores/composer-store"
import { Instagram } from "lucide-react"
import { cn } from "@/lib/utils"

function PlatformIcon({ platform }: { readonly platform: string }) {
  if (platform === "instagram") {
    return <Instagram className="size-3.5" />
  }
  // TikTok icon (lucide doesn't have one, use a text label)
  if (platform === "tiktok") {
    return (
      <span className="text-[10px] font-bold leading-none">TT</span>
    )
  }
  return null
}

export function ChannelSelector() {
  const { data: channels, isLoading } = useChannels()
  const selectedChannelIds = useComposerStore((s) => s.selectedChannelIds)
  const toggleChannel = useComposerStore((s) => s.toggleChannel)

  if (isLoading) {
    return (
      <div className="flex gap-2">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="h-8 w-32 animate-pulse rounded-lg bg-muted"
          />
        ))}
      </div>
    )
  }

  if (!channels?.length) {
    return (
      <p className="text-sm text-muted-foreground">
        Keine Kanaele verbunden. Verbinde einen Kanal in den Einstellungen.
      </p>
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      {channels.map((channel) => {
        const isSelected = selectedChannelIds.includes(channel.id)
        return (
          <Button
            key={channel.id}
            variant={isSelected ? "default" : "outline"}
            size="sm"
            onClick={() => toggleChannel(channel.id)}
            className={cn("gap-2")}
          >
            <Avatar className="size-5" size="sm">
              {channel.avatar_url && (
                <AvatarImage src={channel.avatar_url} alt={channel.name} />
              )}
              <AvatarFallback>
                {channel.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span>{channel.name}</span>
            <PlatformIcon platform={channel.platform} />
          </Button>
        )
      })}
    </div>
  )
}
