---
phase: 01-foundation-and-authentication
plan: 03
subsystem: ui
tags: [app-shell, sidebar, dashboard, settings, team-management, zustand, coming-soon, onboarding]

# Dependency graph
requires:
  - phase: 01-01
    provides: Next.js scaffold, design tokens, constants (NAV_ITEMS, ROLES, BRAND), cn utility, shadcn/ui
  - phase: 01-02
    provides: useUser hook, useRequireRole hook, admin API routes (invite, users), login flow
provides:
  - Branded app shell with collapsible sidebar (240px/64px) and sticky header
  - Zustand UI store with localStorage persistence for sidebar state
  - Dashboard with onboarding checklist and placeholder stats
  - 6 coming-soon placeholder pages with hitschies personality
  - Settings page with profile editing (name, avatar, password)
  - Admin-only team management with role dropdowns and invite dialog
  - Viewer role restrictions (sees all pages, edit controls hidden)
affects: [02-01, 03-01, all future feature pages slot into app shell]

# Tech tracking
tech-stack:
  added: []
  patterns: [zustand-persist-localStorage, collapsible-sidebar-pattern, coming-soon-placeholder, role-conditional-ui]

key-files:
  created:
    - src/stores/ui-store.ts
    - src/components/layout/brand-logo.tsx
    - src/components/layout/app-sidebar.tsx
    - src/components/layout/app-header.tsx
    - src/components/layout/auth-shell.tsx
    - src/app/(auth)/layout.tsx
    - src/app/(auth)/dashboard/page.tsx
    - src/app/(auth)/calendar/page.tsx
    - src/app/(auth)/composer/page.tsx
    - src/app/(auth)/media/page.tsx
    - src/app/(auth)/links/page.tsx
    - src/app/(auth)/ideas/page.tsx
    - src/app/(auth)/campaigns/page.tsx
    - src/app/(auth)/settings/page.tsx
    - src/app/(auth)/settings/profile/page.tsx
    - src/app/(auth)/settings/team/page.tsx
    - src/components/shared/coming-soon.tsx
    - src/components/shared/onboarding-checklist.tsx
    - src/components/settings/profile-form.tsx
    - src/components/settings/team-list.tsx
    - src/components/settings/invite-dialog.tsx
  modified: []

key-decisions:
  - "Used Zustand with persist middleware (key: hitschies-ui) for sidebar collapse state"
  - "Inline Tabs in settings page (not sub-routes) for snappy UX"
  - "Viewer role can edit own profile (personal data) but team management controls are hidden"

patterns-established:
  - "Coming-soon pattern: reusable ComingSoon component with icon, title, and hitschies branding for unbuilt features"
  - "Role-conditional UI: useRequireRole hook gates edit controls while preserving read access for viewers"
  - "App shell layout: SidebarProvider wrapping flex row (sidebar + header/main column)"

requirements-completed: [UX-01, AUTH-03, AUTH-04]

# Metrics
duration: ~15min
completed: 2026-03-13
---

# Phase 1 Plan 3: App Shell and UI Pages Summary

**Branded app shell with collapsible sidebar, dashboard with onboarding checklist, 6 coming-soon pages, and admin-only settings with team management and invite dialog**

## Performance

- **Duration:** ~15 min (across two sessions with checkpoint)
- **Started:** 2026-03-13
- **Completed:** 2026-03-13
- **Tasks:** 3 (2 auto + 1 checkpoint approved)
- **Files created:** 21

## Accomplishments
- Complete app shell with collapsible sidebar (8 nav items, 240px/64px toggle) and branded header with user menu
- Dashboard showing welcome greeting, onboarding checklist (4 steps), and placeholder stats cards
- Six coming-soon pages with "Hier entsteht gerade etwas Suesses!" messaging and hitschies personality
- Settings with profile form (name, avatar, password change) and admin-only team management
- Team management: user list with role dropdowns, status badges, and invite dialog calling admin API
- Viewer role restrictions enforced: all pages visible, edit controls hidden

## Task Commits

Each task was committed atomically:

1. **Task 1: App shell layout (sidebar, header, brand logo) and Zustand UI store** - `142139e` (feat)
2. **Task 2: Dashboard, coming-soon pages, and settings pages** - `430bfcc` (feat)
3. **Task 3: Human verification checkpoint** - approved by user (no commit needed)

## Files Created/Modified
- `src/stores/ui-store.ts` - Zustand store for sidebar collapse state with localStorage persistence
- `src/components/layout/brand-logo.tsx` - hitschies logo (full text or collapsed "h" circle)
- `src/components/layout/app-sidebar.tsx` - Collapsible sidebar with 8 nav items and Lucide icons
- `src/components/layout/app-header.tsx` - Sticky header with notifications, user avatar menu, logout
- `src/components/layout/auth-shell.tsx` - Auth shell wrapper component
- `src/app/(auth)/layout.tsx` - Authenticated layout with SidebarProvider
- `src/app/(auth)/dashboard/page.tsx` - Dashboard with greeting, checklist, stats
- `src/app/(auth)/calendar/page.tsx` - Coming-soon: Kalender
- `src/app/(auth)/composer/page.tsx` - Coming-soon: Composer
- `src/app/(auth)/media/page.tsx` - Coming-soon: Media Library
- `src/app/(auth)/links/page.tsx` - Coming-soon: Links
- `src/app/(auth)/ideas/page.tsx` - Coming-soon: Ideen
- `src/app/(auth)/campaigns/page.tsx` - Coming-soon: Kampagnen
- `src/app/(auth)/settings/page.tsx` - Settings with Profil/Team tabs
- `src/app/(auth)/settings/profile/page.tsx` - Profile form page
- `src/app/(auth)/settings/team/page.tsx` - Team management page
- `src/components/shared/coming-soon.tsx` - Reusable branded coming-soon component
- `src/components/shared/onboarding-checklist.tsx` - 4-step onboarding with progress bar
- `src/components/settings/profile-form.tsx` - Profile editing with Zod validation
- `src/components/settings/team-list.tsx` - User list with role dropdowns
- `src/components/settings/invite-dialog.tsx` - Invite dialog with form and API call

## Decisions Made
- Used Zustand with persist middleware for sidebar collapse state (localStorage key: hitschies-ui)
- Settings uses inline Tabs component (not sub-routes) for snappy tab switching
- Viewer role can edit own profile (personal data) but team management controls are hidden

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Phase 1 complete: project scaffold, auth system, and app shell all operational
- All 8 navigation routes exist within the authenticated app shell
- Coming-soon pages ready to be replaced with real implementations in Phase 2+
- Team management UI connected to admin API endpoints from Plan 02
- Ready for Phase 2: Channel connection and social media account integration

## Self-Check: PASSED

All key files verified present. All commits (142139e, 430bfcc) verified in git log.

---
*Phase: 01-foundation-and-authentication*
*Completed: 2026-03-13*
