---
phase: 02-entity-layer
plan: 01
subsystem: api, ui
tags: [tanstack-query, late-dev, oauth, channels, supabase, react]

requires:
  - phase: 01-foundation
    provides: Auth shell, Supabase clients, shadcn components, sidebar navigation

provides:
  - TanStack Query provider wrapping auth layout
  - Channel management page with card grid and health status badges
  - Late.dev OAuth integration (connect/callback/health API routes)
  - EntityPageHeader shared component for consistent page layout
  - EmptyState shared component for branded empty states
  - ConfirmDialog shared component for destructive action confirmation
  - CAMPAIGN_COLORS and HASHTAG_CATEGORIES constants
  - Media table types aligned with DB schema

affects: [02-02, 02-03, 03-composer, 04-calendar]

tech-stack:
  added: ["@tanstack/react-query ^5", "@getlatedev/node"]
  patterns: [TanStack Query hooks for server state, lazy SDK initialization, entity page layout pattern]

key-files:
  created:
    - src/providers/query-provider.tsx
    - src/components/shared/entity-page-header.tsx
    - src/components/shared/empty-state.tsx
    - src/components/shared/confirm-dialog.tsx
    - src/lib/late-dev/client.ts
    - src/lib/validations/channel.ts
    - src/app/api/channels/route.ts
    - src/app/api/channels/[id]/route.ts
    - src/app/api/channels/connect/route.ts
    - src/app/api/channels/callback/route.ts
    - src/app/api/channels/health/route.ts
    - src/hooks/use-channels.ts
    - src/components/channels/channel-card.tsx
    - src/components/channels/channel-grid.tsx
    - src/components/channels/connect-channel-dialog.tsx
    - src/components/channels/channel-actions.tsx
    - src/app/(auth)/channels/page.tsx
  modified:
    - src/lib/supabase/types.ts
    - src/lib/utils/constants.ts
    - src/components/layout/auth-shell.tsx
    - src/components/layout/app-sidebar.tsx
    - package.json

key-decisions:
  - "Lazy Late.dev client initialization to avoid build-time env var errors"
  - "TanStack Query provider in AuthShell (client component) not layout.tsx (server component)"
  - "Health status mapped from Late.dev healthy/warning/error to connected/expiring/disconnected"

patterns-established:
  - "TanStack Query hook pattern: queryKey constants, fetch-based queryFn, mutation with invalidation"
  - "Entity page layout: EntityPageHeader + content area + empty state fallback"
  - "Admin-only actions via useRequireRole(['admin']) with conditional rendering"
  - "API route pattern: auth check, Zod validation, Supabase query, {data}/{error} envelope"

requirements-completed: [CHAN-01, CHAN-02, CHAN-03, CHAN-04]

duration: 14min
completed: 2026-03-13
---

# Phase 2 Plan 01: Channel Management Summary

**TanStack Query data layer, Late.dev OAuth channel connection, health status monitoring, and reusable entity page infrastructure**

## Performance

- **Duration:** 14 min
- **Started:** 2026-03-13T14:55:04Z
- **Completed:** 2026-03-13T15:09:04Z
- **Tasks:** 2
- **Files modified:** 23

## Accomplishments
- TanStack Query provider wraps auth layout, enabling server state management for all entity pages
- Channel management page at /channels with card grid, health badges (green/yellow/red), and admin-only connect/disconnect
- Late.dev OAuth integration with connect URL generation, callback handling, and health polling every 5 minutes
- Three reusable shared components (EntityPageHeader, EmptyState, ConfirmDialog) ready for Plans 02 and 03
- Media table types corrected to match actual DB schema (added media_type, tags, thumbnail_path, duration_seconds, usage_count)

## Task Commits

Each task was committed atomically:

1. **Task 1: Shared infrastructure** - `97a583d` (feat)
2. **Task 2: Channel API routes and page** - `642a69f` (feat)

## Files Created/Modified
- `src/providers/query-provider.tsx` - TanStack QueryClientProvider with 60s staleTime
- `src/components/shared/entity-page-header.tsx` - Reusable header with title, description, role-gated action button
- `src/components/shared/empty-state.tsx` - Branded empty state with icon, text, CTA
- `src/components/shared/confirm-dialog.tsx` - Confirmation dialog with destructive/default variants
- `src/lib/late-dev/client.ts` - Lazy Late.dev SDK initialization
- `src/lib/validations/channel.ts` - Zod schemas for connect and callback
- `src/app/api/channels/route.ts` - GET list, POST create channel
- `src/app/api/channels/[id]/route.ts` - PATCH update, DELETE soft-disconnect (admin-only)
- `src/app/api/channels/connect/route.ts` - GET Late.dev auth URL (admin-only)
- `src/app/api/channels/callback/route.ts` - POST OAuth callback handler
- `src/app/api/channels/health/route.ts` - GET token health status for all channels
- `src/hooks/use-channels.ts` - useChannels, useChannelHealth, useConnectChannel, useDisconnectChannel
- `src/components/channels/channel-card.tsx` - Card with platform icon, name, status badge, relative date
- `src/components/channels/channel-grid.tsx` - Responsive grid with skeleton loading
- `src/components/channels/connect-channel-dialog.tsx` - Platform selection wizard (Instagram/TikTok)
- `src/components/channels/channel-actions.tsx` - Dropdown with reconnect and disconnect actions
- `src/app/(auth)/channels/page.tsx` - Channel management page with empty state and expiring token toast
- `src/lib/supabase/types.ts` - Fixed media table types to match DB schema
- `src/lib/utils/constants.ts` - Added Kanaele nav item, CAMPAIGN_COLORS, HASHTAG_CATEGORIES
- `src/components/layout/auth-shell.tsx` - Wrapped with QueryProvider
- `src/components/layout/app-sidebar.tsx` - Added Radio icon for Kanaele nav item

## Decisions Made
- **Lazy Late.dev client:** Module-level instantiation caused build errors because LATE_API_KEY is not available at build time. Changed to lazy initialization via `getLateClient()` function.
- **QueryProvider in AuthShell:** Placed inside the client-side AuthShell component rather than the server-side layout.tsx, since QueryClientProvider requires client context.
- **Health status mapping:** Late.dev returns healthy/warning/error; mapped to connected/expiring/disconnected for user-facing German labels.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Lazy Late.dev client initialization**
- **Found during:** Task 2 (API routes)
- **Issue:** Module-level `new Late()` threw during `npm run build` because LATE_API_KEY env var is not set at build time
- **Fix:** Changed from exported `lateClient` constant to `getLateClient()` factory function with singleton caching
- **Files modified:** src/lib/late-dev/client.ts, all API routes importing it
- **Verification:** `npm run build` passes clean
- **Committed in:** 642a69f (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Essential fix for build compatibility. No scope creep.

## Issues Encountered
None beyond the deviation above.

## User Setup Required

External services require manual configuration:
- **LATE_API_KEY** environment variable must be set (from Late.dev Dashboard -> API Keys)
- **OAuth callback URL** must be configured in Late.dev Dashboard -> Settings -> Callback URLs to `{NEXT_PUBLIC_APP_URL}/api/channels/callback`

## Next Phase Readiness
- TanStack Query provider active, shared components ready for Plans 02 (campaigns/hashtags) and 03 (media)
- EntityPageHeader, EmptyState, ConfirmDialog patterns established for reuse
- CAMPAIGN_COLORS and HASHTAG_CATEGORIES constants ready for campaign/hashtag pages
- Channel data available via useChannels hook for post composer (Phase 3)

---
*Phase: 02-entity-layer*
*Completed: 2026-03-13*
