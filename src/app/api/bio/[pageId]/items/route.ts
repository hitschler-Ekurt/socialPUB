import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import {
  createBioItemSchema,
  updateBioItemSchema,
  reorderBioItemsSchema,
} from "@/lib/validations/bio"

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

    const { data: items, error } = await supabase
      .from("linkinbio_items")
      .select("*, links(*)")
      .eq("page_id", pageId)
      .order("position", { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: items })
  } catch {
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    )
  }
}

export async function POST(
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
    const parsed = createBioItemSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Ungueltige Eingabe", details: parsed.error.issues },
        { status: 400 }
      )
    }

    const { linkId, position, customTitle, customImageUrl, expiresAt } = parsed.data

    // Determine position: use provided or append at end
    let itemPosition = position
    if (itemPosition === undefined) {
      const { data: lastItem } = await supabase
        .from("linkinbio_items")
        .select("position")
        .eq("page_id", pageId)
        .order("position", { ascending: false })
        .limit(1)
        .maybeSingle()

      itemPosition = lastItem ? lastItem.position + 1 : 0
    }

    const { data: item, error } = await supabase
      .from("linkinbio_items")
      .insert({
        page_id: pageId,
        link_id: linkId,
        position: itemPosition,
        custom_title: customTitle ?? null,
        custom_image_url: customImageUrl ?? null,
        expires_at: expiresAt ?? null,
      })
      .select("*, links(*)")
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: item }, { status: 201 })
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

    // Check if this is a reorder request (has items array) or single item update
    const reorderParsed = reorderBioItemsSchema.safeParse(body)
    if (reorderParsed.success) {
      // Reorder items
      const updates = reorderParsed.data.items.map((item) =>
        supabase
          .from("linkinbio_items")
          .update({ position: item.position })
          .eq("id", item.id)
          .eq("page_id", pageId)
      )

      await Promise.all(updates)

      // Return updated items
      const { data: items } = await supabase
        .from("linkinbio_items")
        .select("*, links(*)")
        .eq("page_id", pageId)
        .order("position", { ascending: true })

      return NextResponse.json({ data: items })
    }

    // Single item update -- expect itemId in body
    const { itemId, ...updateFields } = body as { itemId?: string; [key: string]: unknown }

    if (!itemId) {
      return NextResponse.json(
        { error: "itemId ist erforderlich fuer Einzel-Update" },
        { status: 400 }
      )
    }

    const updateParsed = updateBioItemSchema.safeParse(updateFields)
    if (!updateParsed.success) {
      return NextResponse.json(
        { error: "Ungueltige Eingabe", details: updateParsed.error.issues },
        { status: 400 }
      )
    }

    const { linkId, position, customTitle, customImageUrl, expiresAt, isVisible } =
      updateParsed.data

    const updateData: Record<string, unknown> = {}
    if (linkId !== undefined) updateData.link_id = linkId
    if (position !== undefined) updateData.position = position
    if (customTitle !== undefined) updateData.custom_title = customTitle
    if (customImageUrl !== undefined) updateData.custom_image_url = customImageUrl
    if (expiresAt !== undefined) updateData.expires_at = expiresAt
    if (isVisible !== undefined) updateData.is_visible = isVisible

    const { data: updated, error } = await supabase
      .from("linkinbio_items")
      .update(updateData)
      .eq("id", itemId)
      .eq("page_id", pageId)
      .select("*, links(*)")
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

    const url = new URL(request.url)
    const itemId = url.searchParams.get("itemId")

    if (!itemId) {
      return NextResponse.json(
        { error: "itemId Query-Parameter ist erforderlich" },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from("linkinbio_items")
      .delete()
      .eq("id", itemId)
      .eq("page_id", pageId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: { id: itemId } })
  } catch {
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    )
  }
}
