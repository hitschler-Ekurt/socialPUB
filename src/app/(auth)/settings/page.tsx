"use client"

import { useUser } from "@/hooks/use-user"
import { ROLES } from "@/lib/utils/constants"
import { ProfileForm } from "@/components/settings/profile-form"
import { TeamList } from "@/components/settings/team-list"
import { InviteDialog } from "@/components/settings/invite-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState, useCallback } from "react"

export default function SettingsPage() {
  const { profile, loading } = useUser()
  const [refreshKey, setRefreshKey] = useState(0)
  const isAdmin = profile?.role === ROLES.admin

  const handleInvited = useCallback(() => {
    setRefreshKey((prev) => prev + 1)
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-2xl font-bold text-neutral-800">
          Einstellungen
        </h1>
        <p className="text-neutral-500">Laden...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-neutral-800">
        Einstellungen
      </h1>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Mein Profil</TabsTrigger>
          {isAdmin && <TabsTrigger value="team">Team</TabsTrigger>}
        </TabsList>

        <TabsContent value="profile" className="pt-4">
          <ProfileForm />
        </TabsContent>

        {isAdmin && (
          <TabsContent value="team" className="pt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold text-neutral-800">
                  Teammitglieder
                </h2>
                <InviteDialog onInvited={handleInvited} />
              </div>
              <TeamList key={refreshKey} />
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
