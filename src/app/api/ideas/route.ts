import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createIdeaSchema } from "@/lib/validations/idea"

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const campaignId = searchParams.get("campaignId")
    const status = searchParams.get("status")

    let query = supabase
      .from("drafts")
      .select(
        "*, campaigns(id, name, color, slug), profiles!drafts_assigned_to_fkey(id, full_name, avatar_url)"
      )
      .order("position", { ascending: true })

    if (search) {
      query = query.ilike("title", `%${search}%`)
    }

    if (campaignId) {
      query = query.eq("campaign_id", campaignId)
    }

    if (status) {
      query = query.eq(
        "status",
        status as "idea" | "in_progress" | "ready" | "scheduled"
      )
    }

    const { data: ideas, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: ideas })
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

    const body = await request.json()
    const parsed = createIdeaSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Ungueltige Eingabe", details: parsed.error.issues },
        { status: 400 }
      )
    }

    const { title, description, campaignId, assignedTo } = parsed.data

    // Calculate position: append to bottom of "idea" column
    const { count } = await supabase
      .from("drafts")
      .select("*", { count: "exact", head: true })
      .eq("status", "idea")

    const position = count ?? 0

    const { data: idea, error } = await supabase
      .from("drafts")
      .insert({
        title,
        description: description ?? null,
        campaign_id: campaignId ?? null,
        assigned_to: assignedTo ?? null,
        created_by: user.id,
        position,
        status: "idea",
      })
      .select(
        "*, campaigns(id, name, color, slug), profiles!drafts_assigned_to_fkey(id, full_name, avatar_url)"
      )
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: idea }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    )
  }
}
