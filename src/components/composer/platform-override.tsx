"use client"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useComposerStore } from "@/stores/composer-store"
import { useChannels } from "@/hooks/use-channels"
import { PLATFORM_CHAR_LIMITS, type Platform } from "@/lib/constants/platform-limits"
import { CaptionEditor } from "./caption-editor"
import { cn } from "@/lib/utils"

export function PlatformOverride() {
  const captionOverrides = useComposerStore((s) => s.captionOverrides)
  const setCaptionOverride = useComposerStore((s) => s.setCaptionOverride)
  const removeCaptionOverride = useComposerStore((s) => s.removeCaptionOverride)
  const selectedChannelIds = useComposerStore((s) => s.selectedChannelIds)
  const hashtags = useComposerStore((s) => s.hashtags)
  const caption = useComposerStore((s) => s.caption)

  const { data: channels } = useChannels()

  // Get unique platforms from selected channels
  const selectedPlatforms = [
    ...new Set(
      (channels ?? [])
        .filter((ch) => selectedChannelIds.includes(ch.id))
        .map((ch) => ch.platform as Platform)
        .filter((p) => p in PLATFORM_CHAR_LIMITS)
    ),
  ]

  // If no channels or only one platform, just show the main editor
  if (selectedPlatforms.length <= 1) {
    return <CaptionEditor />
  }

  const hashtagsText =
    hashtags.length > 0 ? "\n\n" + hashtags.join(" ") : ""

  return (
    <Tabs defaultValue="alle">
      <TabsList>
        <TabsTrigger value="alle">Alle</TabsTrigger>
        {selectedPlatforms.map((platform) => (
          <TabsTrigger key={platform} value={platform}>
            {platform.charAt(0).toUpperCase() + platform.slice(1)}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="alle" className="pt-3">
        <CaptionEditor />
      </TabsContent>

      {selectedPlatforms.map((platform) => {
        const override = captionOverrides[platform] ?? ""
        const displayText = override || caption
        const effectiveLength = displayText.length + hashtagsText.length
        const limit = PLATFORM_CHAR_LIMITS[platform].caption
        const isOver = effectiveLength > limit

        return (
          <TabsContent key={platform} value={platform} className="space-y-2 pt-3">
            <Textarea
              value={override}
              onChange={(e) => setCaptionOverride(platform, e.target.value)}
              placeholder={override ? undefined : "Haupttext wird verwendet"}
              className={cn(
                "min-h-32 resize-y",
                !override && "text-muted-foreground"
              )}
            />
            <div className="flex items-center justify-between">
              <span
                className={cn(
                  "text-xs text-muted-foreground",
                  isOver && "font-medium text-destructive"
                )}
              >
                {effectiveLength} / {limit}
              </span>
              {override && (
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => removeCaptionOverride(platform)}
                >
                  Zuruecksetzen
                </Button>
              )}
            </div>
          </TabsContent>
        )
      })}
    </Tabs>
  )
}
