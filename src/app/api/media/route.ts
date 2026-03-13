import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createMediaSchema, mediaFilterSchema } from "@/lib/validations/media"

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
    const parsed = mediaFilterSchema.safeParse({
      media_type: searchParams.get("media_type") ?? undefined,
      tags: searchParams.get("tags") ?? undefined,
      search: searchParams.get("search") ?? undefined,
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    })

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Ungueltige Filter", details: parsed.error.issues },
        { status: 400 }
      )
    }

    const { media_type, tags, search, page, limit } = parsed.data
    const offset = (page - 1) * limit

    // Build query
    let query = supabase.from("media").select("*", { count: "exact" })

    if (media_type) {
      query = query.eq("media_type", media_type)
    }

    if (tags) {
      const tagArray = tags.split(",").map((t) => t.trim()).filter(Boolean)
      if (tagArray.length > 0) {
        query = query.contains("tags", tagArray)
      }
    }

    if (search) {
      query = query.ilike("file_name", `%${search}%`)
    }

    query = query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      data: data ?? [],
      pagination: {
        page,
        limit,
        total: count ?? 0,
      },
    })
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
    const parsed = createMediaSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Ungueltige Eingabe", details: parsed.error.issues },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("media")
      .insert({
        ...parsed.data,
        uploaded_by: user.id,
        usage_count: 0,
        tags: [],
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
