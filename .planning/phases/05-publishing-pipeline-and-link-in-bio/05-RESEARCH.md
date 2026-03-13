# Phase 5: Publishing Pipeline and Link-in-Bio - Research

**Researched:** 2026-03-13
**Domain:** Workflow state machine, Late.dev publishing API, Supabase Edge Functions (cron), link-in-bio page, short-link redirect service
**Confidence:** HIGH

## Summary

Phase 5 brings three major subsystems online: (1) a post status workflow with review/approve/reject lifecycle, (2) automated publishing via a Supabase Edge Function cron that calls Late.dev, and (3) the link-in-bio public page plus the short-link redirect service. The existing codebase is well-prepared -- the database schema already has all required tables (`posts` with full status enum, `approval_logs`, `linkinbio_pages`, `linkinbio_items`, `link_clicks`), the Late.dev client is initialized, dnd-kit is installed for bio manager drag-drop, and the composer form can be extended inline.

The primary risk is the Edge Function for publishing -- it runs in Deno (not Node.js), uses the Supabase service role key (bypassing RLS), and must correctly call the Late.dev API. The short-link redirect service is a separate Vercel project with a separate Git repository. The TypeScript types file needs updating to include `linkinbio_pages`, `linkinbio_items`, and `approval_logs` tables before any code can be written against them.

**Primary recommendation:** Split into 4-5 plans: (1) workflow status transitions + approval API, (2) publishing Edge Function + cron setup, (3) link-in-bio manager + public page, (4) short-link redirect service (separate repo), (5) integration wiring (bio auto-update on publish, status badges on calendar).

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions
- All workflow controls live inline in the existing composer form -- no separate post detail page
- Editor clicks "Zur Review einreichen" to move from Draft to In Review
- Any Admin can approve or reject -- no specific reviewer assignment (lightweight for 3-5 person team)
- Rejected posts return to Draft status with the rejection comment visible as a banner/note in the composer
- Only the last status action is displayed ("Freigegeben von Anna am 13.03." or "Abgelehnt: Bitte Caption kuerzen") -- no full activity timeline
- Approved posts can then be scheduled (set scheduled_at date/time)
- Supabase Edge Function runs on a cron schedule (every minute), queries posts where scheduled_at <= now AND status = 'scheduled', publishes via Late.dev API
- Failed publications set post status to 'failed' with red status badge visible on calendar and lists
- Click on failed post shows error message and "Erneut versuchen" (retry) button
- Manual retry only -- no automatic retries
- Successful publication updates status to 'published' with green badge. Toast notification if user is in the app
- Confetti animation deferred to Phase 6 (UX-06)
- Linktree-style vertical list: centered column with hitschies logo at top, branded link buttons below
- Hosted as a public route in the main Next.js app (e.g., /bio) -- no auth required for visitors
- Expired links auto-hide from the public page (not shown as disabled or with countdown)
- Manager UI shows expired links greyed out with "Abgelaufen" badge
- When a post with update_linkinbio enabled publishes, the associated link auto-moves to position 1
- Dedicated /bio-manager page in the app (new sidebar nav item or sub-section under Links)
- Drag-and-drop to reorder links, add/remove links with expiration date picker, preview of public page
- Separate minimal Vercel project deployed to link.hitschies.de (separate Git repository, ~3 files)
- Single dynamic route /[code] that looks up short_code in Supabase, tracks click, returns 302 redirect
- Shares the same Supabase project as the main app (reads/writes same links table)
- Full click analytics: individual click records with timestamp, IP (hashed), referrer, user-agent, geo (from IP)
- Needs link_clicks table in Supabase for individual click records

