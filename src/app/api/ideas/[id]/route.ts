import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { updateIdeaSchema } from "@/lib/validations/idea"

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const supabase = await createClient()
    const { id } = await context.params

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

    const { data: idea, error } = await supabase
      .from("drafts")
      .select(
        "*, campaigns(id, name, color, slug), profiles!drafts_assigned_to_fkey(id, full_name, avatar_url)"
      )
      .eq("id", id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    return NextResponse.json({ data: idea })
  } catch {
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const supabase = await createClient()
    const { id } = await context.params

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
    const parsed = updateIdeaSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Ungueltige Eingabe", details: parsed.error.issues },
        { status: 400 }
      )
    }

    const { title, description, status, position, campaignId, assignedTo } =
      parsed.data

    const updateFields: Record<string, unknown> = {}
    if (title !== undefined) updateFields.title = title
    if (description !== undefined) updateFields.description = description
    if (status !== undefined) updateFields.status = status
    if (position !== undefined) updateFields.position = position
    if (campaignId !== undefined) updateFields.campaign_id = campaignId
    if (assignedTo !== undefined) updateFields.assigned_to = assignedTo
    updateFields.updated_at = new Date().toISOString()

    const { data: idea, error } = await supabase
      .from("drafts")
      .update(updateFields)
      .eq("id", id)
      .select(
        "*, campaigns(id, name, color, slug), profiles!drafts_assigned_to_fkey(id, full_name, avatar_url)"
      )
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: idea })
  } catch {
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    )
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const supabase = await createClient()
    const { id } = await context.params

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

    const { error } = await supabase.from("drafts").delete().eq("id", id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: { success: true } })
  } catch {
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    )
  }
}
