---
phase: 05-publishing-pipeline-and-link-in-bio
plan: 01
subsystem: api
tags: [workflow, state-machine, approval, linkinbio, tanstack-query, zod, supabase]

requires:
  - phase: 03-composer-and-link-engine
    provides: posts table, links table, TanStack Query patterns, Zod validation patterns
provides:
  - Workflow state machine with transition validation and role enforcement
  - Workflow API route (POST /api/posts/[id]/workflow) with approval_logs
  - Bio CRUD API routes (pages + items + public slug)
  - TanStack Query hooks for workflow and bio operations
  - Type definitions for approval_logs, linkinbio_pages, linkinbio_items
  - Zod validation schemas for workflow actions and bio entities
  - Wave 0 test stubs (31 todos) for entire phase
affects: [05-02-workflow-ui, 05-03-bio-manager-ui, 05-04-redirect-service]

tech-stack:
  added: []
  patterns: [workflow-state-machine, approval-log-pattern, public-route-pattern]

key-files:
  created:
    - src/lib/workflow-transitions.ts
    - src/lib/validations/workflow.ts
    - src/lib/validations/bio.ts
    - src/app/api/posts/[id]/workflow/route.ts
    - src/hooks/use-workflow.ts
    - src/app/api/bio/route.ts
    - src/app/api/bio/[pageId]/route.ts
    - src/app/api/bio/[pageId]/items/route.ts
    - src/app/api/bio/public/[slug]/route.ts
    - src/hooks/use-bio-pages.ts
    - src/hooks/use-bio-items.ts
  modified:
    - src/lib/supabase/types.ts

key-decisions:
  - "Rejection comments stored in publish_errors JSONB to avoid schema migration"
  - "Public bio route filters expired items server-side via Supabase or() filter"
  - "Bio items PATCH handles both reorder (items array) and single item update (itemId) via schema detection"

patterns-established:
  - "Workflow state machine: VALID_TRANSITIONS map + ACTION_ROLES + validateTransition function"
  - "Approval logging: every status change creates an approval_logs entry"
  - "Public API route pattern: no auth, slug-based lookup, active+visible+non-expired filtering"

requirements-completed: [WRKF-01, WRKF-02, WRKF-03, WRKF-04, WRKF-06]

duration: 6min
completed: 2026-03-13
---

# Phase 5 Plan 01: Workflow Data Layer and Bio API Summary

**Workflow state machine with role-based transition validation, approval logging, bio CRUD API routes with public slug endpoint, and TanStack Query hooks for all operations**

## Performance

- **Duration:** 6 min
- **Started:** 2026-03-13T22:46:49Z
- **Completed:** 2026-03-13T22:52:49Z
- **Tasks:** 3
- **Files modified:** 19

## Accomplishments
- Wave 0 test stubs (31 it.todo placeholders) established for the entire phase across 7 files
- Workflow state machine validates transitions (draft->review->approved->scheduled->published) with role enforcement (admin-only approve/reject)
- Full bio CRUD API with slug uniqueness, item reorder, and public endpoint filtering expired/invisible items
- All TanStack Query hooks follow established project patterns with toast notifications

## Task Commits

Each task was committed atomically:

1. **Task 1: Wave 0 test stubs for all phase plans** - `228ba63` (test)
2. **Task 2: Types, validation schemas, and workflow state machine** - `78ab42b` (feat)
3. **Task 3: Workflow API route and TanStack Query hooks** - `4998e28` (feat)

## Files Created/Modified
- `src/lib/__tests__/workflow-transitions.test.ts` - Workflow transition test stubs (5 todos)
- `src/hooks/__tests__/use-workflow.test.ts` - Workflow hook test stubs (4 todos)
- `src/components/__tests__/workflow-actions.test.tsx` - Workflow UI test stubs (5 todos)
- `src/hooks/__tests__/use-bio-pages.test.ts` - Bio pages hook test stubs (4 todos)
- `src/components/__tests__/bio-item-list.test.tsx` - Bio item list test stubs (5 todos)
- `src/lib/__tests__/bio-utils.test.ts` - Bio utility test stubs (4 todos)
- `src/app/bio/__tests__/bio-page.test.tsx` - Public bio page test stubs (4 todos)
- `src/lib/supabase/types.ts` - Added approval_logs, linkinbio_pages, linkinbio_items table types
- `src/lib/workflow-transitions.ts` - State machine with VALID_TRANSITIONS, ACTION_ROLES, validateTransition
- `src/lib/validations/workflow.ts` - Zod schema for workflow actions with schedule refinement
- `src/lib/validations/bio.ts` - Zod schemas for bio pages, items, and reorder
- `src/app/api/posts/[id]/workflow/route.ts` - POST handler with transition validation and approval_logs
- `src/hooks/use-workflow.ts` - TanStack Query mutation for workflow actions
- `src/app/api/bio/route.ts` - GET (list pages) and POST (create page with slug check)
- `src/app/api/bio/[pageId]/route.ts` - GET/PATCH/DELETE for single bio page
- `src/app/api/bio/[pageId]/items/route.ts` - GET/POST/PATCH/DELETE for bio items with reorder
- `src/app/api/bio/public/[slug]/route.ts` - Public bio page with active, visible, non-expired items
- `src/hooks/use-bio-pages.ts` - CRUD hooks for bio pages
- `src/hooks/use-bio-items.ts` - CRUD + reorder hooks for bio items

## Decisions Made
- Rejection comments stored in publish_errors JSONB field to avoid requiring a schema migration (no new column needed)
- Public bio route filters expired items server-side using Supabase or() filter on expires_at
- Bio items PATCH endpoint handles both reorder requests (items array) and single item updates (itemId) by detecting the schema shape

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed Zod v4 errorMap incompatibility**
- **Found during:** Task 2 (validation schemas)
- **Issue:** Zod v4 uses `error` parameter instead of `errorMap` for z.enum
- **Fix:** Changed `errorMap: () => ({ message: "..." })` to `error: "..."`
- **Files modified:** src/lib/validations/workflow.ts
- **Verification:** npx tsc --noEmit passes cleanly
- **Committed in:** 78ab42b (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Minor Zod API difference, no scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Workflow state machine and API ready for Plan 02 (Workflow UI)
- Bio API routes ready for Plan 03 (Bio Manager UI)
- All type definitions and validation schemas shared across plans
- 31 test stubs awaiting implementation in subsequent plans

---
*Phase: 05-publishing-pipeline-and-link-in-bio*
*Completed: 2026-03-13*

## Self-Check: PASSED

All 19 created files verified present. All 3 task commits verified in git log.