### Claude's Discretion
- Edge Function cron interval (1 min recommended but Claude can adjust based on research)
- Exact error message formatting for failed publications
- Link-in-bio page styling details (button shapes, spacing, animations)
- Bio manager layout and drag-drop implementation
- Click analytics geo-IP resolution approach
- How to handle Late.dev API rate limits during bulk publishing

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| WRKF-01 | Post has status lifecycle: Draft > In Review > Approved > Scheduled > Published | Database enum already has all values. Workflow API needs status transition validation logic. |
| WRKF-02 | User can submit a post for review | POST /api/posts/[id]/workflow with action="submit_review". Composer gets "Zur Review einreichen" button. |
| WRKF-03 | Reviewer can approve or reject a post with optional comment | POST /api/posts/[id]/workflow with action="approve"|"reject" + comment. approval_logs table exists. |
| WRKF-04 | Approved posts can be scheduled for auto-publishing | Existing schedule-picker in composer. Status transition: approved -> scheduled when scheduledAt set. |
| WRKF-05 | System auto-publishes scheduled posts at the specified time via Late.dev | Supabase Edge Function with pg_cron. Late.dev createPost API with publishNow:true. |
| WRKF-06 | Failed publications show error details and allow retry | Post publish_errors JSONB field. Retry button calls workflow API with action="retry". |
| BIO-01 | User can create a branded link-in-bio landing page | linkinbio_pages table exists. /bio-manager page with create form. |
| BIO-02 | User can add, remove, and reorder links via drag-and-drop | dnd-kit already installed. linkinbio_items with position field. |
| BIO-03 | When post with "update bio" publishes, link auto-moves to position 1 | Edge Function checks update_linkinbio flag after successful publish. |
| BIO-04 | User can set link expiration dates | links.expires_at field exists. Bio manager expiration date picker. |
| BIO-05 | Link-in-bio page is publicly accessible at branded URL | Public Next.js route /bio/[slug] outside (auth) layout. No auth required. |
| LINK-06 | Short link redirects to full URL with UTM parameters (302 redirect) | Separate Vercel project. Dynamic route /[code] with 302 Response. |
| LINK-07 | System tracks clicks on short links (count, device, referrer) | link_clicks table exists. Trigger auto-increments click_count. Vercel geo headers for country/city. |

</phase_requirements>

## Standard Stack

### Core (already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.1.6 | App framework | Already in use |
| @supabase/supabase-js | 2.99.1 | Database client | Already in use |
| @getlatedev/node | 0.1.54 | Late.dev API SDK | Already in use, lazy-initialized |
| @dnd-kit/core + @dnd-kit/sortable | 6.3.1 / 10.0.0 | Drag-and-drop for bio reorder | Already installed from Phase 4 |
| @tanstack/react-query | 5.90.21 | Data fetching/mutations | Already in use |
| zod | 4.3.6 | Validation schemas | Already in use |
| sonner | 2.0.7 | Toast notifications | Already in use |
| date-fns | 4.1.0 | Date formatting/comparison | Already in use |
| zustand | 5.0.11 | Client state management | Already in use |

### New (for redirect service only)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @supabase/supabase-js | 2.x | DB access in redirect service | Separate Vercel project |
| @vercel/functions | latest | geolocation() + ipAddress() helpers | Geo-IP in redirect service |

### Supabase Edge Function Runtime
| Tool | Version | Purpose | Notes |
|------|---------|---------|-------|
| Deno | 2.x | Edge Function runtime | Supabase uses Deno, NOT Node.js |
| supabase CLI | 2.78.1 | Deploy edge functions | Already in devDependencies |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Supabase Edge Function cron | Next.js cron (vercel.json) | Edge Function is closer to data, no cold start from external API route, can use service role directly |
| @vercel/functions geo | MaxMind GeoIP database | Vercel headers are free and automatic on Vercel hosting; MaxMind requires license + DB download |
| Separate Vercel project for redirect | Route in main app | Separate project keeps redirect latency minimal (~50ms) and avoids loading Next.js middleware |

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── (auth)/
│   │   ├── bio-manager/
│   │   │   └── page.tsx           # Bio manager (authenticated)
│   │   └── composer/
│   │       └── page.tsx           # Extended with workflow actions
│   ├── bio/
│   │   └── [slug]/
│   │       └── page.tsx           # Public bio page (NO auth)
│   └── api/
│       ├── posts/
│       │   └── [id]/
│       │       ├── route.ts       # Existing CRUD
│       │       └── workflow/
│       │           └── route.ts   # NEW: status transitions
│       ├── bio/
│       │   ├── route.ts           # Bio pages CRUD
│       │   └── [pageId]/
│       │       ├── route.ts       # Bio page detail
│       │       └── items/
│       │           └── route.ts   # Bio items CRUD + reorder
│       └── bio/
│           └── [slug]/
│               └── public/
│                   └── route.ts   # Public API for bio data
├── components/
│   ├── composer/
│   │   └── workflow-actions.tsx   # Submit/approve/reject/retry buttons
│   ├── bio-manager/
│   │   ├── bio-page-form.tsx      # Create/edit bio page
│   │   ├── bio-item-list.tsx      # Sortable items list
│   │   ├── bio-item-card.tsx      # Single item with actions
│   │   └── bio-preview.tsx        # Live preview
│   └── bio-public/
│       ├── bio-page.tsx           # Public rendering
│       └── bio-link-button.tsx    # Single link button
├── hooks/
│   ├── use-bio-pages.ts           # TanStack Query for bio
│   ├── use-bio-items.ts           # TanStack Query for items
│   └── use-workflow.ts            # Workflow mutations
└── lib/
    └── validations/
        ├── workflow.ts            # Workflow action schemas
        └── bio.ts                 # Bio page/item schemas

