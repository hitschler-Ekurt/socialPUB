import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { updateMediaTagsSchema } from "@/lib/validations/media"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const body = await request.json()
    const parsed = updateMediaTagsSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Ungueltige Eingabe", details: parsed.error.issues },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("media")
      .update({ tags: parsed.data.tags })
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

    // Check role -- admin/editor only
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (!profile || profile.role === "viewer") {
      return NextResponse.json(
        { error: "Keine Berechtigung" },
        { status: 403 }
      )
    }

    const { id } = await params

    // Fetch media record to get file paths before deleting
    const { data: media, error: fetchError } = await supabase
      .from("media")
      .select("file_path, thumbnail_path")
      .eq("id", id)
      .single()

    if (fetchError) {
      return NextResponse.json(
        { error: fetchError.message },
        { status: 500 }
      )
    }

    if (!media) {
      return NextResponse.json(
        { error: "Datei nicht gefunden" },
        { status: 404 }
      )
    }

    // Delete files from Supabase Storage
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
      return NextResponse.json(
        { error: deleteError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: { id } })
  } catch {
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    )
  }
}
