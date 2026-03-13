import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createPostSchema } from "@/lib/validations/post"

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

    const { data: posts, error } = await supabase
      .from("posts")
      .select("*, campaigns(id, name, color, slug)")
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: posts })
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
    const parsed = createPostSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Ungueltige Eingabe", details: parsed.error.issues },
        { status: 400 }
      )
    }

    const {
      caption,
      captionOverrides,
      postType,
      hashtags,
      firstComment,
      scheduledAt,
      campaignId,
      linkId,
      channelIds,
      mediaIds,
      updateLinkinbio,
    } = parsed.data

    // Insert the post
    const { data: post, error: postError } = await supabase
      .from("posts")
      .insert({
        caption: caption ?? null,
        caption_overrides: captionOverrides ?? {},
        post_type: postType,
        hashtags: hashtags ?? [],
        first_comment: firstComment ?? null,
        scheduled_at: scheduledAt ?? null,
        campaign_id: campaignId ?? null,
        link_id: linkId ?? null,
        update_linkinbio: updateLinkinbio,
        status: scheduledAt ? "scheduled" : "draft",
        created_by: user.id,
      })
      .select()
      .single()

    if (postError) {
      return NextResponse.json({ error: postError.message }, { status: 500 })
    }

    // Insert post_channels junction records
    if (channelIds.length > 0) {
      const channelRows = channelIds.map((channel_id) => ({
        post_id: post.id,
        channel_id,
      }))

      const { error: channelError } = await supabase
        .from("post_channels")
        .insert(channelRows)

      if (channelError) {
        // Rollback: delete the post
        await supabase.from("posts").delete().eq("id", post.id)
        return NextResponse.json(
          { error: "Fehler beim Zuweisen der Kanaele" },
          { status: 500 }
        )
      }
    }

    // Insert post_media junction records
    if (mediaIds && mediaIds.length > 0) {
      const mediaRows = mediaIds.map((media_id, index) => ({
        post_id: post.id,
        media_id,
        position: index,
      }))

      const { error: mediaError } = await supabase
        .from("post_media")
        .insert(mediaRows)

      if (mediaError) {
        // Rollback: delete channels and post
        await supabase.from("post_channels").delete().eq("post_id", post.id)
        await supabase.from("posts").delete().eq("id", post.id)
        return NextResponse.json(
          { error: "Fehler beim Zuweisen der Medien" },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({ data: post }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    )
  }
}
