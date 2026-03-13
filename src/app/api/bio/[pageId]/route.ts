import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { updateBioPageSchema } from "@/lib/validations/bio"

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
  { params }: { params: Promise<{ pageId: string }> }
) {
  try {
    const { pageId } = await params
    const supabase = await createClient()
    const authResult = await verifyEditorOrAdmin(supabase)

    if (!authResult.authorized) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      )
    }

    const { data: page, error } = await supabase
      .from("linkinbio_pages")
      .select("*")
      .eq("id", pageId)
      .single()

    if (error) {
      return NextResponse.json({ error: "Seite nicht gefunden" }, { status: 404 })
    }

    // Fetch items with link data
    const { data: items } = await supabase
      .from("linkinbio_items")
      .select("*, links(*)")
      .eq("page_id", pageId)
      .order("position", { ascending: true })

    return NextResponse.json({
      data: { ...page, items: items ?? [] },
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
  { params }: { params: Promise<{ pageId: string }> }
) {
  try {
    const { pageId } = await params
    const supabase = await createClient()
    const authResult = await verifyEditorOrAdmin(supabase)

    if (!authResult.authorized) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      )
    }

    const body = await request.json()
    const parsed = updateBioPageSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Ungueltige Eingabe", details: parsed.error.issues },
        { status: 400 }
      )
    }

    const { slug, title, description, logoUrl } = parsed.data

    // Build update object only with provided fields
    const updateData: Record<string, unknown> = {}
    if (slug !== undefined) updateData.slug = slug
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (logoUrl !== undefined) updateData.logo_url = logoUrl

    // Check slug uniqueness if slug is being changed
    if (slug !== undefined) {
      const { data: existing } = await supabase
        .from("linkinbio_pages")
        .select("id")
        .eq("slug", slug)
        .neq("id", pageId)
        .maybeSingle()

      if (existing) {
        return NextResponse.json(
          { error: "Slug ist bereits vergeben" },
          { status: 409 }
        )
      }
    }

    const { data: updated, error } = await supabase
      .from("linkinbio_pages")
      .update(updateData)
      .eq("id", pageId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: updated })
  } catch {
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ pageId: string }> }
) {
  try {
    const { pageId } = await params
    const supabase = await createClient()
    const authResult = await verifyEditorOrAdmin(supabase)

    if (!authResult.authorized) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      )
    }

    // Delete items first, then the page
    await supabase.from("linkinbio_items").delete().eq("page_id", pageId)

    const { error } = await supabase
      .from("linkinbio_pages")
      .delete()
      .eq("id", pageId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: { id: pageId } })
  } catch {
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    )
  }
}
