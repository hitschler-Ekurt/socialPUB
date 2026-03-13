# Phase 5: Publishing Pipeline and Link-in-Bio - Context

**Gathered:** 2026-03-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Posts follow a full status lifecycle (Draft > In Review > Approved > Scheduled > Published) with review/approval workflow. Scheduled posts auto-publish via Late.dev using a Supabase Edge Function cron. Failed publications show error details with manual retry. A branded link-in-bio page is publicly accessible, auto-updates when posts with "update bio" enabled publish, and supports link expiration. A separate Vercel project serves short-link redirects at link.hitschies.de with full click analytics.

</domain>

<decisions>
## Implementation Decisions

### Status workflow UI
- All workflow controls live inline in the existing composer form — no separate post detail page
- Editor clicks "Zur Review einreichen" to move from Draft to In Review
- Any Admin can approve or reject — no specific reviewer assignment (lightweight for 3-5 person team)
- Rejected posts return to Draft status with the rejection comment visible as a banner/note in the composer
- Only the last status action is displayed ("Freigegeben von Anna am 13.03." or "Abgelehnt: Bitte Caption kuerzen") — no full activity timeline
- Approved posts can then be scheduled (set scheduled_at date/time)

### Publishing pipeline
- Supabase Edge Function runs on a cron schedule (every minute), queries posts where scheduled_at <= now AND status = 'scheduled', publishes via Late.dev API
- Failed publications set post status to 'failed' with red status badge visible on calendar and lists
- Click on failed post shows error message and "Erneut versuchen" (retry) button
- Manual retry only — no automatic retries. Gives team time to fix underlying issues (e.g., reconnect expired token)
- Successful publication updates status to 'published' with green badge. Toast notification if user is in the app when it happens
- Confetti animation deferred to Phase 6 (UX-06)

### Link-in-bio public page
- Linktree-style vertical list: centered column with hitschies logo at top, branded link buttons below
- Hosted as a public route in the main Next.js app (e.g., /bio) — no auth required for visitors
- Expired links auto-hide from the public page (not shown as disabled or with countdown)
- Manager UI shows expired links greyed out with "Abgelaufen" badge
- When a post with update_linkinbio enabled publishes, the associated link auto-moves to position 1

### Link-in-bio manager
- Dedicated /bio-manager page in the app (new sidebar nav item or sub-section under Links)
- Drag-and-drop to reorder links
- Add/remove links with expiration date picker
- Preview of the public page within the manager

### Short-link redirect service
- Separate minimal Vercel project deployed to link.hitschies.de
- Separate Git repository (not monorepo) — tiny codebase (~3 files)
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

</decisions>

<specifics>
## Specific Ideas

- "Playful Professional" design philosophy carries forward — bio page should feel branded and fun, not generic
- Bio page URL should be simple and shareable (e.g., hitschies-publisher.vercel.app/bio)
- Post status field needs to expand from current "draft" | "scheduled" to full lifecycle: "draft" | "in_review" | "approved" | "scheduled" | "published" | "failed"
- The existing `update_linkinbio` boolean field on posts already exists from Phase 3 — ready to use
- Short codes are already generated in the links table (Phase 3) — redirect service just needs to resolve them

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `usePosts` hook with full CRUD (TanStack Query) — needs status transition mutations
- `useUpdatePost` mutation — can update status field
- Late.dev client (`src/lib/late-dev/client.ts`) — lazy-initialized, ready for publishing calls
- Composer form (`src/components/composer/composer-form.tsx`) — already has editPostId prop and PATCH mode
- Composer store (Zustand) — manages form state, can be extended with workflow actions
- Links table with short_code field — already populated by Phase 3 link creation
- Sonner toast — used throughout for mutation feedback
- dnd-kit — already installed (Phase 4) for bio manager drag-drop

### Established Patterns
- Post status auto-set: `scheduledAt ? "scheduled" : "draft"` in POST /api/posts — needs workflow-aware logic
- API routes at /api/{resource} with Supabase server client + auth check + role check
- Zod validation schemas in src/lib/validations/
- Role-based UI: viewers see data, action buttons hidden (use-require-role.ts)
- Filter bar pattern for status filtering on calendar
- Dialog modals for confirmations

### Integration Points
- Posts table `status` column needs new enum values (in_review, approved, published, failed)
- Posts table needs `review_comment`, `reviewed_by`, `reviewed_at` columns
- Posts table needs `published_at`, `publish_error` columns
- Calendar and composer already read/write post status — will reflect new states automatically
- Bio links table needed (or extend existing links table with bio_position, bio_active, expires_at)
- Supabase Edge Functions require Deno runtime — separate from Next.js API routes

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 05-publishing-pipeline-and-link-in-bio*
*Context gathered: 2026-03-13*
