# Phase 4: Editorial Calendar and Ideas Board - Research

**Researched:** 2026-03-13
**Domain:** Calendar UI, Kanban drag-and-drop, date handling, Supabase CRUD
**Confidence:** HIGH

## Summary

This phase implements two distinct features: (1) an editorial calendar with month/week/day views showing post cards with drag-and-drop rescheduling, and (2) a Kanban ideas board with 4 fixed columns and drag-between-columns functionality. The existing codebase provides strong foundations -- `usePosts` hook, `useUpdatePost` mutation, `useCampaigns`/`useChannels` hooks, Sonner toast, and the composer store are all reusable. The DB already has a `drafts` table with `draft_status` enum matching the 4 Kanban columns, but TypeScript types for it are missing from `types.ts`.

The calendar should be built custom using `date-fns` (already installed v4.1.0) and the existing shadcn component primitives rather than pulling in a heavy calendar library. The project already uses Tailwind CSS + shadcn/ui, and the calendar requirements (compact post cards in day cells) are too specific for generic calendar libraries like react-big-calendar. For drag-and-drop across both calendar and kanban, `@dnd-kit` is the standard choice -- it is the most actively maintained React DnD library, works with shadcn/ui, and handles both the calendar day-cell drops and kanban column-to-column sorting.

**Primary recommendation:** Build a custom calendar grid with date-fns helpers and use @dnd-kit for all drag-and-drop interactions (calendar rescheduling + kanban reordering). Add the `drafts` table TypeScript types and CRUD API route following existing patterns.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Compact post cards stacked in each day cell: thumbnail + caption snippet + status dot + channel icon
- Month view as default when navigating to /calendar
- Week and day views use a vertical time-slot grid with hourly slots (like Google Calendar)
- Overflow handling: show top 2-3 posts per day cell, then "+N weitere" link that opens a popover/expands
- Today's date highlighted with subtle Magenta accent/border, calendar opens on current month
- Header: left/right arrows to navigate months/weeks, "Heute" button to jump to today
- View switcher on the right: Month/Week/Day toggle buttons
- Drag-and-drop reschedules instantly -- toast notification with "Rueckgaengig" (undo) button for 5 seconds
- Click on a day to quick-add: navigates to /composer with scheduled_at pre-filled to clicked date
- Click on a post card: detail popover showing full caption, media preview, status, scheduled time -- "Bearbeiten" button opens composer
- Filter bar below calendar header: channel dropdown, status dropdown, campaign dropdown
- Fixed 4 columns: Idee, In Bearbeitung, Bereit, Geplant (not customizable)
- Column headers show count badge: "Idee (5)"
- Idea cards show: title, optional campaign tag (color dot), optional assignee avatar, created date
- Minimal idea fields: title (required), description (optional), campaign tag (optional), assignee (optional)
- Create new idea: inline "+" button at bottom of "Idee" column, reveals text field for title, Enter to create
- Edit idea: click card opens detail Dialog with all fields editable
- Drag between columns: instant status change with toast notification
- Drag within column: reorder to change priority (sort_order persisted)
- Card actions: three-dot menu on hover with Bearbeiten, Zu Post umwandeln, Loeschen
- Delete: confirmation dialog, hard delete
- Search bar + campaign dropdown filter on the ideas board
- Promote to post (IDEA-04): navigates to /composer with idea title as caption draft, campaign tag carried over, idea status auto-moves to "Geplant"
- Calendar and ideas board are fully separate pages (/calendar and /ideas)
- No cross-reference between promoted ideas and resulting posts

