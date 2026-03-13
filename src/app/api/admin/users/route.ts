import { NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { ROLES } from "@/lib/utils/constants"

const updateUserSchema = z.object({
  user_id: z.string().uuid("Ungueltige Benutzer-ID"),
  role: z.enum([ROLES.admin, ROLES.editor, ROLES.viewer] as const).optional(),
  is_active: z.boolean().optional(),
})

async function verifyAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { authorized: false as const, status: 401, error: "Nicht authentifiziert" }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") {
    return { authorized: false as const, status: 403, error: "Nur Admins haben Zugriff" }
  }

  return { authorized: true as const, user }
}

export async function GET() {
  try {
    const supabase = await createClient()
    const authResult = await verifyAdmin(supabase)

    if (!authResult.authorized) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      )
    }

    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, role, is_active, created_at, updated_at")
      .order("created_at", { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: profiles })
  } catch {
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const authResult = await verifyAdmin(supabase)

    if (!authResult.authorized) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const parsed = updateUserSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Ungueltige Eingabe", details: parsed.error.issues },
        { status: 400 }
      )
    }

    const { user_id, role, is_active } = parsed.data

    // Fetch target user's current profile
    const { data: targetProfile } = await supabase
      .from("profiles")
      .select("role, is_active")
      .eq("id", user_id)
      .single()

    if (!targetProfile) {
      return NextResponse.json(
        { error: "Benutzer nicht gefunden" },
        { status: 404 }
      )
    }

    // Last-admin safeguard
    const isRemovingAdmin =
      (role && role !== "admin" && targetProfile.role === "admin") ||
      (is_active === false && targetProfile.role === "admin")

    if (isRemovingAdmin) {
      const { count } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "admin")
        .eq("is_active", true)
        .neq("id", user_id)

      if (!count || count === 0) {
        return NextResponse.json(
          { error: "Letzter Admin kann nicht herabgestuft werden" },
          { status: 400 }
        )
      }
    }

    // Build update object
    const updateData: Record<string, unknown> = {}
    if (role !== undefined) {
      updateData.role = role
    }
    if (is_active !== undefined) {
      updateData.is_active = is_active
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "Keine Aenderungen angegeben" },
        { status: 400 }
      )
    }

    const { data: updatedProfile, error: updateError } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", user_id)
      .select("id, full_name, avatar_url, role, is_active, created_at, updated_at")
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ data: updatedProfile })
  } catch {
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    )
  }
}
