import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { workflowActionSchema } from "@/lib/validations/workflow"
import { validateTransition } from "@/lib/workflow-transitions"
import type { UserRole } from "@/lib/workflow-transitions"

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

  return { authorized: true as const, user, role: profile.role as UserRole }
}

export async function POST(
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
    const parsed = workflowActionSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Ungueltige Eingabe", details: parsed.error.issues },
        { status: 400 }
      )
    }

    const { action, comment, scheduledAt } = parsed.data

    // Fetch current post status
    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("id, status, scheduled_at, publish_errors")
      .eq("id", id)
      .single()

    if (postError || !post) {
      return NextResponse.json(
        { error: "Post nicht gefunden" },
        { status: 404 }
      )
    }

    // Validate the transition
    const currentStatus = post.status as "draft" | "review" | "approved" | "scheduled" | "published" | "failed"
    const result = validateTransition(currentStatus, action, authResult.role)

    if (!result.valid) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    // Build update object
    const updateData: Record<string, unknown> = {
      status: result.targetStatus,
    }

    // Handle action-specific fields
    if (action === "reject" && comment) {
      // Store rejection info in publish_errors JSONB (no schema migration needed)
      updateData.publish_errors = {
        review_comment: comment,
        reviewed_by: authResult.user.id,
        reviewed_at: new Date().toISOString(),
      }
    }

    if (action === "schedule" && scheduledAt) {
      updateData.scheduled_at = scheduledAt
    }

    if (action === "retry") {
      // Clear errors and keep original scheduled_at
      updateData.publish_errors = null
      updateData.scheduled_at = post.scheduled_at
    }

    // Update the post
    const { data: updated, error: updateError } = await supabase
      .from("posts")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      )
    }

    // Insert approval log entry
    await supabase.from("approval_logs").insert({
      post_id: id,
      action,
      comment: comment ?? null,
      performed_by: authResult.user.id,
    })

    return NextResponse.json({ data: updated })
  } catch {
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    )
  }
}
