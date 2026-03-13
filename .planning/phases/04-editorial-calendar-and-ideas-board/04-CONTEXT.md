# Phase 4: Editorial Calendar and Ideas Board - Context

**Gathered:** 2026-03-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can plan content visually on a calendar with drag-and-drop rescheduling (month/week/day views), and manage content ideas on a Kanban board (Idee/In Bearbeitung/Bereit/Geplant) that feeds into the composer. Covers CAL-01 through CAL-06 and IDEA-01 through IDEA-04. Calendar and ideas board are separate pages (/calendar and /ideas).

</domain>

<decisions>
## Implementation Decisions

### Calendar view & layout
- Compact post cards stacked in each day cell: thumbnail + caption snippet + status dot + channel icon
- Month view as default when navigating to /calendar
- Week and day views use a vertical time-slot grid with hourly slots (like Google Calendar)
- Overflow handling: show top 2-3 posts per day cell, then "+N weitere" link that opens a popover/expands
- Today's date highlighted with subtle Magenta accent/border, calendar opens on current month

### Calendar navigation
- Header: left/right arrows to navigate months/weeks, "Heute" button to jump to today
- View switcher on the right: Month/Week/Day toggle buttons
- Standard calendar pattern (Google Calendar style)

### Calendar interactions
- Drag-and-drop reschedules instantly — toast notification with "Rueckgaengig" (undo) button for 5 seconds
- Click on a day to quick-add: navigates to /composer with scheduled_at pre-filled to clicked date
- Click on a post card: detail popover showing full caption, media preview, status, scheduled time — "Bearbeiten" button opens composer
- Filter bar below calendar header: channel dropdown, status dropdown, campaign dropdown (consistent with media/link library patterns)

### Ideas board columns & cards
- Fixed 4 columns: Idee, In Bearbeitung, Bereit, Geplant (not customizable)
- Column headers show count badge: "Idee (5)"
- Idea cards show: title, optional campaign tag (color dot), optional assignee avatar, created date
- Minimal idea fields: title (required), description (optional), campaign tag (optional), assignee (optional)
- No ideas table exists yet — DB schema needed with status enum and sort_order field

### Ideas board interactions
- Create new idea: inline "+" button at bottom of "Idee" column, reveals text field for title, Enter to create
- Edit idea: click card opens detail Dialog with all fields editable (title, description, campaign, assignee)
- Drag between columns: instant status change with toast notification (consistent with calendar drag-drop)
- Drag within column: reorder to change priority (sort_order persisted)
- Card actions: three-dot menu on hover with Bearbeiten, Zu Post umwandeln, Loeschen
- Delete: confirmation dialog, hard delete (ideas are lightweight)
- Search bar + campaign dropdown filter on the ideas board
- Promote to post (IDEA-04): navigates to /composer with idea title as caption draft, campaign tag carried over, idea status auto-moves to "Geplant"

### Empty states
- Calendar: full calendar grid visible with empty day cells, centered overlay "Noch keine Posts geplant" + "Ersten Post erstellen" button
- Ideas board: all 4 empty Kanban columns visible with headers, "Erste Idee erfassen" message in Idee column with inline add field visible

### Cross-feature connection
- No cross-reference between promoted ideas and resulting posts — once promoted, it's a regular post
- Calendar and ideas board are fully separate pages with independent sidebar nav items

### Claude's Discretion
- Calendar library choice (research should evaluate options)
- Drag-and-drop library choice for both calendar and kanban
- Exact card styling and spacing within calendar cells
- Post detail popover layout and positioning
- Loading states and skeleton patterns for calendar grid and kanban board
- Time-slot granularity in week/day views (30min vs 1hr slots)
- Mobile/tablet responsive behavior for calendar and kanban
- Ideas DB table schema design details (column names, indexes)

</decisions>

<specifics>
## Specific Ideas

- Design references: Planable for calendar UX, Linear for kanban card aesthetics, Google Calendar for navigation patterns
- "Playful Professional" — 80% clean & functional, 20% hitschies personality (carried from Phase 1)
- Calendar post cards should feel compact and scannable — not cluttered
- Kanban cards should feel like Linear issues: clean, title-prominent, minimal metadata
- Instant drag-and-drop with undo toast is the consistent interaction pattern for both calendar and kanban

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `usePosts` hook: full CRUD with TanStack Query, fetches posts with campaign data
- `useUpdatePost` mutation: can update scheduled_at for drag-drop rescheduling
- `useCampaigns` hook: for campaign filter dropdown
- `useChannels` hook: for channel filter dropdown
- shadcn/ui components: Card, Dialog, Badge, Button, Select, Dropdown Menu, Skeleton, Tabs
- `use-require-role.ts` hook: for role-based UI hiding (viewers can't create/edit)
- Sonner toast: already used for mutation feedback across the app
- Composer store (Zustand): can be extended to accept pre-filled data from calendar quick-add and idea promotion

### Established Patterns
- Zustand with persist middleware for client state (localStorage)
- TanStack Query for server state management
- Dialog modals for create/edit operations
- Confirmation dialogs for delete operations
- Filter bar pattern: horizontal bar below page header with dropdowns
- Role-based: viewers see data, action buttons hidden (RLS enforces server-side)
- API routes at /api/{resource} with standard CRUD

### Integration Points
- Placeholder pages at /calendar and /ideas (ComingSoon) — will be replaced
- Sidebar nav items already point to /calendar and /ideas
- Posts table has scheduled_at, status, campaign_id fields — ready for calendar display
- No ideas/content_ideas table in DB — migration needed
- Composer at /composer can accept query params for pre-filling (quick-add and promote flows)

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-editorial-calendar-and-ideas-board*
*Context gathered: 2026-03-13*