### Claude's Discretion
- Calendar library choice (research should evaluate options)
- Drag-and-drop library choice for both calendar and kanban
- Exact card styling and spacing within calendar cells
- Post detail popover layout and positioning
- Loading states and skeleton patterns for calendar grid and kanban board
- Time-slot granularity in week/day views (30min vs 1hr slots)
- Mobile/tablet responsive behavior for calendar and kanban
- Ideas DB table schema design details (column names, indexes)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CAL-01 | User can view posts in a monthly calendar grid | Custom calendar grid built with date-fns helpers (startOfMonth, eachDayOfInterval, etc.) |
| CAL-02 | User can switch between month, week, and day views | Tabs component for view switcher; separate grid components per view |
| CAL-03 | User can drag and drop a post to reschedule it to a different date/time | @dnd-kit DndContext + droppable day cells + useUpdatePost mutation for scheduled_at |
| CAL-04 | User can filter calendar by channel, status, and campaign | Reuse existing useChannels, useCampaigns hooks + client-side filtering of posts query |
| CAL-05 | Post cards show thumbnail, caption snippet, channel icon, and status badge | Compact CalendarPostCard component with Badge, truncated caption, media thumbnail |
| CAL-06 | User can click a day to quick-add a new post | Router push to /composer?scheduledAt={isoDate}, composer store reads query param |
| IDEA-01 | User can create content ideas with title and description | CRUD API at /api/ideas with drafts table, inline create form in Idee column |
| IDEA-02 | Kanban board with 4 columns: Idee, In Bearbeitung, Bereit, Geplant | @dnd-kit SortableContext per column, KanbanBoard layout component |
| IDEA-03 | User can drag ideas between columns | @dnd-kit onDragEnd handler updates status + position, optimistic update pattern |
| IDEA-04 | User can promote an idea to a full post in the Composer | Router push to /composer?caption={title}&campaignId={id}, PATCH idea status to "scheduled" |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| date-fns | 4.1.0 | Date arithmetic, formatting, locale | Already installed, tree-shakeable, immutable API |
| @dnd-kit/core | 6.3.1 | Drag-and-drop context, sensors, collision detection | Industry standard for React DnD, actively maintained |
| @dnd-kit/sortable | 10.0.0 | Sortable lists within kanban columns | Built on @dnd-kit/core, handles reorder + cross-container |
| @dnd-kit/utilities | latest | CSS transform utilities for drag overlays | Companion to core/sortable |

### Supporting (Already Installed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @tanstack/react-query | 5.90.x | Server state for posts and ideas | All data fetching via existing hook patterns |
| zustand | 5.0.x | Calendar view state, filters | Calendar navigation state (current date, view mode) |
| sonner | 2.0.x | Toast notifications with undo | Drag-drop confirmation + undo toast |
| lucide-react | 0.577.x | Icons (ChevronLeft, ChevronRight, Plus, etc.) | Calendar nav, kanban actions |
| shadcn/ui | 4.0.x | Card, Dialog, Badge, Button, Select, DropdownMenu, Tabs, Skeleton | All UI primitives |
| zod | 4.3.x | Request validation for ideas API | Validate create/update idea inputs |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom calendar grid | react-big-calendar | Heavy dependency (moment.js or date-fns adapter), hard to customize card layout to match compact post card design. Custom grid is simpler for this use case. |
| Custom calendar grid | @fullcalendar/react | Very feature-rich but opinionated styling, brings its own CSS that conflicts with Tailwind/shadcn. Overkill for this project. |
| @dnd-kit | @hello-pangea/dnd | Fork of react-beautiful-dnd, simpler API but less flexible for the dual calendar+kanban use case. @dnd-kit handles both scenarios well. |
| @dnd-kit | pragmatic-drag-and-drop (Atlassian) | Newer, good for Atlassian-style boards, but smaller ecosystem and less community examples with shadcn. |

**Installation:**
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

## Architecture Patterns

### Recommended Project Structure
```
src/
  app/(auth)/calendar/
    page.tsx                    # Calendar page (replaces ComingSoon)
  app/(auth)/ideas/
    page.tsx                    # Ideas board page (replaces ComingSoon)
  app/api/ideas/
    route.ts                    # GET (list), POST (create)
    [id]/route.ts               # GET, PATCH, DELETE
  components/calendar/
    calendar-header.tsx         # Navigation + view switcher + filters
    calendar-month-view.tsx     # Month grid with day cells
    calendar-week-view.tsx      # Week view with hourly time slots
    calendar-day-view.tsx       # Day view with hourly time slots
    calendar-post-card.tsx      # Compact post card for day cells
    calendar-day-cell.tsx       # Individual day cell (droppable)
    post-detail-popover.tsx     # Click-on-card detail popover
  components/ideas/
    ideas-board.tsx             # Kanban board container with DndContext
    ideas-column.tsx            # Single kanban column (droppable + sortable)
    idea-card.tsx               # Draggable idea card
    idea-create-inline.tsx      # Inline title input at bottom of Idee column
    idea-detail-dialog.tsx      # Edit dialog for full idea fields
  hooks/
    use-ideas.ts                # CRUD hooks for ideas (TanStack Query)
    use-calendar-posts.ts       # Posts query with date range filter
  stores/
    calendar-store.ts           # Current date, view mode, filters (Zustand)
  lib/
    calendar-utils.ts           # Date grid generation helpers
    validations/idea.ts         # Zod schemas for idea create/update
```