supabase/
└── functions/
    └── publish-scheduled/
        └── index.ts               # Deno Edge Function

# SEPARATE REPOSITORY: hitschies-link-redirect
hitschies-link-redirect/
├── src/
│   └── app/
│       └── [code]/
│           └── route.ts           # 302 redirect + click tracking
├── package.json
├── next.config.ts
└── .env.local                     # SUPABASE_URL + SERVICE_ROLE_KEY
```

### Pattern 1: Workflow State Machine
**What:** Server-side validation of allowed status transitions
**When to use:** Every status change goes through the workflow API
**Example:**
```typescript
// Valid transitions map
const VALID_TRANSITIONS: Record<string, string[]> = {
  draft: ["in_review"],
  in_review: ["approved", "draft"],     // reject returns to draft
  approved: ["scheduled"],
  scheduled: ["published", "failed"],   // system-only transitions
  failed: ["scheduled"],                // retry re-schedules
  published: [],                        // terminal state
}

// Role requirements per action
const ACTION_ROLES: Record<string, string[]> = {
  submit_review: ["admin", "editor"],   // creator submits
  approve: ["admin"],                   // only admin approves
  reject: ["admin"],                    // only admin rejects
  schedule: ["admin", "editor"],        // after approval
  retry: ["admin", "editor"],           // retry failed
}
```

### Pattern 2: Supabase Edge Function (Deno)
**What:** Cron-triggered function that publishes scheduled posts
**When to use:** Runs every minute via pg_cron
**Example:**
```typescript
// supabase/functions/publish-scheduled/index.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  )

  // Find posts ready to publish
  const { data: posts } = await supabase
    .from("posts")
    .select("*, post_channels(channel_id, channels(*))")
    .eq("status", "scheduled")
    .lte("scheduled_at", new Date().toISOString())

  for (const post of posts ?? []) {
    try {
      // Call Late.dev API to publish
      const response = await fetch("https://getlate.dev/api/v1/posts", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${Deno.env.get("LATE_API_KEY")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: post.caption,
          platforms: post.post_channels.map((pc: any) => ({
            platform: pc.channels.platform,
            accountId: pc.channels.account_id,
          })),
          publishNow: true,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        await supabase.from("posts").update({
          status: "published",
          published_at: new Date().toISOString(),
          platform_post_ids: result,
        }).eq("id", post.id)

        // Handle link-in-bio auto-update
        if (post.update_linkinbio && post.link_id) {
          // Move link to position 1 on the bio page
          // (shift all other items down)
        }
      } else {
        const error = await response.text()
        await supabase.from("posts").update({
          status: "failed",
          publish_errors: { message: error, timestamp: new Date().toISOString() },
        }).eq("id", post.id)
      }
    } catch (err) {
      await supabase.from("posts").update({
        status: "failed",
        publish_errors: { message: String(err), timestamp: new Date().toISOString() },
      }).eq("id", post.id)
    }
  }

  return new Response(JSON.stringify({ processed: posts?.length ?? 0 }))
})
```

### Pattern 3: Public Bio Page (No Auth)
**What:** Next.js page outside `(auth)` layout group, accessible without login
**When to use:** The /bio/[slug] route
**Example:**
```typescript
// src/app/bio/[slug]/page.tsx
// This is OUTSIDE the (auth) layout group -- no AuthShell wrapping
// Uses a server component that fetches directly from Supabase

