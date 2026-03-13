---
phase: 05-publishing-pipeline-and-link-in-bio
plan: 02
subsystem: ui, edge-function
tags: [workflow-ui, composer, edge-function, late-dev, auto-publish, link-in-bio]

requires:
  - phase: 05-publishing-pipeline-and-link-in-bio
    provides: workflow state machine, useWorkflowAction hook, useRequireRole hook
provides:
  - WorkflowActions component with status-aware action buttons
  - Composer form integration with workflow actions inline
  - Supabase Edge Function for cron-triggered auto-publishing via Late.dev
  - Link-in-bio auto-update on successful publish
affects: [05-03-bio-manager-ui]

tech-stack:
  added: []
  patterns: [edge-function-pattern, deno-serve-pattern, cron-publishing]

key-files:
  created:
    - src/components/composer/workflow-actions.tsx
    - supabase/functions/publish-scheduled/index.ts
  modified:
    - src/components/composer/composer-form.tsx
    - tsconfig.json

key-decisions:
  - "Excluded supabase/functions from tsconfig since Edge Functions use Deno runtime"
  - "WorkflowActions reads scheduledAt from composer store for schedule action"
  - "Save buttons hidden for published/scheduled posts in edit mode"

patterns-established:
  - "Edge Function pattern: Deno.serve + esm.sh imports + service role key"
  - "Workflow UI pattern: role-gated buttons with inline rejection comment textarea"

requirements-completed: [WRKF-02, WRKF-03, WRKF-05, WRKF-06, BIO-03]

duration: 4min
completed: 2026-03-14
---

# Phase 5 Plan 02: Workflow UI and Auto-Publishing Summary

**Status-aware workflow action buttons in composer with German labels, plus Deno Edge Function for cron-triggered publishing via Late.dev REST API with link-in-bio auto-update**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-13T23:01:07Z
- **Completed:** 2026-03-13T23:05:01Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- WorkflowActions component renders role-gated buttons per post status (draft/review/approved/scheduled/published/failed)
- All German UI labels match user decisions: Zur Review einreichen, Freigeben, Ablehnen, Erneut versuchen
- Rejection banner shows reviewer comment and timestamp for posts returned to draft
- Failed posts display error details with retry button
- Composer form hides save buttons for published/scheduled posts, shows workflow section in edit mode
- Supabase Edge Function queries scheduled posts and publishes via Late.dev REST API
- Edge Function handles success (status->published), failure (status->failed with error JSONB), and link-in-bio auto-update

## Task Commits

Each task was committed atomically:

1. **Task 1: Workflow actions component in composer** - `517b3ad` (feat)
2. **Task 2: Supabase Edge Function for auto-publishing** - `05a8c2f` (feat)

## Files Created/Modified
- `src/components/composer/workflow-actions.tsx` - Status-aware action buttons with role gating (230 lines)
- `src/components/composer/composer-form.tsx` - Integrated WorkflowActions inline, hidden save buttons for read-only statuses
- `supabase/functions/publish-scheduled/index.ts` - Deno Edge Function for cron publishing (222 lines)
- `tsconfig.json` - Excluded supabase/functions from TypeScript compilation (Deno runtime)

## Decisions Made
- Excluded supabase/functions from tsconfig since Edge Functions use Deno runtime (esm.sh imports, Deno.serve, Deno.env.get)
- WorkflowActions reads scheduledAt from composer Zustand store for the schedule action (reuses existing SchedulePicker)
- Save buttons (Entwurf/Planen) hidden when editing published or scheduled posts to prevent confusion

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Excluded supabase/functions from tsconfig**
- **Found during:** Task 2 verification
- **Issue:** Deno Edge Function uses esm.sh imports and Deno global which fail Node.js TypeScript compilation
- **Fix:** Added "supabase/functions" to tsconfig.json exclude array
- **Files modified:** tsconfig.json
- **Committed in:** 05a8c2f (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking issue)
**Impact on plan:** Minor config adjustment, no scope creep.

## Issues Encountered
None

## User Setup Required
- pg_cron SQL must be run in Supabase SQL Editor to enable automatic publishing (SQL provided as comment in Edge Function file)
- LATE_API_KEY environment variable must be set in Supabase Edge Function secrets

## Next Phase Readiness
- Workflow UI complete, ready for end-to-end testing with real Late.dev API
- Bio manager UI (Plan 05-03) can proceed independently
- Edge Function ready for deployment to Supabase

---
*Phase: 05-publishing-pipeline-and-link-in-bio*
*Completed: 2026-03-14*

## Self-Check: PASSED

All 4 files verified present. All 2 task commits verified in git log.
