"use client"

import { useMemo } from "react"
import { useUser } from "./use-user"
import type { Role } from "@/lib/utils/constants"

type UseRequireRoleReturn = {
  allowed: boolean
  loading: boolean
}

export function useRequireRole(requiredRoles: Role | readonly Role[]): UseRequireRoleReturn {
  const { profile, loading } = useUser()

  const allowed = useMemo(() => {
    if (!profile) return false

    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]
    return roles.includes(profile.role as Role)
  }, [profile, requiredRoles])

  return { allowed, loading }
}
