---
phase: 02-entity-layer
plan: 02
subsystem: ui, api
tags: [tanstack-query, zod, react, campaigns, hashtags, supabase, crud]

requires:
  - phase: 02-entity-layer
    provides: TanStack Query provider, EntityPageHeader, EmptyState, ConfirmDialog, CAMPAIGN_COLORS, HASHTAG_CATEGORIES constants

provides:
  - Campaign CRUD API routes with post_count and slug generation
  - Hashtag set CRUD API routes with hashtag normalization
  - TanStack Query hooks for campaigns and hashtag sets
  - Campaign card component with color-coded border and role-gated actions
  - Campaign dialog with preset color picker and Zod validation
  - Hashtag set list grouped by category with expand/collapse
  - Hashtag set dialog with textarea input, auto-# prepend, tag preview
  - Combined Kampagnen page with Kampagnen and Hashtag-Sets tabs

affects: [03-composer, 04-calendar]

tech-stack:
  added: []
  patterns: [color-coded campaign cards, category-grouped hashtag list, combined entity page with tabs, base-ui render prop for dropdown trigger]

key-files:
  created:
    - src/lib/validations/campaign.ts
    - src/lib/validations/hashtag-set.ts
    - src/app/api/campaigns/route.ts
    - src/app/api/campaigns/[id]/route.ts
    - src/app/api/hashtag-sets/route.ts
    - src/app/api/hashtag-sets/[id]/route.ts
    - src/hooks/use-campaigns.ts
    - src/hooks/use-hashtag-sets.ts
    - src/components/campaigns/campaign-card.tsx
    - src/components/campaigns/campaign-grid.tsx
    - src/components/campaigns/campaign-dialog.tsx
    - src/components/hashtags/hashtag-set-item.tsx
    - src/components/hashtags/hashtag-set-list.tsx
    - src/components/hashtags/hashtag-set-dialog.tsx
  modified:
    - src/app/(auth)/campaigns/page.tsx

key-decisions:
  - "base-ui DropdownMenuTrigger uses render prop instead of asChild for custom trigger elements"

patterns-established:
  - "Combined entity page with Tabs for related entities (campaigns + hashtag sets)"
  - "Color picker pattern: grid of preset color buttons with ring-2 ring-offset-2 selected state"
  - "Hashtag textarea input with live parsed tag preview"
  - "Category-grouped list with uppercase section headers"

requirements-completed: [CAMP-01, CAMP-02, HASH-01, HASH-02, HASH-03]

duration: 5min
completed: 2026-03-13
---

# Phase 2 Plan 02: Campaign & Hashtag Set Management Summary

**Color-coded campaign cards with CRUD dialogs and category-grouped hashtag sets on a combined tabbed Kampagnen page**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-13T15:29:20Z
- **Completed:** 2026-03-13T15:34:20Z
- **Tasks:** 2
- **Files modified:** 15

## Accomplishments
- Campaign management with color-coded cards, preset color picker (10 hitschies brand colors), date range display, post count badge
- Hashtag set management grouped by category (Brand/Produkt/Kampagne/Unkategorisiert) with expand/collapse and tag preview
- Combined Kampagnen page with two tabs replacing coming-soon placeholder
- Full CRUD operations with TanStack Query cache invalidation and German toast notifications
- Role-based UI: viewers see data, editors/admins see action controls

## Task Commits

Each task was committed atomically:

1. **Task 1: Campaign and hashtag set API routes with Zod validation** - `98fbd45` (feat)
2. **Task 2: Campaign and hashtag set hooks, components, and combined page** - `09c1321` (feat)

## Files Created/Modified
- `src/lib/validations/campaign.ts` - Zod schemas for create/update campaign with German error messages
- `src/lib/validations/hashtag-set.ts` - Zod schemas for create/update hashtag set
- `src/app/api/campaigns/route.ts` - GET list with post_count, POST create with slug generation
- `src/app/api/campaigns/[id]/route.ts` - PATCH update, DELETE soft-delete (is_active=false)
- `src/app/api/hashtag-sets/route.ts` - GET list ordered by category/name, POST create with # normalization
- `src/app/api/hashtag-sets/[id]/route.ts` - PATCH update, DELETE hard-delete
- `src/hooks/use-campaigns.ts` - useCampaigns, useCreateCampaign, useUpdateCampaign, useDeleteCampaign
- `src/hooks/use-hashtag-sets.ts` - useHashtagSets, useCreateHashtagSet, useUpdateHashtagSet, useDeleteHashtagSet
- `src/components/campaigns/campaign-card.tsx` - Card with 4px color border, date range, post count badge, dropdown actions
- `src/components/campaigns/campaign-grid.tsx` - Responsive grid with skeleton loading and empty state
- `src/components/campaigns/campaign-dialog.tsx` - Create/edit dialog with color picker grid, date fields, Zod validation
- `src/components/hashtags/hashtag-set-item.tsx` - Expandable row with category badge, tag count, preview
- `src/components/hashtags/hashtag-set-list.tsx` - Category-grouped list with section headers
- `src/components/hashtags/hashtag-set-dialog.tsx` - Create/edit dialog with textarea input, auto-# prepend, live tag preview
- `src/app/(auth)/campaigns/page.tsx` - Combined page with Kampagnen and Hashtag-Sets tabs

## Decisions Made
- **base-ui render prop:** DropdownMenuTrigger in base-ui (shadcn v5) uses `render` prop instead of `asChild` for composing custom trigger elements. Discovered during typecheck.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] base-ui DropdownMenuTrigger API**
- **Found during:** Task 2 (campaign card component)
- **Issue:** Campaign card used `asChild` prop on DropdownMenuTrigger, but base-ui uses `render` prop instead
- **Fix:** Changed to `render={<Button ... />}` pattern matching existing channel-actions.tsx
- **Files modified:** src/components/campaigns/campaign-card.tsx
- **Verification:** TypeScript check and build pass clean
- **Committed in:** 09c1321 (Task 2 commit)

**2. [Rule 3 - Blocking] base-ui Select onValueChange signature**
- **Found during:** Task 2 (hashtag set dialog)
- **Issue:** Select onValueChange callback receives `(value: string | null, eventDetails)` not just `(value: string)`
- **Fix:** Accepted nullable value with `??` fallback to NO_CATEGORY sentinel
- **Files modified:** src/components/hashtags/hashtag-set-dialog.tsx
- **Verification:** Build passes clean
- **Committed in:** 09c1321 (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (2 blocking)
**Impact on plan:** Both fixes required for base-ui API compatibility. No scope creep.

## Issues Encountered
None beyond the deviations above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Campaign and hashtag set data available via hooks for composer (Phase 3)
- useCampaigns hook provides campaign list for post assignment (CAMP-02)
- useHashtagSets hook provides sets for one-click hashtag insertion (HASH-02)
- All entity pages (channels, campaigns, hashtag sets) share consistent layout patterns

---
*Phase: 02-entity-layer*
*Completed: 2026-03-13*
