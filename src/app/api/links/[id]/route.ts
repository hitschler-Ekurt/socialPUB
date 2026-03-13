import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { updateLinkSchema } from "@/lib/validations/link"

async function verifyEditorOrAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
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

  if (!profile || (profile.role !== "admin" && profile.role !== "editor")) {
    return { authorized: false as const, status: 403, error: "Keine Berechtigung" }
  }

  return { authorized: true as const, user }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    const { data: link, error } = await supabase
      .from("links")
      .select("*, campaigns(id, name, color, slug)")
      .eq("id", id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    // Count posts referencing this link
    const { count: postCount } = await supabase
      .from("posts")
      .select("id", { count: "exact", head: true })
      .eq("link_id", id)

    return NextResponse.json({
      data: {
        ...link,
        post_count: postCount ?? 0,
      },
    })
  } catch {
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const authResult = await verifyEditorOrAdmin(supabase)

    if (!authResult.authorized) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      )
    }

    const body = await request.json()
    const parsed = updateLinkSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Ungueltige Eingabe", details: parsed.error.issues },
        { status: 400 }
      )
    }

    const {
      originalUrl,
      utmSource,
      utmMedium,
      utmCampaign,
      utmContent,
      utmTerm,
      title,
      campaignId,
      expiresAt,
      isActive,
    } = parsed.data

    // Build update object -- exclude short_code, short_url, full_url (generated)
    const updateData: Record<string, unknown> = {}
    if (originalUrl !== undefined) updateData.original_url = originalUrl
    if (utmSource !== undefined) updateData.utm_source = utmSource
    if (utmMedium !== undefined) updateData.utm_medium = utmMedium
    if (utmCampaign !== undefined) updateData.utm_campaign = utmCampaign
    if (utmContent !== undefined) updateData.utm_content = utmContent
    if (utmTerm !== undefined) updateData.utm_term = utmTerm
    if (title !== undefined) updateData.title = title
    if (campaignId !== undefined) updateData.campaign_id = campaignId
    if (expiresAt !== undefined) updateData.expires_at = expiresAt
    if (isActive !== undefined) updateData.is_active = isActive

    const { data, error } = await supabase
      .from("links")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch {
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const authResult = await verifyEditorOrAdmin(supabase)

    if (!authResult.authorized) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      )
    }

    const { error } = await supabase
      .from("links")
      .delete()
      .eq("id", id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: { id } })
  } catch {
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    )
  }
}
