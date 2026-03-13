---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: executing
stopped_at: Completed 05-02-PLAN.md
last_updated: "2026-03-14T00:05:01.000Z"
last_activity: 2026-03-14 -- Plan 05-02 executed (workflow UI and auto-publishing)
progress:
  total_phases: 6
  completed_phases: 4
  total_plans: 17
  completed_plans: 16
  percent: 94
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-13)

**Core value:** Marketing-Team kann Posts fuer Instagram und TikTok planen, erstellen und veroeffentlichen -- mit integrierter URL-Link-Automation
**Current focus:** Phase 5 Publishing Pipeline and Link-in-Bio -- IN PROGRESS

## Current Position

Phase: 5 of 6 (Publishing Pipeline and Link-in-Bio)
Plan: 3 of 4 in current phase (05-02 complete)
Status: Executing Phase 05 plans
Last activity: 2026-03-14 -- Plan 05-02 executed (workflow UI and auto-publishing)

Progress: [█████████░] 94%

## Performance Metrics

**Velocity:**
- Total plans completed: 6
- Average duration: 11 min
- Total execution time: 0.9 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01 | 3/3 | 32min | 11min |
| 02 | 3/3 | 33min | 11min |

**Recent Trend:**
- Last 5 plans: 01-03 (15min), 02-01 (14min), 02-02 (5min), 02-03 (14min)
- Trend: steady

