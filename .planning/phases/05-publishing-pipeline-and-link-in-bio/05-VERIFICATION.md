---
phase: 05-publishing-pipeline-and-link-in-bio
verified: 2026-03-14T00:00:00Z
status: human_needed
score: 13/13 must-haves verified
human_verification:
  - test: "Submit a draft post for review and confirm status changes to 'review' in the UI"
    expected: "Post status updates, 'Freigeben'/'Ablehnen' buttons appear for admin"
    why_human: "Requires browser + authenticated session + real DB row"
  - test: "Reject a post as admin with a rejection comment"
    expected: "Post returns to draft status, amber banner with rejection text appears in composer"
    why_human: "End-to-end UI interaction with role gating cannot be verified statically"
  - test: "Approve and schedule a post then verify Edge Function publishes it"
    expected: "Post status changes to published, platform_post_ids populated"
    why_human: "Requires deployed Supabase Edge Function, LATE_API_KEY secret, and pg_cron setup"
  - test: "Create a bio page at /bio-manager and verify it appears at /bio/[slug] without login"
    expected: "Public page renders with Linktree-style layout, no auth prompt"
    why_human: "Public route accessibility requires browser test outside auth middleware"
  - test: "Add a link to the bio page, drag-and-drop to reorder, confirm new order persists"
    expected: "Position values update in database, order reflects after page refresh"
    why_human: "Drag-and-drop interaction requires browser testing"
  - test: "Set an expiration date on a bio item in the past and verify it is hidden on the public page"
    expected: "Item not visible on /bio/[slug], but shows grey 'Abgelaufen' badge in manager"
    why_human: "Date-based conditional rendering needs live data verification"
  - test: "Visit link.hitschies.de/[valid-code] and verify 302 redirect"
    expected: "Browser follows redirect to full_url with UTM params, click recorded in link_clicks"
    why_human: "Requires deployed Vercel project with DNS configured + real short code"
---

# Phase 5: Publishing Pipeline and Link-in-Bio Verification Report

**Phase Goal:** Posts auto-publish at scheduled times via Late.dev with robust error handling, the short-link redirect service is live at link.hitschies.de, and the link-in-bio page auto-updates when posts publish
**Verified:** 2026-03-14
**Status:** human_needed — All automated checks passed; 7 items require browser/deployment testing
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| #  | Truth | Status | Evidence |
|----|-------|--------|---------|
| 1  | Post status transitions are validated server-side | VERIFIED | `validateTransition()` in workflow-transitions.ts, called in workflow/route.ts line 74 |
| 2  | Editors can submit for review, admins can approve/reject | VERIFIED | ACTION_ROLES map in workflow-transitions.ts; role check in workflow-actions.tsx lines 64-68 |
| 3  | Rejected posts return to draft with comment preserved | VERIFIED | reject -> "draft" in ACTION_TO_STATUS; publish_errors JSONB stores review_comment (route.ts lines 89-96) |
| 4  | Failed posts can be retried (failed->scheduled) | VERIFIED | VALID_TRANSITIONS["failed"] = ["scheduled"]; retry action clears publish_errors (route.ts lines 102-106) |
| 5  | Approval log records each status action | VERIFIED | `supabase.from("approval_logs").insert(...)` in workflow/route.ts lines 124-129 |
| 6  | Editor sees "Zur Review einreichen" on draft posts | VERIFIED | workflow-actions.tsx line 139: "Zur Review einreichen" button for draft status |
| 7  | Admin sees "Freigeben"/"Ablehnen" on in-review posts | VERIFIED | workflow-actions.tsx lines 144-185; admin-only gate via useRequireRole |
| 8  | Scheduled posts auto-publish via Edge Function calling Late.dev | VERIFIED | supabase/functions/publish-scheduled/index.ts line 85: fetch to https://api.getlate.dev/v1/posts |
| 9  | Link-in-bio auto-updates when post publishes | VERIFIED | Edge Function updateLinkInBio() (lines 170-222) called when update_linkinbio && link_id |
| 10 | User can create/manage bio page via /bio-manager | VERIFIED | src/app/(auth)/bio-manager/page.tsx (90 lines), bio-page-form.tsx, bio-item-list.tsx (270 lines) |
| 11 | Bio items support drag-and-drop reorder | VERIFIED | bio-item-list.tsx uses DndContext + SortableContext + PointerSensor (8px), calls useReorderBioItems |
| 12 | Public bio page accessible without login at /bio/[slug] | VERIFIED | src/app/bio/[slug]/page.tsx outside (auth) layout group, uses createAdminClient |
| 13 | Short-link redirect service resolves codes with click tracking | VERIFIED | hitschies-link-redirect/src/app/[code]/route.ts: short_code lookup, link_clicks insert (fire-and-forget), 302 redirect |

**Score:** 13/13 truths verified

---

## Required Artifacts

### Plan 01 Artifacts

