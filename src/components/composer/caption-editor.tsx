"use client"

import { Textarea } from "@/components/ui/textarea"
import { useComposerStore } from "@/stores/composer-store"
import { PLATFORM_CHAR_LIMITS, type Platform } from "@/lib/constants/platform-limits"
import { cn } from "@/lib/utils"

type CaptionEditorProps = {
  readonly platform?: Platform
  readonly value?: string
  readonly onChange?: (value: string) => void
  readonly placeholder?: string
}

export function CaptionEditor({
  platform,
  value,
  onChange,
  placeholder = "Caption schreiben...",
}: CaptionEditorProps) {
  const caption = useComposerStore((s) => s.caption)
  const setCaption = useComposerStore((s) => s.setCaption)
  const hashtags = useComposerStore((s) => s.hashtags)
  const selectedChannelIds = useComposerStore((s) => s.selectedChannelIds)

  const displayValue = value ?? caption
  const handleChange = onChange ?? setCaption

  const hashtagsText =
    hashtags.length > 0 ? "\n\n" + hashtags.join(" ") : ""
  const effectiveLength = displayValue.length + hashtagsText.length

  // Determine which platforms to show counts for
  const platformsToShow: Platform[] = platform
    ? [platform]
    : selectedChannelIds.length > 0
      ? [] // will be resolved by parent; show all as fallback
      : (Object.keys(PLATFORM_CHAR_LIMITS) as Platform[])

  return (
    <div className="space-y-2">
      <Textarea
        value={displayValue}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-32 resize-y"
      />
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        {platformsToShow.map((p) => {
          const limit = PLATFORM_CHAR_LIMITS[p].caption
          const isOver = effectiveLength > limit
          return (
            <span
              key={p}
              className={cn(isOver && "font-medium text-destructive")}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}: {effectiveLength} / {limit}
            </span>
          )
        })}
      </div>
    </div>
  )
}