### Pattern 1: Custom Calendar Grid with date-fns
**What:** Generate the month grid using date-fns functions rather than a calendar library
**When to use:** When you need full control over cell rendering (post cards, overflow, drag targets)
**Example:**
```typescript
// Source: date-fns docs
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, isToday,
  format, addMonths, subMonths, addWeeks, subWeeks,
  startOfDay, addHours, eachHourOfInterval
} from "date-fns"
import { de } from "date-fns/locale"

function getMonthGrid(date: Date): Date[][] {
  const monthStart = startOfMonth(date)
  const monthEnd = endOfMonth(date)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 }) // Monday
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const days = eachDayOfInterval({ start: gridStart, end: gridEnd })

  // Split into weeks (rows of 7)
  const weeks: Date[][] = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }
  return weeks
}
```

### Pattern 2: @dnd-kit Calendar Drag-and-Drop
**What:** Each day cell is a droppable zone, post cards are draggable items
**When to use:** Calendar rescheduling via drag
**Example:**
```typescript
// Source: @dnd-kit docs pattern
import { DndContext, DragEndEvent, useDroppable, useDraggable } from "@dnd-kit/core"

function CalendarDayCell({ date, posts }: { date: Date; posts: Post[] }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `day-${date.toISOString()}`,
    data: { date },
  })

  return (
    <div ref={setNodeRef} className={cn("min-h-24 border", isOver && "bg-accent/50")}>
      {posts.map((post) => (
        <DraggablePostCard key={post.id} post={post} />
      ))}
    </div>
  )
}

// In parent DndContext onDragEnd:
function handleCalendarDragEnd(event: DragEndEvent) {
  const { active, over } = event
  if (!over) return

  const postId = active.id as string
  const newDate = over.data.current?.date as Date

  // Optimistic update via TanStack Query
  updatePost.mutate(
    { id: postId, scheduledAt: newDate.toISOString() },
    {
      onSuccess: () => {
        toast("Post verschoben", {
          action: { label: "Rueckgaengig", onClick: () => undoReschedule(postId, oldDate) },
          duration: 5000,
        })
      },
    }
  )
}
```

### Pattern 3: @dnd-kit Kanban with Cross-Column Sorting
**What:** SortableContext per column, onDragOver for cross-column detection, onDragEnd for final placement
**When to use:** Ideas board with drag between columns and within-column reorder
**Example:**
```typescript
import { DndContext, DragOverEvent, DragEndEvent, closestCorners } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable"

// Each column wraps its items in SortableContext
function IdeasColumn({ status, ideas }: { status: DraftStatus; ideas: Idea[] }) {
  const { setNodeRef } = useDroppable({ id: status })
  const sortedIds = ideas.map((i) => i.id)

  return (
    <div ref={setNodeRef}>
      <SortableContext items={sortedIds} strategy={verticalListSortingStrategy}>
        {ideas.map((idea) => (
          <SortableIdeaCard key={idea.id} idea={idea} />
        ))}
      </SortableContext>
    </div>
  )
}

// handleDragEnd determines if same-column reorder or cross-column move
// Then calls PATCH /api/ideas/:id with new status + position
```

### Pattern 4: Undo Toast with Sonner
**What:** 5-second toast with undo action button, consistent across calendar and kanban
**When to use:** After any drag-drop mutation
**Example:**
```typescript
import { toast } from "sonner"

function showUndoToast(message: string, undoFn: () => void) {
  toast(message, {
    action: {
      label: "Rueckgaengig",
      onClick: undoFn,
    },
    duration: 5000,
  })
}
```

### Anti-Patterns to Avoid
- **Full page re-render on drag:** Use optimistic local state updates during drag, only invalidate query on mutation success
- **Storing calendar view state in URL:** Use Zustand for ephemeral view state (current month, view mode), only filter params could optionally be URL-based
- **Fetching all posts for calendar:** Add date range filtering to the posts API (WHERE scheduled_at BETWEEN start AND end) to avoid loading the full post history
- **Tight coupling between calendar and kanban DnD:** Keep separate DndContext providers for calendar page and ideas page -- they never interact

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Date grid generation | Manual day-of-week math | date-fns eachDayOfInterval + startOfWeek | Timezone bugs, leap year edge cases, locale-aware week starts |
| Drag-and-drop | Custom mouse/touch event handlers | @dnd-kit | Accessibility (keyboard DnD), touch support, collision detection, overlay rendering |
| Sort order persistence | Manual index calculation | @dnd-kit arrayMove + batch position update | Off-by-one errors, concurrent drag race conditions |
| Date formatting | Manual string building | date-fns format with de locale | German month names, day abbreviations, consistent formatting |
| Optimistic updates | Manual cache manipulation | TanStack Query onMutate/onError/onSettled | Rollback on error, cache invalidation, refetch coordination |

