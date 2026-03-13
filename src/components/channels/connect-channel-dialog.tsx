"use client"

import { Instagram } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useRequireRole } from "@/hooks/use-require-role"
import { useConnectChannel } from "@/hooks/use-channels"

type ConnectChannelDialogProps = {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
}

function TikTokIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-8 w-8"
      fill="currentColor"
      aria-label="TikTok"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.87a8.16 8.16 0 0 0 4.76 1.52v-3.4a4.85 4.85 0 0 1-1-.3z" />
    </svg>
  )
}

export function ConnectChannelDialog({
  open,
  onOpenChange,
}: ConnectChannelDialogProps) {
  const { allowed: isAdmin } = useRequireRole(["admin"])
  const connectChannel = useConnectChannel()

  if (!isAdmin) return null

  function handleConnect(platform: "instagram" | "tiktok") {
    connectChannel.mutate(platform)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Kanal verbinden</DialogTitle>
          <DialogDescription>
            Waehle eine Plattform aus
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <Button
            variant="outline"
            className="flex h-28 flex-col items-center justify-center gap-2 rounded-xl"
            onClick={() => handleConnect("instagram")}
            disabled={connectChannel.isPending}
          >
            <Instagram className="h-8 w-8 text-pink-500" />
            <span className="text-sm font-medium">Instagram</span>
          </Button>
          <Button
            variant="outline"
            className="flex h-28 flex-col items-center justify-center gap-2 rounded-xl"
            onClick={() => handleConnect("tiktok")}
            disabled={connectChannel.isPending}
          >
            <TikTokIcon />
            <span className="text-sm font-medium">TikTok</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
