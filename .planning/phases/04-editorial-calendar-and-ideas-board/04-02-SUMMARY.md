---
phase: 04-editorial-calendar-and-ideas-board
plan: 02
subsystem: ui
tags: [dnd-kit, drag-drop, calendar, filtering, composer, zustand, tanstack-query]

requires:
  - phase: 04-01
    provides: calendar views, calendar store, post cards, day cells, calendar-posts hook
  - phase: 03
    provides: composer store, post hooks, post API, composer form
provides:
  - drag-and-drop rescheduling across all calendar views (month/week/day)
  - undo toast for rescheduling actions
  - channel/status/campaign filter bar on calendar
  - post detail popover with edit navigation
  - composer edit mode via postId URL param
  - quick-add from calendar day cell to composer
affects: [04-03, 05-publishing-pipeline]

tech-stack:
  added: ["@dnd-kit/core", "@dnd-kit/utilities"]
  patterns: [DndContext wrapper, useDraggable/useDroppable hooks, DragOverlay for flicker-free drag, client-side filtering with useMemo, URL param hydration for composer]

key-files:
  created:
    - src/components/calendar/post-detail-popover.tsx
  modified:
    - src/app/(auth)/calendar/page.tsx
    - src/components/calendar/calendar-post-card.tsx
    - src/components/calendar/calendar-day-cell.tsx
    - src/components/calendar/calendar-week-view.tsx
    - src/components/calendar/calendar-day-view.tsx
    - src/components/calendar/calendar-header.tsx
    - src/hooks/use-calendar-posts.ts
    - src/stores/composer-store.ts
    - src/app/(auth)/composer/page.tsx
    - src/components/composer/composer-form.tsx

key-decisions:
  - "PointerSensor with 8px distance constraint to distinguish clicks from drags"
  - "Client-side filtering in useCalendarPosts (not server-side) since posts already fetched for date range"
  - "PostDetailPopover uses fixed positioning with viewport clamping instead of shadcn Popover (not installed)"
  - "Composer hydration uses ref guard to prevent re-hydration on navigation after URL param clearing"
  - "setSelectedChannelIds added to composer store for bulk channel assignment during post edit hydration"

patterns-established:
  - "DroppableSlot pattern: reusable wrapper component with useDroppable + visual feedback for week/day views"
  - "URL param hydration: composer reads searchParams once on mount, hydrates store, then clears URL"
  - "Edit mode detection: postId URL param switches composer from create (POST) to update (PATCH) mode"

requirements-completed: [CAL-03, CAL-04, CAL-06]

duration: 28min
completed: 2026-03-13
---

# Phase 4 Plan 02: Calendar Interactions Summary

**Drag-and-drop rescheduling with @dnd-kit, filter bar (channel/status/campaign), post detail popover, and composer edit mode via postId URL param**

## Performance

- **Duration:** 28 min
- **Started:** 2026-03-13T19:23:30Z
- **Completed:** 2026-03-13T19:51:20Z
- **Tasks:** 2
- **Files modified:** 12

## Accomplishments
- Post cards are draggable across day cells (month) and hourly slots (week/day) with DragOverlay for smooth visuals
- Undo toast shows for 5 seconds after rescheduling with "Rueckgaengig" button to restore original date
- Filter bar with channel, status, and campaign dropdowns reduces visible posts in calendar
- Post detail popover shows full caption, media preview, status, schedule, campaign, channels, and "Bearbeiten" button
- Composer accepts postId URL param, fetches post data, hydrates all store fields, and switches to PATCH mode

## Task Commits

Each task was committed atomically:

1. **Task 1: Drag-and-drop rescheduling with @dnd-kit and undo toast** - `b3baaa9` (feat)
2. **Task 2: Filter bar, quick-add, post detail popover, and composer postId loading** - `864d1dc` (feat)

## Files Created/Modified
- `src/components/calendar/post-detail-popover.tsx` - Post detail popover with caption, media, status, edit button
- `src/app/(auth)/calendar/page.tsx` - DndContext wrapper, drag handlers, undo toast, popover state
- `src/components/calendar/calendar-post-card.tsx` - useDraggable integration, DragOverlay support
- `src/components/calendar/calendar-day-cell.tsx` - useDroppable integration, visual drop feedback, plus button
- `src/components/calendar/calendar-week-view.tsx` - DroppableSlot for hourly slots
- `src/components/calendar/calendar-day-view.tsx` - DroppableHourSlot for hourly slots
- `src/components/calendar/calendar-header.tsx` - Filter bar with channel/status/campaign dropdowns
- `src/hooks/use-calendar-posts.ts` - Client-side filtering with useMemo
- `src/stores/composer-store.ts` - Added setSelectedChannelIds action
- `src/app/(auth)/composer/page.tsx` - URL param hydration, edit mode, loading state
- `src/components/composer/composer-form.tsx` - editPostId prop, PATCH update mode

## Decisions Made
- PointerSensor with 8px distance constraint to distinguish clicks from drags
- Client-side filtering in useCalendarPosts since posts are already fetched for the date range
- PostDetailPopover uses fixed positioning with viewport clamping (shadcn Popover not installed)
- Composer hydration uses ref guard to prevent re-hydration on navigation after URL param clearing
- setSelectedChannelIds added to composer store for bulk channel assignment during post edit hydration

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed pre-existing idea-card.tsx asChild type error**
- **Found during:** Task 1 (build verification)
- **Issue:** idea-card.tsx used `asChild` prop on DropdownMenuTrigger which is not supported by base-ui
- **Fix:** Changed to render prop pattern per project convention
- **Files modified:** src/components/ideas/idea-card.tsx
- **Verification:** Build passes
- **Committed in:** b3baaa9 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Auto-fix necessary to unblock build verification. No scope creep.

## Issues Encountered
- Build cache corruption (.next/lock stale file) required clean build -- resolved by removing .next directory

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Calendar is now a fully interactive planning surface (view, drag, filter, click-to-add, click-to-edit)
- Ready for Plan 04-03: Ideas Board with Kanban columns and promote-to-post flow
- Composer edit mode enables post editing from any entry point (calendar, post list, ideas board)

---
*Phase: 04-editorial-calendar-and-ideas-board*
*Completed: 2026-03-13*