**Key insight:** Calendar grids and drag-and-drop are deceptively complex when hand-rolled. The date arithmetic is straightforward with date-fns, but touch/keyboard accessibility and cross-container sorting require battle-tested library code.

## Common Pitfalls

### Pitfall 1: Timezone Mismatch in Calendar Display
**What goes wrong:** Posts appear on wrong days because scheduled_at is in UTC but displayed in local time
**Why it happens:** Supabase stores TIMESTAMPTZ in UTC, browser renders in local timezone
**How to avoid:** Always parse scheduled_at with date-fns and compare using startOfDay in local timezone. Use `isSameDay(parseISO(post.scheduled_at), cellDate)` for day matching.
**Warning signs:** Posts showing on adjacent days, especially around midnight

### Pitfall 2: DnD Overlay Flicker
**What goes wrong:** Drag overlay (ghost element) flickers or disappears during drag
**Why it happens:** React re-renders cause the dragged element to unmount
**How to avoid:** Use @dnd-kit DragOverlay component with a static clone of the dragged item. Render the overlay at the DndContext level, not inside the sortable item.
**Warning signs:** Visual glitches when dragging starts or when moving between containers

### Pitfall 3: Stale Position After Cross-Column Move
**What goes wrong:** After dragging an idea to a new column, subsequent drags use stale positions
**Why it happens:** Optimistic update doesn't recalculate all affected items' positions
**How to avoid:** On cross-column move, update the moved item's status AND position, plus recalculate positions for all items in the destination column. Use arrayMove from @dnd-kit/sortable.
**Warning signs:** Items snap to wrong positions after multiple rapid drags

### Pitfall 4: Calendar Performance with Many Posts
**What goes wrong:** Month view becomes sluggish when displaying 100+ posts
**Why it happens:** Re-rendering all day cells and post cards on every state change
**How to avoid:** Memoize day cells with React.memo, group posts by date in a Map before rendering, limit visible cards per cell ("+N weitere" pattern). Add date-range filter to API.
**Warning signs:** Lag when switching months or filtering

### Pitfall 5: Missing Drafts Table Types
**What goes wrong:** TypeScript errors when working with the ideas/drafts API
**Why it happens:** The `drafts` table exists in SQL schema (001_initial_schema.sql) but is NOT included in `src/lib/supabase/types.ts`
**How to avoid:** Add drafts table Row/Insert/Update types to types.ts before starting ideas board implementation
**Warning signs:** Type errors in API routes and hooks

### Pitfall 6: Quick-Add and Promote Query Params Lost
**What goes wrong:** Navigating to /composer with query params doesn't pre-fill the form
**Why it happens:** Composer store reads from localStorage (persist middleware), not from URL params
**How to avoid:** On composer page mount, check URL searchParams and call store setters (setScheduledAt, setCaption, setCampaignId) if params present. Clear params after applying.
**Warning signs:** Quick-add from calendar or promote from ideas opens empty composer

## Code Examples

### date-fns Calendar Grid Generation
```typescript
// Source: date-fns v4 API
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, eachHourOfInterval, startOfDay, addHours,
  format, isSameMonth, isSameDay, isToday, parseISO,
  addMonths, subMonths, addWeeks, subWeeks, addDays, subDays
} from "date-fns"
import { de } from "date-fns/locale"

// Month grid: 5-6 rows of 7 days each
export function getMonthDays(currentDate: Date): Date[][] {
  const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 })
  const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 })
  const allDays = eachDayOfInterval({ start, end })

  const weeks: Date[][] = []
  for (let i = 0; i < allDays.length; i += 7) {
    weeks.push(allDays.slice(i, i + 7))
  }
  return weeks
}

// Week view: 7 days x 24 hourly slots
export function getWeekHours(currentDate: Date): { day: Date; hours: Date[] }[] {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd })

  return days.map((day) => ({
    day,
    hours: eachHourOfInterval({ start: startOfDay(day), end: addHours(startOfDay(day), 23) }),
  }))
}

// Group posts by day for efficient lookup
export function groupPostsByDay(posts: Post[]): Map<string, Post[]> {
  const map = new Map<string, Post[]>()
  for (const post of posts) {
    if (!post.scheduled_at) continue
    const key = format(parseISO(post.scheduled_at), "yyyy-MM-dd")
    const existing = map.get(key) ?? []
    map.set(key, [...existing, post])
  }
  return map
}

// Format for display
export function formatDayHeader(date: Date): string {
  return format(date, "EEEE, d. MMMM", { locale: de })
}
```

