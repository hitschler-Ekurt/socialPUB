---
phase: 04-editorial-calendar-and-ideas-board
plan: 03
subsystem: ui
tags: [kanban, dnd-kit, ideas, crud, tanstack-query, drag-and-drop, zod]

requires:
  - phase: 04-01
    provides: "Calendar infrastructure, post API routes, Supabase types"
  - phase: 01-02
    provides: "Auth, Supabase server client, base types"
  - phase: 02-03
    provides: "Campaign hooks, media library"
provides:
  - "Ideas CRUD API (GET/POST/PATCH/DELETE /api/ideas)"
  - "Ideas Kanban board with 4 columns and drag-and-drop"
  - "Promote-to-post flow from idea to composer"
  - "Drafts table types in Supabase types"
  - "useDebounce hook (reusable)"
affects: [05-publishing-pipeline, 06-analytics]

tech-stack:
  added: ["@dnd-kit/core", "@dnd-kit/sortable", "@dnd-kit/utilities"]
  patterns: ["Kanban board with optimistic updates and undo toast", "Cross-column drag-and-drop with arrayMove"]

key-files:
  created:
    - src/lib/validations/idea.ts
    - src/app/api/ideas/route.ts
    - src/app/api/ideas/[id]/route.ts
    - src/hooks/use-ideas.ts
    - src/hooks/use-debounce.ts
    - src/components/ideas/ideas-board.tsx
    - src/components/ideas/ideas-column.tsx
    - src/components/ideas/idea-card.tsx
    - src/components/ideas/idea-create-inline.tsx
    - src/components/ideas/idea-detail-dialog.tsx
  modified:
    - src/lib/supabase/types.ts
    - src/app/(auth)/ideas/page.tsx
    - src/components/composer/composer-form.tsx

key-decisions:
  - "useDebounce hook created as reusable utility for search input"
  - "Optimistic local state for drag-drop with server sync on useIdeas data change"
  - "Undo toast on cross-column moves only (not same-column reorder)"
  - "Campaign filter uses 'none' sentinel value for Select component compatibility"

patterns-established:
  - "Kanban board: DndContext with closestCorners, PointerSensor distance 8, local state optimistic updates"
  - "Inline create: reveal input on click, auto-submit on Enter/blur, keep open for rapid entry"

requirements-completed: [IDEA-01, IDEA-02, IDEA-03, IDEA-04]

duration: 27min
completed: 2026-03-13
---

# Phase 4 Plan 3: Ideas Kanban Board Summary

**Ideas Kanban board with 4-column drag-and-drop, inline create, CRUD API, and promote-to-composer flow using @dnd-kit**

## Performance

- **Duration:** 27 min
- **Started:** 2026-03-13T19:23:30Z
- **Completed:** 2026-03-13T19:50:30Z
- **Tasks:** 3
- **Files modified:** 13

## Accomplishments
- Full ideas CRUD API with search, campaign filter, and status filter
- Kanban board with 4 German-labeled columns (Idee, In Bearbeitung, Bereit, Geplant)
- Cross-column drag changes status with optimistic updates and undo toast
- Same-column drag reorders with position persistence
- Inline create in Idee column for rapid idea capture
- Promote-to-post navigates to composer with pre-filled title and campaign
- Edit dialog for title, description, and campaign fields
- Delete with confirmation dialog

## Task Commits

Each task was committed atomically:

1. **Task 1: Drafts types, Zod schemas, API routes, and TanStack Query hooks** - `3c77247` (feat)
2. **Task 2: Idea card and column components with drag-and-drop** - `b5af8d9` (feat)
3. **Task 3: Board assembly, edit dialog, and ideas page with promote-to-post** - `5fd7545` (feat)

## Files Created/Modified
- `src/lib/supabase/types.ts` - Added drafts table Row/Insert/Update types
- `src/lib/validations/idea.ts` - Zod schemas for create/update idea validation
- `src/app/api/ideas/route.ts` - GET (list with filters) and POST (create) endpoints
- `src/app/api/ideas/[id]/route.ts` - GET, PATCH, DELETE for single idea
- `src/hooks/use-ideas.ts` - TanStack Query hooks: useIdeas, useCreateIdea, useUpdateIdea, useDeleteIdea
- `src/hooks/use-debounce.ts` - Reusable debounce hook
- `src/components/ideas/idea-card.tsx` - Draggable card with campaign dot, assignee avatar, three-dot menu
- `src/components/ideas/ideas-column.tsx` - Droppable column with status label and count badge
- `src/components/ideas/idea-create-inline.tsx` - Inline input for rapid idea creation
- `src/components/ideas/ideas-board.tsx` - DndContext board with optimistic updates and undo toast
- `src/components/ideas/idea-detail-dialog.tsx` - Edit dialog for idea fields
- `src/app/(auth)/ideas/page.tsx` - Ideas page replacing ComingSoon placeholder
- `src/components/composer/composer-form.tsx` - Fixed pre-existing isMutating bug

## Decisions Made
- Created useDebounce as a reusable hook (not idea-specific)
- Optimistic local state for drag-drop derived from server data via useEffect sync
- Undo toast shown only on cross-column moves (status change), not same-column reorder
- Campaign filter Select uses "none" sentinel value for Radix Select compatibility
- Status type cast in API route for TypeScript enum compatibility with Supabase query

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Installed @dnd-kit dependencies**
- **Found during:** Task 1 (pre-requisite check)
- **Issue:** @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities not in package.json
- **Fix:** Ran npm install for all three packages
- **Files modified:** package.json, package-lock.json
- **Verification:** Build passes with dnd-kit imports
- **Committed in:** 3c77247 (Task 1 commit)

**2. [Rule 1 - Bug] Fixed isMutating self-reference in composer-form.tsx**
- **Found during:** Task 3 (build verification)
- **Issue:** `const isMutating = isMutating || updatePost.isPending` references itself, causing TS error
- **Fix:** Changed to `const isMutating = createPost.isPending || updatePost.isPending`
- **Files modified:** src/components/composer/composer-form.tsx
- **Verification:** Build passes
- **Committed in:** 5fd7545 (Task 3 commit)

**3. [Rule 2 - Missing Critical] Created useDebounce hook**
- **Found during:** Task 3 (ideas page implementation)
- **Issue:** Search input needed debouncing, no useDebounce hook existed in project
- **Fix:** Created src/hooks/use-debounce.ts as reusable utility
- **Files modified:** src/hooks/use-debounce.ts
- **Verification:** Build passes, hook used in ideas page
- **Committed in:** 5fd7545 (Task 3 commit)

---

**Total deviations:** 3 auto-fixed (1 blocking, 1 bug, 1 missing critical)
**Impact on plan:** All auto-fixes necessary for functionality. No scope creep.

## Issues Encountered
- Next.js 16 Windows build had transient ENOENT errors with static manifest files (resolved by clearing .next cache with rimraf)
- Base-ui DropdownMenuTrigger requires render prop pattern (not asChild) -- already handled in 04-02 commit

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Ideas board fully functional, ready for use alongside calendar
- Phase 4 complete (all 3 plans executed)
- Ready for Phase 5 (Publishing Pipeline) which depends on posts and ideas being complete

---
*Phase: 04-editorial-calendar-and-ideas-board*
*Completed: 2026-03-13*
