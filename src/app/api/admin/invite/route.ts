import { NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { ROLES } from "@/lib/utils/constants"

const inviteSchema = z.object({
  email: z.string().email("Ungueltige E-Mail-Adresse"),
  full_name: z.string().min(1, "Name ist erforderlich"),
  role: z.enum([ROLES.admin, ROLES.editor, ROLES.viewer] as const),
})

export async function POST(request: Request) {
  try {
    // Step 1: Verify caller is authenticated
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: "Nicht authentifiziert" },
        { status: 401 }
      )
    }

    // Step 2: Verify caller is admin
    const { data: callerProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (callerProfile?.role !== "admin") {
      return NextResponse.json(
        { error: "Nur Admins koennen Benutzer einladen" },
        { status: 403 }
      )
    }

    // Step 3: Parse and validate request body
    const body = await request.json()
    const parsed = inviteSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Ungueltige Eingabe", details: parsed.error.issues },
        { status: 400 }
      )
    }

    const { email, full_name, role } = parsed.data

    // Step 4: Invite user via admin client
    const admin = createAdminClient()
    const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
      data: { full_name, role },
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/confirm`,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data })
  } catch {
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    )
  }
}