### Zustand Calendar Store
```typescript
// Source: project pattern from composer-store.ts
import { create } from "zustand"

type CalendarView = "month" | "week" | "day"

type CalendarState = {
  readonly currentDate: Date
  readonly view: CalendarView
  readonly filterChannelId: string | null
  readonly filterStatus: string | null
  readonly filterCampaignId: string | null
}

type CalendarActions = {
  readonly setCurrentDate: (date: Date) => void
  readonly setView: (view: CalendarView) => void
  readonly goToToday: () => void
  readonly navigateForward: () => void
  readonly navigateBack: () => void
  readonly setFilterChannelId: (id: string | null) => void
  readonly setFilterStatus: (status: string | null) => void
  readonly setFilterCampaignId: (id: string | null) => void
}

// No persist -- calendar view resets each session
export const useCalendarStore = create<CalendarState & CalendarActions>()((set, get) => ({
  currentDate: new Date(),
  view: "month",
  filterChannelId: null,
  filterStatus: null,
  filterCampaignId: null,

  setCurrentDate: (date) => set({ currentDate: date }),
  setView: (view) => set({ view }),
  goToToday: () => set({ currentDate: new Date() }),

  navigateForward: () => {
    const { currentDate, view } = get()
    const next = view === "month" ? addMonths(currentDate, 1)
      : view === "week" ? addWeeks(currentDate, 1)
      : addDays(currentDate, 1)
    set({ currentDate: next })
  },

  navigateBack: () => {
    const { currentDate, view } = get()
    const prev = view === "month" ? subMonths(currentDate, 1)
      : view === "week" ? subWeeks(currentDate, 1)
      : subDays(currentDate, 1)
    set({ currentDate: prev })
  },

  setFilterChannelId: (id) => set({ filterChannelId: id }),
  setFilterStatus: (status) => set({ filterStatus: status }),
  setFilterCampaignId: (id) => set({ filterCampaignId: id }),
}))
```

### Ideas API Route Pattern
```typescript
// Source: existing /api/posts/route.ts pattern
// POST /api/ideas
const body = await request.json()
const parsed = createIdeaSchema.safeParse(body)

const { data: idea, error } = await supabase
  .from("drafts")
  .insert({
    title: parsed.data.title,
    description: parsed.data.description ?? null,
    campaign_id: parsed.data.campaignId ?? null,
    assigned_to: parsed.data.assignedTo ?? null,
    status: "idea",
    position: 0, // will be recalculated
    created_by: user.id,
  })
  .select("*, campaigns(id, name, color, slug)")
  .single()
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| react-beautiful-dnd | @dnd-kit or @hello-pangea/dnd | 2023 (rbd deprecated) | Must use @dnd-kit for new projects |
| moment.js for dates | date-fns v4 (tree-shakeable) | 2024+ | Already using date-fns 4.1.0 |
| FullCalendar for everything | Custom grid + date-fns for simple cases | 2024+ | FullCalendar is overkill when you need custom card rendering |
| react-dnd | @dnd-kit | 2023+ | @dnd-kit has better DX, accessibility, touch support |

**Deprecated/outdated:**
- react-beautiful-dnd: Officially deprecated, use @dnd-kit or @hello-pangea/dnd instead
- moment.js: Deprecated in favor of date-fns, dayjs, or Temporal API

## Open Questions

1. **Time-slot granularity for week/day views**
   - What we know: User wants hourly slots like Google Calendar
   - Recommendation: Use 1-hour slots (24 rows per day). This is simpler and sufficient for social media post scheduling. 30-minute granularity adds visual noise without clear benefit for this use case.

2. **Mobile/tablet responsive behavior**
   - What we know: UX-03 (responsive) is deferred to Phase 6
   - Recommendation: Build desktop-first, ensure nothing breaks on tablet (min-width: 768px), but don't invest in mobile-specific kanban/calendar layouts now. Month view can stack, kanban columns can horizontally scroll.

3. **Date range filtering for calendar API**
   - What we know: Current GET /api/posts fetches ALL posts with no date filtering
   - Recommendation: Add optional `from` and `to` query params to the posts API for calendar use. This avoids loading historical posts that aren't visible.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 + @testing-library/react 16.3.2 |
| Config file | vitest.config.ts |
| Quick run command | `npm test` |
| Full suite command | `npm test -- --coverage` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CAL-01 | Month grid renders correct days | unit | `npx vitest run src/__tests__/calendar/month-grid.test.ts -x` | Wave 0 |
| CAL-02 | View switcher changes calendar view | unit | `npx vitest run src/__tests__/calendar/view-switcher.test.ts -x` | Wave 0 |
| CAL-03 | Drag-drop calls updatePost with new date | unit | `npx vitest run src/__tests__/calendar/drag-reschedule.test.ts -x` | Wave 0 |
| CAL-04 | Filters reduce displayed posts | unit | `npx vitest run src/__tests__/calendar/filters.test.ts -x` | Wave 0 |
| CAL-05 | Post card renders thumbnail, caption, icon, badge | unit | `npx vitest run src/__tests__/calendar/post-card.test.ts -x` | Wave 0 |
| CAL-06 | Click day navigates to composer with date | unit | `npx vitest run src/__tests__/calendar/quick-add.test.ts -x` | Wave 0 |
| IDEA-01 | Create idea via API and inline form | unit | `npx vitest run src/__tests__/ideas/create-idea.test.ts -x` | Wave 0 |
| IDEA-02 | Kanban renders 4 columns with correct ideas | unit | `npx vitest run src/__tests__/ideas/kanban-board.test.ts -x` | Wave 0 |
| IDEA-03 | Drag between columns updates status | unit | `npx vitest run src/__tests__/ideas/drag-between-columns.test.ts -x` | Wave 0 |
| IDEA-04 | Promote navigates to composer with idea data | unit | `npx vitest run src/__tests__/ideas/promote-to-post.test.ts -x` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npm test`
- **Per wave merge:** `npm test -- --coverage`
- **Phase gate:** Full suite green before /gsd:verify-work

