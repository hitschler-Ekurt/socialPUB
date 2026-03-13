"use client"

import { useState } from "react"
import { MoreVertical, RefreshCw, Unlink } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { useRequireRole } from "@/hooks/use-require-role"
import { useConnectChannel, useDisconnectChannel } from "@/hooks/use-channels"
import type { Database } from "@/lib/supabase/types"

type Channel = Database["public"]["Tables"]["channels"]["Row"]

type ChannelActionsProps = {
  readonly channel: Channel
}

export function ChannelActions({ channel }: ChannelActionsProps) {
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false)
  const { allowed: isAdmin } = useRequireRole(["admin"])
  const connectChannel = useConnectChannel()
  const disconnectChannel = useDisconnectChannel()

  if (!isAdmin) return null

  function handleReconnect() {
    const platform = channel.platform as "instagram" | "tiktok"
    connectChannel.mutate(platform)
  }

  function handleDisconnect() {
    disconnectChannel.mutate(channel.id)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon-sm" aria-label="Kanal-Aktionen" />
          }
        >
          <MoreVertical className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleReconnect}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Neu verbinden
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowDisconnectDialog(true)}>
            <Unlink className="mr-2 h-4 w-4" />
            Trennen
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={showDisconnectDialog}
        onOpenChange={setShowDisconnectDialog}
        title="Kanal trennen"
        description={`Moechtest du "${channel.name}" wirklich trennen? Der Kanal kann spaeter erneut verbunden werden.`}
        confirmLabel="Trennen"
        onConfirm={handleDisconnect}
        variant="destructive"
      />
    </>
  )
}
