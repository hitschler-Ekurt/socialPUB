import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { updatePostSchema } from "@/lib/validations/post"

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

    const { data: post, error } = await supabase
      .from("posts")
      .select("*, campaigns(id, name, color, slug)")
      .eq("id", id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    // Fetch associated channels
    const { data: channels } = await supabase
      .from("post_channels")
      .select("channel_id")
      .eq("post_id", id)

    // Fetch associated media
    const { data: media } = await supabase
      .from("post_media")
      .select("*")
      .eq("post_id", id)
      .order("position", { ascending: true })

    return NextResponse.json({
      data: {
        ...post,
        channels: (channels ?? []).map((c) => c.channel_id),
        media: media ?? [],
      },
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

    const body = await request.json()
    const parsed = updatePostSchema.safeParse(body)

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
      status,
    } = parsed.data

    // Build update object only with provided fields
    const updateData: Record<string, unknown> = {}
    if (caption !== undefined) updateData.caption = caption
    if (captionOverrides !== undefined) updateData.caption_overrides = captionOverrides
    if (postType !== undefined) updateData.post_type = postType
    if (hashtags !== undefined) updateData.hashtags = hashtags
    if (firstComment !== undefined) updateData.first_comment = firstComment
    if (scheduledAt !== undefined) updateData.scheduled_at = scheduledAt
    if (campaignId !== undefined) updateData.campaign_id = campaignId
    if (linkId !== undefined) updateData.link_id = linkId
    if (updateLinkinbio !== undefined) updateData.update_linkinbio = updateLinkinbio
    if (status !== undefined) updateData.status = status

    const { data: updated, error: updateError } = await supabase
      .from("posts")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Replace channels if provided
    if (channelIds !== undefined) {
      await supabase.from("post_channels").delete().eq("post_id", id)
      if (channelIds.length > 0) {
        const channelRows = channelIds.map((channel_id) => ({
          post_id: id,
          channel_id,
        }))
        await supabase.from("post_channels").insert(channelRows)
      }
    }

    // Replace media if provided
    if (mediaIds !== undefined) {
      await supabase.from("post_media").delete().eq("post_id", id)
      if (mediaIds.length > 0) {
        const mediaRows = mediaIds.map((media_id, index) => ({
          post_id: id,
          media_id,
          position: index,
        }))
        await supabase.from("post_media").insert(mediaRows)
      }
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

    // Delete junction records first, then the post
    await supabase.from("post_channels").delete().eq("post_id", id)
    await supabase.from("post_media").delete().eq("post_id", id)

    const { error } = await supabase
      .from("posts")
      .delete()
      .eq("id", id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: { id } })
  } catch {
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    )
  }
}
