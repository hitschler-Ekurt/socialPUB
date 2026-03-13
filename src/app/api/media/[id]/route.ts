import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { updateMediaTagsSchema } from "@/lib/validations/media"

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

  if (!profile || !["admin", "editor"].includes(profile.role)) {
    return { authorized: false as const, status: 403, error: "Keine Berechtigung" }
  }

  return { authorized: true as const, user }
}

export async function PATCH(
  request: Request,
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

    const body = await request.json()
    const parseResult = updateMediaTagsSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Ungueltige Eingabe", details: parseResult.error.flatten() },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("media")
      .update({ tags: parseResult.data.tags })
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

    // Fetch media record to get file paths for storage cleanup
    const { data: media, error: fetchError } = await supabase
      .from("media")
      .select("file_path, thumbnail_path")
      .eq("id", id)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    if (!media) {
      return NextResponse.json({ error: "Datei nicht gefunden" }, { status: 404 })
    }

    // Delete files from storage
    const filesToRemove = [media.file_path]
    if (media.thumbnail_path) {
      filesToRemove.push(media.thumbnail_path)
    }

    await supabase.storage.from("media").remove(filesToRemove)

    // Delete database record
    const { error: deleteError } = await supabase
      .from("media")
      .delete()
      .eq("id", id)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ data: { id } })
  } catch {
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    )
  }
}