### Wave 0 Gaps
- [ ] `src/__tests__/calendar/month-grid.test.ts` -- covers CAL-01
- [ ] `src/__tests__/calendar/view-switcher.test.ts` -- covers CAL-02
- [ ] `src/__tests__/calendar/drag-reschedule.test.ts` -- covers CAL-03
- [ ] `src/__tests__/calendar/filters.test.ts` -- covers CAL-04
- [ ] `src/__tests__/calendar/post-card.test.ts` -- covers CAL-05
- [ ] `src/__tests__/calendar/quick-add.test.ts` -- covers CAL-06
- [ ] `src/__tests__/ideas/create-idea.test.ts` -- covers IDEA-01
- [ ] `src/__tests__/ideas/kanban-board.test.ts` -- covers IDEA-02
- [ ] `src/__tests__/ideas/drag-between-columns.test.ts` -- covers IDEA-03
- [ ] `src/__tests__/ideas/promote-to-post.test.ts` -- covers IDEA-04
- [ ] `src/lib/supabase/types.ts` -- add drafts table types (prerequisite)

## Sources

### Primary (HIGH confidence)
- date-fns v4 API -- already installed, verified version 4.1.0, functions confirmed from docs
- Existing codebase -- posts API route pattern, composer store, hooks, DB schema all verified by reading source
- `001_initial_schema.sql` -- drafts table with draft_status enum confirmed present

### Secondary (MEDIUM confidence)
- [@dnd-kit npm](https://www.npmjs.com/package/@dnd-kit/core) -- v6.3.1 core, v10.0.0 sortable confirmed
- [Georgegriff/react-dnd-kit-tailwind-shadcn-ui](https://github.com/Georgegriff/react-dnd-kit-tailwind-shadcn-ui) -- Reference implementation for kanban + shadcn + dnd-kit
- [Dice UI Kanban](https://www.diceui.com/docs/components/radix/kanban) -- shadcn-compatible kanban component using @dnd-kit
- [Builder.io React Calendar Libraries 2025](https://www.builder.io/blog/best-react-calendar-component-ai) -- Calendar library comparison

### Tertiary (LOW confidence)
- None -- all findings verified against installed packages or official sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- date-fns already installed, @dnd-kit is the clear community standard for React DnD
- Architecture: HIGH -- follows established project patterns (hooks, stores, API routes, shadcn components)
- Pitfalls: HIGH -- timezone issues and DnD overlay patterns are well-documented in community
- DB schema: HIGH -- drafts table already exists in migration, just needs TypeScript types

**Research date:** 2026-03-13
**Valid until:** 2026-04-13 (stable domain, no fast-moving dependencies)
