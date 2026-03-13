"use client"

import { useState, useCallback } from "react"
import { useUser } from "@/hooks/use-user"
import { ROLES } from "@/lib/utils/constants"
import { TeamList } from "@/components/settings/team-list"
import { InviteDialog } from "@/components/settings/invite-dialog"

export default function TeamPage() {
  const { profile, loading } = useUser()
  const [refreshKey, setRefreshKey] = useState(0)
  const isAdmin = profile?.role === ROLES.admin

  const handleInvited = useCallback(() => {
    setRefreshKey((prev) => prev + 1)
  }, [])

  if (loading) {
    return <p className="text-neutral-500">Laden...</p>
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-lg text-neutral-500">Keine Berechtigung</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-neutral-800">
          Team
        </h1>
        <InviteDialog onInvited={handleInvited} />
      </div>
      <TeamList key={refreshKey} />
    </div>
  )
}