import { createAdminClient } from "@/lib/supabase/admin"

export default async function BioPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = createAdminClient()

  const { data: page } = await supabase
    .from("linkinbio_pages")
    .select("*, linkinbio_items(*, links(*))")
    .eq("slug", slug)
    .eq("is_active", true)
    .single()

  // Filter expired items server-side
  const activeItems = page?.linkinbio_items
    ?.filter(item => !item.links?.expires_at || new Date(item.links.expires_at) > new Date())
    ?.sort((a, b) => a.position - b.position) ?? []

  // Render branded page
}
```

### Pattern 4: Short-Link Redirect (Separate Vercel Project)
**What:** Minimal Next.js app with single dynamic route
**When to use:** link.hitschies.de/[code]
**Example:**
```typescript
// In separate repo: src/app/[code]/route.ts
import { createClient } from "@supabase/supabase-js"
import { geolocation, ipAddress } from "@vercel/functions"
import { createHash } from "crypto"

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const { data: link } = await supabase
    .from("links")
    .select("id, full_url, expires_at, is_active")
    .eq("short_code", code)
    .single()

  if (!link || !link.is_active) {
    return new Response("Not Found", { status: 404 })
  }

  if (link.expires_at && new Date(link.expires_at) < new Date()) {
    return new Response("Link Expired", { status: 410 })
  }

  // Track click asynchronously (don't block redirect)
  const geo = geolocation(request)
  const ip = ipAddress(request)
  const ipHash = ip ? createHash("sha256").update(ip).digest("hex").slice(0, 16) : null
  const ua = request.headers.get("user-agent")
  const referrer = request.headers.get("referer")

  // Fire and forget -- don't await
  supabase.from("link_clicks").insert({
    link_id: link.id,
    country: geo?.country ?? null,
    city: geo?.city ?? null,
    ip_hash: ipHash,
    user_agent: ua,
    referrer: referrer,
    device_type: parseDeviceType(ua),
  })

  return Response.redirect(link.full_url!, 302)
}
```

### Anti-Patterns to Avoid
- **Direct status mutation without validation:** Never allow arbitrary status changes via PATCH. All transitions must go through the workflow API with transition validation.
- **Using Node.js imports in Edge Function:** Supabase Edge Functions run Deno. Use `https://esm.sh/` imports, not npm packages.
- **Blocking redirect on analytics insert:** The click tracking insert should be fire-and-forget. Do NOT await it before returning the 302 redirect.
- **Public bio page in (auth) layout:** The /bio route must be OUTSIDE the (auth) group layout to avoid the AuthShell redirect-to-login.
- **RLS in Edge Function:** The Edge Function uses the service role key, which bypasses RLS. This is intentional -- the function runs server-side without a user session.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Drag-and-drop reorder | Custom drag handlers | @dnd-kit/sortable (already installed) | Touch support, accessibility, animation |
| Geo-IP resolution | MaxMind DB lookup | Vercel geolocation headers | Free, automatic on Vercel, zero config |
| Cron scheduling | setInterval in API route | Supabase pg_cron + pg_net | Reliable, database-level, survives deployments |
| User-agent parsing | Regex parsing | Simple device_type detection (mobile/desktop/tablet) | Full UA parsing is overkill for analytics v1 |
| Short code generation | Custom random string | Existing DB trigger (generate_short_code) | Already implemented in Phase 3 schema |
| Click count increment | Manual UPDATE | Existing DB trigger (increment_link_clicks) | Already implemented in Phase 3 schema |

**Key insight:** The database schema from Phase 1 already includes triggers for short code generation and click count incrementing. The tables for bio pages, bio items, and approval logs already exist. The main work is building the API routes, UI components, and Edge Function -- NOT schema changes.

## Common Pitfalls

