"use client"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"
import { useComposerStore } from "@/stores/composer-store"
import { useChannels } from "@/hooks/use-channels"
import { ChevronDown, ChevronRight, Info } from "lucide-react"
import { cn } from "@/lib/utils"

const MAX_LENGTH = 2200

export function FirstCommentInput() {
  const [expanded, setExpanded] = useState(false)
  const firstComment = useComposerStore((s) => s.firstComment)
  const setFirstComment = useComposerStore((s) => s.setFirstComment)
  const selectedChannelIds = useComposerStore((s) => s.selectedChannelIds)

  const { data: channels } = useChannels()

  const hasInstagram = (channels ?? []).some(
    (ch) =>
      selectedChannelIds.includes(ch.id) && ch.platform === "instagram"
  )

  return (
    <section className="space-y-2">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-sm font-medium text-neutral-700"
      >
        {expanded ? (
          <ChevronDown className="size-4" />
        ) : (
          <ChevronRight className="size-4" />
        )}
        Erster Kommentar (Instagram)
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger
              render={
                <span className="inline-flex">
                  <Info className="size-3.5 text-muted-foreground" />
                </span>
              }
            />
            <TooltipContent>
              Hashtags und Erwaehnungen im ersten Kommentar halten die Caption sauber und koennen die Reichweite erhoehen.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </button>

      {expanded && (
        <div className="space-y-2 pl-5">
          {!hasInstagram && selectedChannelIds.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Kein Instagram-Kanal ausgewaehlt. Der erste Kommentar wird nur bei Instagram-Posts verwendet.
            </p>
          )}
          <Textarea
            value={firstComment}
            onChange={(e) => setFirstComment(e.target.value)}
            placeholder="Erster Kommentar schreiben..."
            maxLength={MAX_LENGTH}
            className="min-h-20 resize-y"
          />
          <span
            className={cn(
              "text-xs text-muted-foreground",
              firstComment.length > MAX_LENGTH && "font-medium text-destructive"
            )}
          >
            {firstComment.length} / {MAX_LENGTH}
          </span>
        </div>
      )}
    </section>
  )
}
