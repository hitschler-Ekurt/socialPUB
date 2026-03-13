"use client"

import { ProfileForm } from "@/components/settings/profile-form"

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-neutral-800">
        Mein Profil
      </h1>
      <ProfileForm />
    </div>
  )
}
