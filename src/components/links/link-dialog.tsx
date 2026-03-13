"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { UtmBuilder } from "@/components/links/utm-builder"
import { Button } from "@/components/ui/button"
import { Check, Copy } from "lucide-react"

type LinkDialogProps = {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly channelPlatform: string | null
  readonly campaignSlug: string | null
  readonly onLinkCreated: (linkId: string) => void
}

type SuccessState = {
  readonly linkId: string
  readonly shortUrl: string
}

export function LinkDialog({
  open,
  onOpenChange,
  channelPlatform,
  campaignSlug,
  onLinkCreated,
}: LinkDialogProps) {
  const [success, setSuccess] = useState<SuccessState | null>(null)
  const [copied, setCopied] = useState(false)
  const autoCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setSuccess(null)
      setCopied(false)
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current)
        autoCloseTimerRef.current = null
      }
    }
  }, [open])

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current)
      }
    }
  }, [])

  const handleLinkCreated = useCallback(
    (linkId: string) => {
      // The API response includes the short_url from the DB trigger
      // We fetch it from the link detail
      fetch(`/api/links/${linkId}`)
        .then((res) => res.json())
        .then((json) => {
          const shortUrl = json.data?.short_url ?? ""
          setSuccess({ linkId, shortUrl })
          onLinkCreated(linkId)

          // Auto-close after 2 seconds
          autoCloseTimerRef.current = setTimeout(() => {
            onOpenChange(false)
          }, 2000)
        })
        .catch(() => {
          // Even if fetching short_url fails, the link was created
          onLinkCreated(linkId)
          onOpenChange(false)
        })
    },
    [onLinkCreated, onOpenChange]
  )

  const handleCopy = useCallback(async () => {
    if (!success?.shortUrl) return

    try {
      await navigator.clipboard.writeText(success.shortUrl)
      setCopied(true)
      // Close after copy
      setTimeout(() => {
        onOpenChange(false)
      }, 500)
    } catch {
      // Clipboard API not available
    }
  }, [success, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Link erstellen</DialogTitle>
          <DialogDescription>
            Link mit UTM-Parametern und Kurzlink erstellen
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="flex size-12 items-center justify-center rounded-full bg-green-100">
              <Check className="size-6 text-green-600" />
            </div>
            <p className="text-sm font-medium text-foreground">Link erstellt!</p>
            {success.shortUrl && (
              <div className="flex w-full items-center gap-2">
                <code className="flex-1 rounded-md bg-muted px-3 py-2 text-sm">
                  {success.shortUrl}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <Check className="size-4" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                  <span className="ml-1.5">Kopieren</span>
                </Button>
              </div>
            )}
          </div>
        ) : (
          <UtmBuilder
            channelPlatform={channelPlatform}
            campaignSlug={campaignSlug}
            onLinkCreated={handleLinkCreated}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