### Pitfall 1: Deno vs Node.js in Edge Functions
**What goes wrong:** Using `require()`, `process.env`, or npm package imports in a Supabase Edge Function
**Why it happens:** Developers are used to Node.js conventions
**How to avoid:** Use `Deno.env.get()`, `import from "https://esm.sh/..."`, and `Deno.serve()`. Do NOT use the @getlatedev/node SDK -- call the Late.dev REST API directly with fetch.
**Warning signs:** Build errors mentioning `require is not defined` or `process is not defined`

### Pitfall 2: TypeScript Types Missing for New Tables
**What goes wrong:** TypeScript errors when accessing `linkinbio_pages`, `linkinbio_items`, or `approval_logs` via Supabase client
**Why it happens:** These tables exist in the SQL schema but are NOT in `src/lib/supabase/types.ts`
**How to avoid:** Add Row/Insert/Update type definitions for all three tables to types.ts BEFORE writing any code that references them
**Warning signs:** Type errors on `.from("linkinbio_pages")`

### Pitfall 3: RLS Blocking Edge Function Queries
**What goes wrong:** Edge Function gets empty results when querying posts
**Why it happens:** Edge Function has no user session, so RLS policies that require `auth.uid() IS NOT NULL` block access
**How to avoid:** Edge Function MUST use `SUPABASE_SERVICE_ROLE_KEY` (bypasses RLS), NOT the anon key
**Warning signs:** Edge Function logs show 0 posts found when posts exist in the database

### Pitfall 4: Public Bio Page Behind Auth
**What goes wrong:** Visitors to /bio get redirected to login
**Why it happens:** Route is inside the `(auth)` layout group which has AuthShell middleware
**How to avoid:** Place /bio/[slug] route OUTSIDE the (auth) group (directly under `src/app/bio/`)
**Warning signs:** Non-logged-in users see login page instead of bio

### Pitfall 5: Cron Job Authentication
**What goes wrong:** pg_cron HTTP call to Edge Function returns 401
**Why it happens:** Edge Function requires Authorization header
**How to avoid:** Store the anon/service key in Vault and pass it as Bearer token in the pg_cron HTTP call. See the Supabase docs pattern with `vault.create_secret()` and `vault.decrypted_secrets`.
**Warning signs:** cron.job_run_details shows HTTP 401 responses

### Pitfall 6: Late.dev Platform ID Mismatch
**What goes wrong:** Publishing fails because platform account IDs don't match what Late.dev expects
**Why it happens:** The channels table stores our own account_id but Late.dev has its own account identifiers
**How to avoid:** When connecting channels in Phase 2, the Late.dev account ID should have been stored in the channels table `metadata` field or `account_id` field. Verify this mapping exists and use the correct field.
**Warning signs:** Late.dev API returns "Account not found" errors

### Pitfall 7: Race Condition in Cron Publishing
**What goes wrong:** Same post gets published twice when cron fires overlap
**Why it happens:** Two cron executions query the same post before either updates its status
**How to avoid:** Use a "publishing" intermediate status or an atomic UPDATE...RETURNING query that only selects posts and marks them as in-progress in a single transaction
**Warning signs:** Duplicate posts on social media platforms

## Code Examples

### Workflow Action API Route
```typescript
// src/app/api/posts/[id]/workflow/route.ts
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

const workflowSchema = z.object({
  action: z.enum(["submit_review", "approve", "reject", "schedule", "retry"]),
  comment: z.string().optional(),
  scheduledAt: z.string().datetime().optional(),
})

const TRANSITIONS: Record<string, Record<string, string>> = {
  submit_review: { from: "draft", to: "in_review" },      // note: DB enum is "review"
  approve: { from: "review", to: "approved" },
  reject: { from: "review", to: "draft" },
  schedule: { from: "approved", to: "scheduled" },
  retry: { from: "failed", to: "scheduled" },
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  // ... auth check, role check, validate transition, update status, log to approval_logs
}
```

