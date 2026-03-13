# Phase 1: Foundation and Authentication - Context

**Gathered:** 2026-03-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Project scaffold (Next.js + Supabase + Tailwind + shadcn/ui), complete database schema with RLS policies, email+password authentication with role-based access (Admin/Editor/Viewer), and branded app shell with collapsible sidebar and hitschies design tokens. All navigation sections visible with coming-soon placeholders for unbuilt features.

</domain>

<decisions>
## Implementation Decisions

### User registration flow
- Invite-only: no public signup, admin creates accounts directly
- Admin enters email, name, and role in a settings page; system creates the account and sends a "set your password" email via Supabase
- First admin (Ersin) seeded via migration script with known email
- Login page: centered card with hitschies logo, Magenta accents, email + password fields

### Database schema scope
- Deploy ALL tables from the tech spec in Phase 1 (profiles, channels, posts, media, links, drafts, campaigns, hashtag_sets, etc.)
- Use gen_random_uuid() instead of uuid-ossp extension (built into Postgres, simpler)
- Full RLS policies from day one: viewers read-only, editors create/edit, admins full access
- Seed realistic hitschies demo data: sample campaigns (Karneval 2026, Sommer), hashtag sets (hitschies Standard), test links

### Sidebar & placeholder pages
- All sidebar nav items visible from Phase 1 (Kalender, Composer, Media, Links, Ideen, Kampagnen, Settings)
- Unbuilt sections show branded "coming soon" empty states with hitschies personality ("Hier entsteht gerade etwas Susses!")
- Sidebar fully collapsible from day one (240px to 64px icon-only) as specified in design doc
- Default landing page after login: dashboard with onboarding checklist (connect channels, create first post, etc.)
- Full header: logo + app name, notification bell (placeholder), user avatar + name, settings gear

### Role management UI
- Settings page with two sections: "Mein Profil" (name, avatar, password change) and "Team" (admin-only user management)
- Team section: user list with name, email, role dropdown, status; "+ Neues Mitglied einladen" button
- Role changes take effect immediately (next page load / API call, not session-bound)
- Last-admin safeguard: system blocks demoting or deactivating the last remaining admin
- User removal: deactivate only (soft-delete), no permanent deletion in UI

### Claude's Discretion
- Viewer role implementation: Claude decides between "see everything, edit nothing" vs. limited navigation (recommendation: see everything, actions hidden/disabled — simplest with RLS)
- Loading states and transition animations
- Exact toast notification behavior
- Mobile bottom navigation details (responsive breakpoints defined in design doc)
- Password requirements beyond Supabase defaults

</decisions>

<specifics>
## Specific Ideas

- Design inspiration: Notion clarity + Linear aesthetics + hitschies colors (from concept doc)
- "Playful Professional" — 80% clean & functional, 20% hitschies personality
- Onboarding checklist similar to the wireframe in design doc section 7.2
- Coming-soon pages should feel on-brand, not like error pages

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- No existing codebase — greenfield project
- Concept documents (01-03) provide complete design tokens, DB schema, component specs, and project structure

### Established Patterns
- shadcn/ui as component library base (Tailwind-based, customizable)
- Zustand for client state management
- TanStack Query for server state
- Supabase SSR package for auth middleware
- Lucide icons throughout

### Integration Points
- Supabase Auth for authentication (email + password)
- Supabase PostgreSQL for database
- Supabase Storage for media (configured in Phase 1, used in Phase 2+)
- Vercel for deployment

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation-and-authentication*
*Context gathered: 2026-03-13*