| Artifact | Min Lines | Actual | Status | Details |
|----------|-----------|--------|--------|---------|
| `src/lib/workflow-transitions.ts` | — | 84 lines | VERIFIED | Exports VALID_TRANSITIONS, ACTION_ROLES, ACTION_TO_STATUS, validateTransition |
| `src/app/api/posts/[id]/workflow/route.ts` | — | 138 lines | VERIFIED | POST handler with auth, Zod parse, validateTransition call, approval_logs insert |
| `src/hooks/use-workflow.ts` | — | 41 lines | VERIFIED | useWorkflowAction mutation, invalidates ["posts"] and ["calendar-posts"] |
| `src/lib/supabase/types.ts` | — | — | VERIFIED | approval_logs, linkinbio_pages, linkinbio_items types present (lines 491, 518, 557) |

### Plan 02 Artifacts

| Artifact | Min Lines | Actual | Status | Details |
|----------|-----------|--------|--------|---------|
| `src/components/composer/workflow-actions.tsx` | 80 | 287 | VERIFIED | All 6 status states rendered, German labels, rejection banner, role gating |
| `supabase/functions/publish-scheduled/index.ts` | 60 | 222 | VERIFIED | Deno.serve, esm.sh import, Late.dev API call, link-in-bio update |

### Plan 03 Artifacts

| Artifact | Min Lines | Actual | Status | Details |
|----------|-----------|--------|--------|---------|
| `src/app/(auth)/bio-manager/page.tsx` | 30 | 90 | VERIFIED | Auth page with create/edit modes, two-column layout |
| `src/app/bio/[slug]/page.tsx` | 30 | 67 | VERIFIED | Server component, createAdminClient, notFound(), SEO metadata |
| `src/components/bio-manager/bio-item-list.tsx` | 60 | 270 | VERIFIED | Full dnd-kit implementation, add link dialog, remove confirmation |

### Plan 04 Artifacts

| Artifact | Min Lines | Actual | Status | Details |
|----------|-----------|--------|--------|---------|
| `hitschies-link-redirect/src/app/[code]/route.ts` | 40 | 71 | VERIFIED | short_code lookup, expiry check, fire-and-forget link_clicks insert, 302 redirect |
| `hitschies-link-redirect/package.json` | — | present | VERIFIED | Next.js 15 + @supabase/supabase-js + @vercel/functions |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `use-workflow.ts` | `/api/posts/[id]/workflow` | fetch POST with action + comment | WIRED | line 19: `fetch(\`/api/posts/${postId}/workflow\`, { method: "POST" })` |
| `workflow/route.ts` | `workflow-transitions.ts` | validateTransition import | WIRED | line 4 import, line 74 call |
| `workflow-actions.tsx` | `use-workflow.ts` | useWorkflowAction mutation | WIRED | line 4 import, line 63 used |
| `composer-form.tsx` | `workflow-actions.tsx` | WorkflowActions component rendered | WIRED | line 22 import, line 311 `<WorkflowActions` |
| `supabase/functions/publish-scheduled/index.ts` | Late.dev REST API | fetch POST to api.getlate.dev/v1/posts | WIRED | line 85: `fetch("https://api.getlate.dev/v1/posts", ...)` |
| `bio-item-list.tsx` | `use-bio-items.ts` | useReorderBioItems mutation | WIRED | line 21 import, line 56 used, line 122 mutate call |
| `bio/[slug]/page.tsx` | Supabase | createAdminClient server-side fetch | WIRED | line 3 import, lines 19 and 40 used |
| `app-sidebar.tsx` | `/bio-manager` | NAV_ITEMS from constants.ts | WIRED | constants.ts line 7: Link-in-Bio nav item; sidebar imports NAV_ITEMS |
| `hitschies-link-redirect/[code]/route.ts` | Supabase links table | `.eq("short_code", code)` | WIRED | line 32 |
| `hitschies-link-redirect/[code]/route.ts` | Supabase link_clicks table | `.from("link_clicks").insert()` | WIRED | line 59 |

