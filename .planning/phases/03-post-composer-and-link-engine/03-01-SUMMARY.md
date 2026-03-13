---
phase: 03-post-composer-and-link-engine
plan: 01
subsystem: api
tags: [supabase, zod, tanstack-query, crud, posts, links, utm]

requires:
  - phase: 02-entity-layer
    provides: "Supabase client, auth helpers, campaign API pattern, media table types"
provides:
  - "Complete DB types for posts, post_channels, post_media, links, link_clicks, utm_templates"
  - "Zod validation schemas for posts, links, UTM templates"
  - "CRUD API routes for posts (with junction tables), links, UTM templates"
  - "TanStack Query hooks for posts, links, UTM templates"
  - "Platform character limits and post type/status constants"
affects: [03-02, 03-03, 03-04, 04-calendar-and-scheduling]

tech-stack:
  added: []
  patterns: [multi-table-insert-with-rollback, junction-table-management, generated-column-exclusion]

key-files:
  created:
    - src/lib/constants/platform-limits.ts
    - src/lib/validations/post.ts
    - src/lib/validations/link.ts
    - src/lib/validations/utm-template.ts
    - src/app/api/posts/route.ts
    - src/app/api/posts/[id]/route.ts
    - src/hooks/use-posts.ts
    - src/app/api/links/route.ts
    - src/app/api/links/[id]/route.ts
    - src/hooks/use-links.ts
    - src/app/api/utm-templates/route.ts
    - src/app/api/utm-templates/[id]/route.ts
    - src/hooks/use-utm-templates.ts
  modified:
    - src/lib/supabase/types.ts

key-decisions:
  - "Post status auto-set to 'scheduled' when scheduledAt provided, otherwise 'draft'"
  - "Junction table inserts rolled back on failure by deleting the parent post"
  - "Link Insert type excludes short_url (GENERATED ALWAYS) and makes short_code optional (trigger-generated)"

patterns-established:
  - "Multi-table insert with rollback: insert parent, then junction rows, delete parent if junction fails"
  - "Generated column exclusion: never include DB-generated fields in Insert/Update types"
  - "Junction table replacement on update: delete all, then re-insert"

requirements-completed: [LINK-01, LINK-04, LINK-05, CAMP-03]

duration: 7min
completed: 2026-03-13
---

# Phase 3 Plan 01: Data Layer Summary

**Complete CRUD data layer for posts (with junction tables), links (with trigger-generated fields), and UTM templates with Zod validation and TanStack Query hooks**

## Performance

- **Duration:** 7 min
- **Started:** 2026-03-13T16:21:00Z
- **Completed:** 2026-03-13T16:28:00Z
- **Tasks:** 3
- **Files modified:** 14

## Accomplishments
- Fixed TypeScript types to match actual DB schema (posts had wrong fields, links missing fields)
- Added 5 new table type definitions (post_channels, post_media, link_clicks, utm_templates, fixed links)
- Built post CRUD API with multi-table insert/update handling (posts + post_channels + post_media)
- Link API correctly omits trigger-generated fields (short_code, short_url, full_url)
- Post GET includes campaign join data (color, name) for CAMP-03 calendar prep

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix TypeScript types and create Zod validation schemas** - `73a7944` (feat)
2. **Task 2: Post CRUD API routes and TanStack Query hook** - `ec4ac4d` (feat)
3. **Task 3: Link and UTM template API routes and hooks** - `b5d0b61` (feat)

## Files Created/Modified
- `src/lib/supabase/types.ts` - Fixed posts table, added post_channels, post_media, link_clicks, utm_templates, fixed links
- `src/lib/constants/platform-limits.ts` - Instagram/TikTok char limits, post types and statuses
- `src/lib/validations/post.ts` - Zod schemas for post create/update with channel/media validation
- `src/lib/validations/link.ts` - Zod schemas for link create/update with URL validation
- `src/lib/validations/utm-template.ts` - Zod schemas for UTM template create/update
- `src/app/api/posts/route.ts` - Post list (with campaign join) and create (with junction tables)
- `src/app/api/posts/[id]/route.ts` - Post GET/PATCH/DELETE with junction table management
- `src/hooks/use-posts.ts` - usePosts, usePost, useCreatePost, useUpdatePost, useDeletePost
- `src/app/api/links/route.ts` - Link list (with campaign join) and create (omits generated fields)
- `src/app/api/links/[id]/route.ts` - Link GET (with post_count)/PATCH/DELETE
- `src/hooks/use-links.ts` - useLinks, useLink, useCreateLink, useUpdateLink, useDeleteLink
- `src/app/api/utm-templates/route.ts` - UTM template list and create with default-unsetting
- `src/app/api/utm-templates/[id]/route.ts` - UTM template GET/PATCH (with default-unsetting)/DELETE
- `src/hooks/use-utm-templates.ts` - useUtmTemplates, useCreateUtmTemplate, useUpdateUtmTemplate, useDeleteUtmTemplate

## Decisions Made
- Post status auto-set to "scheduled" when scheduledAt provided, otherwise defaults to "draft"
- Junction table inserts rolled back on failure by deleting the parent post record
- Link Insert type excludes short_url (GENERATED ALWAYS column) and makes short_code optional (trigger-generated)
- UTM template default-unsetting: when setting a template as default, all other templates have is_default set to false first

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- `npx next build --no-lint` flag not supported in Next.js 16 -- used `npx next build` instead (linting passed)

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All data layer APIs ready for UI consumption in plans 03-02, 03-03, 03-04
- Post GET includes campaign color data needed for calendar view (CAMP-03)
- Platform character limits available for composer UI validation

## Self-Check: PASSED

All 14 files verified present. All 3 task commits verified in git log.

---
*Phase: 03-post-composer-and-link-engine*
*Completed: 2026-03-13*
