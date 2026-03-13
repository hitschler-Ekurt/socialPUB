import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createCampaignSchema } from "@/lib/validations/campaign"

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

    const { data: campaigns, error } = await supabase
      .from("campaigns")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Fetch post counts for each campaign
    const campaignIds = (campaigns ?? []).map((c) => c.id)
    const postCounts: Record<string, number> = {}

    if (campaignIds.length > 0) {
      const { data: posts } = await supabase
        .from("posts")
        .select("campaign_id")
        .in("campaign_id", campaignIds)

      for (const post of posts ?? []) {
        if (post.campaign_id) {
          postCounts[post.campaign_id] = (postCounts[post.campaign_id] ?? 0) + 1
        }
      }
    }

    const campaignsWithCount = (campaigns ?? []).map((campaign) => ({
      ...campaign,
      post_count: postCounts[campaign.id] ?? 0,
    }))

    return NextResponse.json({ data: campaignsWithCount })
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
    const parsed = createCampaignSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Ungueltige Eingabe", details: parsed.error.issues },
        { status: 400 }
      )
    }

    const slug = parsed.data.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")

    const { data, error } = await supabase
      .from("campaigns")
      .insert({
        name: parsed.data.name,
        slug,
        color: parsed.data.color,
        start_date: parsed.data.start_date ?? null,
        end_date: parsed.data.end_date ?? null,
        description: parsed.data.description ?? null,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    )
  }
}
