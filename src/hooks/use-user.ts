"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

export type Profile = {
  id: string
  full_name: string | null
  avatar_url: string | null
  role: string
  is_active: boolean
}

type UseUserReturn = {
  user: User | null
  profile: Profile | null
  loading: boolean
  error: string | null
}

export function useUser(): UseUserReturn {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchUser() {
      try {
        const supabase = createClient()

        const {
          data: { user: authUser },
          error: authError,
        } = await supabase.auth.getUser()

        if (cancelled) return

        if (authError || !authUser) {
          setUser(null)
          setProfile(null)
          setLoading(false)
          return
        }

        setUser(authUser)

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url, role, is_active")
          .eq("id", authUser.id)
          .single()

        if (cancelled) return

        if (profileError) {
          setError(profileError.message)
          setProfile(null)
        } else {
          setProfile(profileData as Profile)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Fehler beim Laden des Benutzers")
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchUser()

    return () => {
      cancelled = true
    }
  }, [])

  return { user, profile, loading, error }
}