*Updated after each plan completion*
| Phase 03 P01 | 7min | 3 tasks | 14 files |
| Phase 03 P02 | 9min | 2 tasks | 12 files |
| Phase 03 P03 | 7min | 2 tasks | 6 files |
| Phase 03 P04 | 8min | 2 tasks | 4 files |
| Phase 04 P01 | 7min | 3 tasks | 21 files |
| Phase 04 P02 | 28min | 2 tasks | 12 files |
| Phase 04 P03 | 27min | 3 tasks | 13 files |
| Phase 05 P01 | 6min | 3 tasks | 19 files |
| Phase 05 P04 | 5min | 2 tasks | 9 files |
| Phase 05 P02 | 4min | 2 tasks | 4 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Roadmap]: 6 phases derived from 50 requirements at standard granularity
- [Roadmap]: Link Engine co-located with Composer (Phase 3) because UTM/short-link generation happens inside the composer flow
- [Roadmap]: Publishing pipeline in Phase 5 (not earlier) because it is the most failure-prone component and all inputs must be stable first
- [01-01]: Used Next.js 16.x (latest stable) instead of 15.x from research -- 16 is now current stable
- [01-01]: Google Fonts via link tag instead of next/font/google due to build-time network issue
- [01-01]: Kept middleware convention despite Next.js 16 deprecation warning (proxy replacement not yet needed)
- [01-02]: Expanded placeholder Database types to full table definitions (required for TypeScript compilation of auth queries)
- [01-02]: Used zod v4 backward-compatible API surface for request validation
- [01-03]: Zustand with persist middleware for sidebar collapse state (localStorage key: hitschies-ui)
- [01-03]: Inline Tabs in settings (not sub-routes) for snappy UX
- [01-03]: Viewer role can edit own profile but team management controls hidden
- [02-01]: Lazy Late.dev client initialization to avoid build-time env var errors
- [02-01]: TanStack Query provider in AuthShell (client component) not layout.tsx (server component)
- [02-01]: Health status mapped from Late.dev healthy/warning/error to connected/expiring/disconnected
- [Phase 02]: base-ui DropdownMenuTrigger uses render prop instead of asChild for custom trigger elements
- [02-03]: Select onValueChange accepts string|null in this shadcn/radix version -- handle null gracefully
- [02-03]: Bulk operations use Promise.all for parallel execution rather than sequential
- [02-03]: Video thumbnail uploaded to separate signed URL path alongside main file
- [Phase 03]: Post status auto-set to scheduled when scheduledAt provided, otherwise draft
- [Phase 03]: Link Insert excludes short_url (GENERATED ALWAYS) and makes short_code optional (trigger-generated)
- [Phase 03]: Junction table inserts rolled back on failure by deleting the parent post
- [03-02]: Zustand persist key hitschies-composer for composer draft state in localStorage
- [03-02]: Platform override tabs only shown when multiple platforms selected
- [03-02]: Schedule picker uses native date/time inputs (not custom calendar)
- [03-02]: Media picker uses dialog pattern for selection from library
- [03-03]: Preview components are props-driven (not store-coupled) for reuse across contexts
- [03-03]: UTM auto-fill tracks user-edited vs auto-filled fields via ref Set
- [03-03]: Template selection overwrites all UTM fields as explicit user action
- [03-04]: Plain HTML table with Tailwind instead of shadcn Table (not installed)
- [03-04]: Expandable table rows for UTM detail instead of separate detail view
- [03-04]: Preview components receive props from composer store for reactive updates
- [03-04]: Media URL from file_path via NEXT_PUBLIC_SUPABASE_URL storage pattern
- [04-01]: Calendar store uses Zustand without persist (ephemeral view state, no localStorage)
- [04-01]: Posts API expanded select includes post_channels and post_media for calendar cards
- [04-01]: Week/day views use 60px hourly slots with all-day row for unscheduled-time posts
- [04-01]: Magenta accent via CSS variable hsl(var(--magenta,330_80%_55%)) for today highlight
- [04-02]: PointerSensor with 8px distance constraint to distinguish clicks from drags
- [04-02]: Client-side filtering in useCalendarPosts (not server-side) since posts already fetched for date range
- [04-02]: PostDetailPopover uses fixed positioning with viewport clamping (shadcn Popover not installed)
- [04-02]: Composer hydration uses ref guard to prevent re-hydration after URL param clearing
- [04-02]: setSelectedChannelIds added to composer store for bulk channel assignment during edit hydration
- [04-03]: useDebounce hook created as reusable utility (not idea-specific)
- [04-03]: Kanban board uses optimistic local state with server sync via useEffect
- [04-03]: Undo toast on cross-column moves only (not same-column reorder)
- [04-03]: Campaign filter Select uses "none" sentinel value for Radix compatibility
- [05-01]: Rejection comments stored in publish_errors JSONB to avoid schema migration
- [05-01]: Public bio route filters expired items server-side via Supabase or() filter
- [05-01]: Bio items PATCH handles both reorder (items array) and single item update (itemId) via schema detection
- [05-04]: Next.js 15 for redirect service (not 16) for simplicity in minimal standalone project
- [05-04]: Fire-and-forget click tracking (no await on insert) for sub-100ms redirect latency
- [05-04]: SHA-256 IP hashing for privacy-preserving analytics
- [05-04]: @vercel/functions geolocation instead of deprecated req.geo
- [05-02]: Excluded supabase/functions from tsconfig (Deno runtime, not Node.js)
- [05-02]: WorkflowActions reads scheduledAt from composer store for schedule action
- [05-02]: Save buttons hidden for published/scheduled posts in edit mode

### Pending Todos

None yet.

### Blockers/Concerns

- TikTok API audit takes 2-8 weeks -- must be submitted before Phase 2 channel setup. Verify if Late.dev covers this.
- link.hitschies.de DNS must be configured early -- needed for short-link testing in Phase 3 and redirect service in Phase 5.
- Late.dev token refresh scope unclear -- does Late.dev auto-refresh Instagram tokens or must the app handle 50-day refresh cycle?
- LATE_API_KEY must be configured before channel connections work (Late.dev Dashboard -> API Keys)

## Session Continuity

Last session: 2026-03-14T00:05:01Z
Stopped at: Completed 05-02-PLAN.md
Resume file: .planning/phases/05-publishing-pipeline-and-link-in-bio/05-02-SUMMARY.md