### Composer Workflow Actions Component
```typescript
// src/components/composer/workflow-actions.tsx
// Renders inline in composer based on current post status:
// - Draft: "Zur Review einreichen" button (editor/admin)
// - In Review: "Freigeben" / "Ablehnen" buttons (admin only)
// - Approved: Schedule picker becomes active
// - Failed: "Erneut versuchen" button + error message
// - Published: Read-only with green badge + published_at date
```

### pg_cron Setup SQL
```sql
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Store secrets in Vault
SELECT vault.create_secret(
  'https://YOUR-PROJECT.supabase.co',
  'project_url'
);
SELECT vault.create_secret(
  'YOUR_SUPABASE_ANON_KEY',
  'anon_key'
);

-- Schedule the publishing function to run every minute
SELECT cron.schedule(
  'publish-scheduled-posts',
  '* * * * *',
  $$
  SELECT net.http_post(
    url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'project_url')
           || '/functions/v1/publish-scheduled',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'anon_key')
    ),
    body := jsonb_build_object('time', now()::text)
  ) AS request_id;
  $$
);
```

### Device Type Parser (for redirect service)
```typescript
function parseDeviceType(ua: string | null): string {
  if (!ua) return "unknown"
  if (/mobile|android|iphone|ipad/i.test(ua)) return "mobile"
  if (/tablet|ipad/i.test(ua)) return "tablet"
  return "desktop"
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Vercel Cron (vercel.json) | Supabase pg_cron + pg_net | 2024 | No cold starts, closer to data, more reliable |
| req.geo in middleware | @vercel/functions geolocation() | 2025 | req.geo deprecated in Next.js 15+, use helper instead |
| Custom geo-IP service | Vercel request headers (x-vercel-ip-country, x-vercel-ip-city) | Stable | Free, automatic, no external API needed |
| Supabase Edge Functions Deno 1.x | Deno 2.x runtime | Late 2024 | Updated import patterns, better npm compat via esm.sh |

**Deprecated/outdated:**
- `req.geo` in Next.js middleware -- use `geolocation()` from `@vercel/functions` instead
- Deno `serve()` from `std/http/server.ts` -- use `Deno.serve()` directly (Deno 2.x)

## Open Questions

1. **Late.dev Account ID Mapping**
   - What we know: Channels table has `account_id` field, Late.dev requires `accountId` in publish call
   - What's unclear: Whether the stored `account_id` matches Late.dev's account identifier, or if it's a platform-native ID
   - Recommendation: Inspect existing channel data. If mismatch, add `late_account_id` to channels.metadata JSONB

2. **Late.dev Media Handling**
   - What we know: Late.dev requires pre-signed upload URLs for media, not direct file paths
   - What's unclear: Whether media already uploaded to Supabase Storage can be referenced by public URL, or needs re-upload to Late.dev
   - Recommendation: Try passing the Supabase Storage public URL as mediaUrl first. If rejected, implement the presigned upload flow.

3. **Late.dev Rate Limits**
   - What we know: Rate limits exist but specifics not found in public docs
   - What's unclear: Exact limits per minute/hour, behavior when exceeded
   - Recommendation: Process posts sequentially (not Promise.all) in the cron function. Add 1-second delay between API calls if multiple posts are scheduled for the same minute.

4. **Edge Function in the Same Repo**
   - What we know: Supabase CLI creates functions under `supabase/functions/`. The project already has `supabase` in devDependencies.
   - What's unclear: Whether the current project has a `supabase` directory set up for local development
   - Recommendation: Create `supabase/functions/publish-scheduled/index.ts` and deploy via `supabase functions deploy publish-scheduled`

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 |
| Config file | vitest.config.ts |
| Quick run command | `npm test` |
| Full suite command | `npm test -- --coverage` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| WRKF-01 | Status lifecycle transitions | unit | `npx vitest run src/lib/__tests__/workflow-transitions.test.ts -x` | Wave 0 |
| WRKF-02 | Submit for review mutation | unit | `npx vitest run src/hooks/__tests__/use-workflow.test.ts -x` | Wave 0 |
| WRKF-03 | Approve/reject with comment | unit | `npx vitest run src/hooks/__tests__/use-workflow.test.ts -x` | Wave 0 |
| WRKF-04 | Schedule after approval | unit | `npx vitest run src/lib/__tests__/workflow-transitions.test.ts -x` | Wave 0 |
| WRKF-05 | Auto-publish via Edge Function | integration/manual | Manual -- Edge Function runs in Deno, not testable in jsdom | manual-only |
| WRKF-06 | Failed post error + retry | unit | `npx vitest run src/components/__tests__/workflow-actions.test.tsx -x` | Wave 0 |
| BIO-01 | Create bio page | unit | `npx vitest run src/hooks/__tests__/use-bio-pages.test.ts -x` | Wave 0 |
| BIO-02 | Add/remove/reorder links | unit | `npx vitest run src/components/__tests__/bio-item-list.test.tsx -x` | Wave 0 |
| BIO-03 | Auto-move link on publish | integration/manual | Manual -- requires Edge Function execution | manual-only |
| BIO-04 | Link expiration | unit | `npx vitest run src/lib/__tests__/bio-utils.test.ts -x` | Wave 0 |
| BIO-05 | Public bio page accessible | unit | `npx vitest run src/app/bio/__tests__/bio-page.test.tsx -x` | Wave 0 |
| LINK-06 | Short link 302 redirect | manual | Manual -- separate Vercel project | manual-only |
| LINK-07 | Click tracking analytics | manual | Manual -- separate Vercel project | manual-only |

### Sampling Rate
- **Per task commit:** `npm test`
- **Per wave merge:** `npm test -- --coverage`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/lib/__tests__/workflow-transitions.test.ts` -- covers WRKF-01, WRKF-04
- [ ] `src/hooks/__tests__/use-workflow.test.ts` -- covers WRKF-02, WRKF-03
- [ ] `src/components/__tests__/workflow-actions.test.tsx` -- covers WRKF-06
- [ ] `src/hooks/__tests__/use-bio-pages.test.ts` -- covers BIO-01
- [ ] `src/components/__tests__/bio-item-list.test.tsx` -- covers BIO-02
- [ ] `src/lib/__tests__/bio-utils.test.ts` -- covers BIO-04 (expiration filtering)
- [ ] `src/app/bio/__tests__/bio-page.test.tsx` -- covers BIO-05