---

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|---------|
| WRKF-01 | 05-01 | Post status lifecycle Draft > Review > Approved > Scheduled > Published | SATISFIED | VALID_TRANSITIONS map + validateTransition in workflow-transitions.ts |
| WRKF-02 | 05-01, 05-02 | User can submit post for review | SATISFIED | submit_review action in workflow-actions.tsx + API route |
| WRKF-03 | 05-01, 05-02 | Reviewer can approve or reject with comment | SATISFIED | approve/reject actions with textarea, rejection stored in publish_errors |
| WRKF-04 | 05-01 | Approved posts can be scheduled | SATISFIED | schedule action transitions approved -> scheduled, sets scheduled_at |
| WRKF-05 | 05-02 | System auto-publishes scheduled posts via Late.dev | SATISFIED | Edge Function queries scheduled posts, calls Late.dev API |
| WRKF-06 | 05-01, 05-02 | Failed publications show error details and allow retry | SATISFIED | failed status renders error banner + "Erneut versuchen" button |
| BIO-01 | 05-03 | User can create branded link-in-bio landing page | SATISFIED | bio-manager page with bio-page-form.tsx (slug, title, logo, description) |
| BIO-02 | 05-03 | User can add, remove, and reorder links via drag-and-drop | SATISFIED | bio-item-list.tsx with dnd-kit, add dialog, remove confirmation |
| BIO-03 | 05-02 | When post with "update bio" publishes, link auto-moves to position 1 | SATISFIED | updateLinkInBio() in Edge Function moves item to position 0 (top) |
| BIO-04 | 05-03 | User can set link expiration dates | SATISFIED | bio-item-card.tsx with inline expiration date picker, isExpired badge |
| BIO-05 | 05-03 | Link-in-bio page publicly accessible at branded URL | SATISFIED | /bio/[slug] outside (auth) layout, createAdminClient, notFound() for missing |
| LINK-06 | 05-04 | Short link redirects to full URL with UTM parameters (302) | SATISFIED | route.ts line 70: `Response.redirect(redirectUrl, 302)` |
| LINK-07 | 05-04 | System tracks clicks (count, device, referrer) | SATISFIED | link_clicks insert with country, city, device_type, referrer, ip_hash |

**No orphaned requirements** — all 13 requirement IDs declared across plans are covered.

---

## Anti-Patterns Found

No blockers or stubs detected.

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `workflow-actions.tsx` | 99 | `return null` | Info | Legitimate: returns nothing during role loading state |
| `bio-item-list.tsx` | 88 | `return []` | Info | Legitimate: returns empty array when links query has no data yet |

---

## Human Verification Required

### 1. Workflow Submit-Review Flow

**Test:** Log in as an editor, open a draft post in the composer, click "Zur Review einreichen"
**Expected:** Post status changes to "review", composer shows "Freigeben"/"Ablehnen" buttons for admin user
**Why human:** Requires browser + authenticated session + real Supabase DB row with role-based rendering

### 2. Rejection Comment Flow

**Test:** Log in as admin, open a post in "review" status, click "Ablehnen", enter a comment, confirm
**Expected:** Post returns to draft status, amber banner shows "Abgelehnt: {comment}" in the composer
**Why human:** End-to-end UI interaction with role gating and JSONB round-trip cannot be verified statically

### 3. Auto-Publish via Edge Function

**Test:** Schedule a post for the near future, wait for pg_cron to fire (or invoke Edge Function manually)
**Expected:** Post status changes to "published", published_at is set, platform_post_ids populated
**Why human:** Requires deployed Supabase Edge Function, LATE_API_KEY secret, and pg_cron schedule configured. Note: the pg_cron SQL is provided as a comment in the Edge Function file but must be run manually.

### 4. Public Bio Page Accessibility

**Test:** Create a bio page at /bio-manager, navigate to /bio/[slug] in an incognito window
**Expected:** Page renders with Linktree-style layout, hitschies branding, no authentication prompt
**Why human:** Auth middleware bypass via route location outside (auth) group requires browser verification

### 5. Bio Drag-and-Drop Reorder Persistence

**Test:** Add multiple links to a bio page, drag them to reorder, refresh the page
**Expected:** New order persists — positions updated in database and reflect after reload
**Why human:** Drag-and-drop interaction requires browser pointer events; database persistence requires live Supabase connection

### 6. Expired Bio Item Filtering

**Test:** Set a bio item's expiration date to yesterday, check manager view and public page
**Expected:** Item shows grey "Abgelaufen" badge in manager, item is hidden from /bio/[slug]
**Why human:** Date-based conditional rendering requires live data with specific timestamps

### 7. Short-Link Redirect Service

**Test:** Visit link.hitschies.de/[valid-short-code] in a browser
**Expected:** Browser receives 302 redirect to full_url with UTM params; click_count increments in links table
**Why human:** Requires deployed Vercel project, DNS configured (CNAME to Vercel), and SUPABASE_URL/SERVICE_ROLE_KEY set as Vercel env vars. Note: this is a separate project in hitschies-link-redirect/ that must be moved to its own Git repository before deployment.

---

## Gaps Summary

No gaps found. All 13 must-haves are verified at all three levels (exists, substantive, wired). The phase goal is structurally achieved: the publishing pipeline state machine, workflow UI, auto-publish Edge Function, link-in-bio manager and public page, and the short-link redirect service are all implemented and correctly wired.

The 7 human verification items above are deployment and integration tests that cannot be confirmed statically. They represent expected pre-launch verification steps, not implementation gaps.

**Important deployment prerequisites not automated:**
- pg_cron SQL must be run in Supabase SQL Editor to activate auto-publishing
- LATE_API_KEY must be set as a Supabase Edge Function secret
- hitschies-link-redirect/ must be moved to a separate Git repository and deployed to Vercel with link.hitschies.de domain and DNS CNAME configured

---

_Verified: 2026-03-14_
_Verifier: Claude (gsd-verifier)_
