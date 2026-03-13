import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const supabase = await createClient()

    // Public route -- no auth required
    const { data: page, error: pageError } = await supabase
      .from("linkinbio_pages")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .single()

    if (pageError || !page) {
      return NextResponse.json(
        { error: "Seite nicht gefunden" },
        { status: 404 }
      )
    }

    // Fetch visible, non-expired items with link data
    const now = new Date().toISOString()
    const { data: items } = await supabase
      .from("linkinbio_items")
      .select("*, links(*)")
      .eq("page_id", page.id)
      .eq("is_visible", true)
      .or(`expires_at.is.null,expires_at.gt.${now}`)
      .order("position", { ascending: true })

    return NextResponse.json({
      data: {
        ...page,
        items: items ?? [],
      },
    })
  } catch {
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    )
  }
}