## Sources

### Primary (HIGH confidence)
- Supabase SQL schema (001_initial_schema.sql) -- verified all tables, triggers, indexes exist
- Existing codebase (src/lib/supabase/types.ts) -- confirmed missing type definitions
- Existing codebase (package.json) -- confirmed all dependencies already installed
- [Supabase Edge Functions Scheduling Docs](https://supabase.com/docs/guides/functions/schedule-functions) -- pg_cron + pg_net pattern
- [Supabase Cron Module](https://supabase.com/docs/guides/cron) -- cron scheduling capabilities

### Secondary (MEDIUM confidence)
- [Late.dev API Documentation](https://docs.getlate.dev) -- createPost endpoint, publishNow, platforms array
- [Late.dev Social Media API](https://getlate.dev/social-media-api) -- general capabilities
- [Vercel Geolocation Headers](https://vercel.com/kb/guide/geo-ip-headers-geolocation-vercel-functions) -- x-vercel-ip-country, x-vercel-ip-city headers
- [@vercel/functions](https://vercel.com/docs/headers/request-headers) -- geolocation() and ipAddress() helpers
- [@getlatedev/node on npm](https://www.npmjs.com/package/@getlatedev/node) -- SDK structure

### Tertiary (LOW confidence)
- Late.dev rate limits -- not found in public docs, recommendation to process sequentially is precautionary
- Late.dev media URL handling -- unclear if Supabase Storage URLs are accepted directly

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all libraries already installed and verified in package.json
- Architecture: HIGH - database schema verified, existing patterns well-documented in codebase
- Workflow state machine: HIGH - standard pattern, well-understood transitions
- Edge Function: MEDIUM - Deno runtime patterns verified with Supabase docs, but Late.dev API integration untested
- Short-link redirect: MEDIUM - Vercel geo headers verified, but separate repo setup is straightforward
- Pitfalls: HIGH - identified from direct codebase inspection and official docs

**Research date:** 2026-03-13
**Valid until:** 2026-04-13 (stable patterns, well-established stack)
