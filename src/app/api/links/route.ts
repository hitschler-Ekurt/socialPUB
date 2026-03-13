import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createLinkSchema } from "@/lib/validations/link"

export async function GET() {
  try {
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

    const { data: links, error } = await supabase
      .from("links")
      .select("*, campaigns(id, name, color, slug)")
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: links })
  } catch {
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
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

    // Check editor or admin role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (!profile || (profile.role !== "admin" && profile.role !== "editor")) {
      return NextResponse.json(
        { error: "Keine Berechtigung" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const parsed = createLinkSchema.safeParse(body)

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
    } = parsed.data

    // Do NOT include short_code, short_url, or full_url -- DB triggers handle these
    const { data: link, error } = await supabase
      .from("links")
      .insert({
        original_url: originalUrl,
        utm_source: utmSource ?? null,
        utm_medium: utmMedium ?? "social",
        utm_campaign: utmCampaign ?? null,
        utm_content: utmContent ?? null,
        utm_term: utmTerm ?? null,
        title: title ?? null,
        campaign_id: campaignId ?? null,
        expires_at: expiresAt ?? null,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: link }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    )
  }
}
