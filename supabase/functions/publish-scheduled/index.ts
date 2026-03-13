// Supabase Edge Function: publish-scheduled
// Cron-triggered function that publishes posts whose scheduled_at has passed.
// Calls Late.dev REST API for actual social media publishing.
//
// pg_cron setup (run in Supabase SQL Editor):
// -----------------------------------------------
// SELECT cron.schedule('publish-scheduled-posts', '* * * * *', $$
//   SELECT net.http_post(
//     url := '<SUPABASE_URL>/functions/v1/publish-scheduled',
//     headers := '{"Content-Type":"application/json","Authorization":"Bearer <ANON_KEY>"}'::jsonb,
//     body := '{}'::jsonb
//   );
// $$);
// -----------------------------------------------

import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? ""
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
const LATE_API_KEY = Deno.env.get("LATE_API_KEY") ?? ""

interface PostChannel {
  readonly channel_id: string
  readonly channels: {
    readonly platform: string
    readonly account_id: string | null
    readonly name: string
    readonly metadata: unknown
  }
}

interface ScheduledPost {
  readonly id: string
  readonly caption: string | null
  readonly post_channels: readonly PostChannel[]
  readonly update_linkinbio: boolean
  readonly link_id: string | null
  readonly post_media?: readonly { readonly media: { readonly file_path: string; readonly media_type: string } }[]
}

Deno.serve(async (_req: Request) => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(
      JSON.stringify({ error: "Missing Supabase configuration" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }

  if (!LATE_API_KEY) {
    return new Response(
      JSON.stringify({ error: "Missing LATE_API_KEY" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  // Query posts that are scheduled and due for publishing
  const { data: posts, error: queryError } = await supabase
    .from("posts")
    .select("id, caption, update_linkinbio, link_id, post_channels(channel_id, channels(platform, account_id, name, metadata))")
    .eq("status", "scheduled")
    .lte("scheduled_at", new Date().toISOString())

  if (queryError) {
    return new Response(
      JSON.stringify({ error: queryError.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }

  const scheduledPosts = (posts ?? []) as unknown as ScheduledPost[]
  let processedCount = 0
  let failedCount = 0

  for (const post of scheduledPosts) {
    try {
      // Build platform targets from post channels
      const platforms = post.post_channels.map((pc) => ({
        platform: pc.channels.platform,
        accountId: pc.channels.account_id,
      }))

      // Call Late.dev REST API
      const response = await fetch("https://api.getlate.dev/v1/posts", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${LATE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: post.caption ?? "",
          platforms,
          publishNow: true,
        }),
      })

      if (response.ok) {
        const result = await response.json()

        // Mark post as published
        await supabase
          .from("posts")
          .update({
            status: "published",
            published_at: new Date().toISOString(),
            platform_post_ids: result,
          })
          .eq("id", post.id)

        // Handle link-in-bio auto-update (BIO-03)
        if (post.update_linkinbio && post.link_id) {
          await updateLinkInBio(supabase, post.link_id)
        }

        processedCount++
      } else {
        const errorText = await response.text()

        await supabase
          .from("posts")
          .update({
            status: "failed",
            publish_errors: {
              message: errorText,
              timestamp: new Date().toISOString(),
              statusCode: response.status,
            },
          })
          .eq("id", post.id)

        failedCount++
      }

      // Rate limit safety: 1s delay between posts
      if (scheduledPosts.length > 1) {
        await new Promise((r) => setTimeout(r, 1000))
      }
    } catch (err) {
      await supabase
        .from("posts")
        .update({
          status: "failed",
          publish_errors: {
            message: String(err),
            timestamp: new Date().toISOString(),
          },
        })
        .eq("id", post.id)

      failedCount++
    }
  }

  return new Response(
    JSON.stringify({
      processed: processedCount,
      failed: failedCount,
      total: scheduledPosts.length,
    }),
    { headers: { "Content-Type": "application/json" } }
  )
})

/**
 * Auto-update link-in-bio: move the linked item to the top position.
 * If no bio item exists for this link, create one at position 0.
 * Shifts all existing items down by 1.
 */
async function updateLinkInBio(
  supabase: ReturnType<typeof createClient>,
  linkId: string
): Promise<void> {
  // Find active bio page
  const { data: bioPages } = await supabase
    .from("linkinbio_pages")
    .select("id")
    .eq("is_active", true)
    .limit(1)

  if (!bioPages || bioPages.length === 0) return

  const pageId = bioPages[0].id

  // Shift all existing items down by 1 position
  const { data: existingItems } = await supabase
    .from("linkinbio_items")
    .select("id, position")
    .eq("page_id", pageId)
    .order("position", { ascending: true })

  for (const item of existingItems ?? []) {
    await supabase
      .from("linkinbio_items")
      .update({ position: item.position + 1 })
      .eq("id", item.id)
  }

  // Check if link already exists as bio item
  const { data: existingItem } = await supabase
    .from("linkinbio_items")
    .select("id")
    .eq("page_id", pageId)
    .eq("link_id", linkId)
    .maybeSingle()

  if (existingItem) {
    // Move existing item to position 0
    await supabase
      .from("linkinbio_items")
      .update({ position: 0 })
      .eq("id", existingItem.id)
  } else {
    // Insert new item at position 0
    await supabase.from("linkinbio_items").insert({
      page_id: pageId,
      link_id: linkId,
      position: 0,
      is_visible: true,
    })
  }
}
