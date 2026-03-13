"use client"

import { useEffect, useState, useCallback } from "react"
import { toast } from "sonner"
import { useUser } from "@/hooks/use-user"
import { ROLES } from "@/lib/utils/constants"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"

type TeamMember = {
  readonly id: string
  readonly full_name: string | null
  readonly email?: string
  readonly role: string
  readonly is_active: boolean
}

function getInitials(name: string | null): string {
  if (!name) return "?"
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function TeamList() {
  const { profile } = useUser()
  const [members, setMembers] = useState<readonly TeamMember[]>([])
  const [loading, setLoading] = useState(true)

  const isAdmin = profile?.role === ROLES.admin
  const isViewer = profile?.role === ROLES.viewer

  const fetchMembers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/users")
      if (!res.ok) {
        throw new Error("Fehler beim Laden der Benutzer")
      }
      const json = await res.json()
      setMembers(json.data ?? [])
    } catch (err) {
      toast.error("Benutzer konnten nicht geladen werden")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  async function handleRoleChange(userId: string, newRole: string) {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, role: newRole }),
      })

      if (!res.ok) {
        const json = await res.json()
        if (json.error?.includes("letzter Admin")) {
          toast.error("Letzter Admin kann nicht herabgestuft werden")
        } else {
          toast.error(json.error ?? "Fehler beim Aendern der Rolle")
        }
        return
      }

      toast.success("Rolle geaendert")
      fetchMembers()
    } catch (err) {
      toast.error("Unerwarteter Fehler")
    }
  }

  async function handleDeactivate(userId: string) {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, is_active: false }),
      })

      if (!res.ok) {
        const json = await res.json()
        toast.error(json.error ?? "Fehler beim Deaktivieren")
        return
      }

      toast.success("Benutzer deaktiviert")
      fetchMembers()
    } catch (err) {
      toast.error("Unerwarteter Fehler")
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-md" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {members.map((member) => {
        const isCurrentUser = member.id === profile?.id

        return (
          <div
            key={member.id}
            className="flex items-center gap-4 rounded-lg border p-4"
          >
            <Avatar>
              <AvatarFallback>{getInitials(member.full_name)}</AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-800 truncate">
                {member.full_name ?? "Unbekannt"}
              </p>
              {member.email && (
                <p className="text-xs text-neutral-500 truncate">{member.email}</p>
              )}
            </div>

            {/* Role selector -- admin only, not viewer, not for self */}
            {isAdmin && !isViewer && !isCurrentUser ? (
              <Select
                value={member.role}
                onValueChange={(value) => {
                  if (value) handleRoleChange(member.id, value)
                }}
              >
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ROLES.admin}>Admin</SelectItem>
                  <SelectItem value={ROLES.editor}>Editor</SelectItem>
                  <SelectItem value={ROLES.viewer}>Viewer</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Badge variant="secondary" className="capitalize">
                {member.role}
              </Badge>
            )}

            {/* Status badge */}
            <Badge variant={member.is_active ? "default" : "outline"}>
              {member.is_active ? "Aktiv" : "Inaktiv"}
            </Badge>

            {/* Deactivate button -- admin only, not for self */}
            {isAdmin && !isViewer && !isCurrentUser && member.is_active && (
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => handleDeactivate(member.id)}
              >
                Deaktivieren
              </Button>
            )}
          </div>
        )
      })}

      {members.length === 0 && (
        <p className="text-center text-sm text-neutral-500 py-8">
          Keine Teammitglieder gefunden.
        </p>
      )}
    </div>
  )
}
