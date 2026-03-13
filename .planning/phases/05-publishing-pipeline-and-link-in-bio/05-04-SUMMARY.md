---
phase: 05-publishing-pipeline-and-link-in-bio
plan: 04
subsystem: infra
tags: [next.js, supabase, vercel, redirect, short-links, geolocation, analytics]

# Dependency graph
requires:
  - phase: 03-post-composer-and-link-engine
    provides: links and link_clicks tables, short_code generation
provides:
  - Standalone redirect service resolving short codes to full URLs
  - Click tracking with geo-IP, device type, referrer data
  - Fire-and-forget analytics pattern for low-latency redirects
affects: [deployment, link-in-bio]

# Tech tracking
tech-stack:
  added: ["@vercel/functions (geo/IP helpers)", "next.js 15 (redirect service only)"]
  patterns: [fire-and-forget insert, separate micro-service project, sha256 IP hashing]

key-files:
  created:
    - hitschies-link-redirect/src/app/[code]/route.ts
    - hitschies-link-redirect/package.json
    - hitschies-link-redirect/next.config.ts
    - hitschies-link-redirect/src/app/page.tsx
    - hitschies-link-redirect/src/app/layout.tsx
    - hitschies-link-redirect/.env.example
    - hitschies-link-redirect/.gitignore
    - hitschies-link-redirect/tsconfig.json
  modified: []

key-decisions:
  - "Next.js 15 for redirect service (not 16) for simplicity and stability in a minimal project"
  - "Fire-and-forget click tracking (no await on insert) for sub-100ms redirect latency"
  - "SHA-256 IP hashing for privacy-preserving analytics"
  - "@vercel/functions geolocation instead of deprecated req.geo"

patterns-established:
  - "Micro-service pattern: separate Next.js project for single-purpose service"
  - "Fire-and-forget analytics: non-blocking insert for latency-critical paths"

requirements-completed: [LINK-06, LINK-07]

# Metrics
duration: 5min
completed: 2026-03-13
---

# Phase 05 Plan 04: Short-Link Redirect Service Summary

**Standalone Next.js 15 redirect service at link.hitschies.de with fire-and-forget click tracking via @vercel/functions geo-IP**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-13T23:00:00Z
- **Completed:** 2026-03-13T23:05:00Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- Complete standalone redirect service in hitschies-link-redirect/ ready for Vercel deployment
- Dynamic route handler resolving short_code from Supabase links table with 302 redirect
- Click tracking with country, city, device type, referrer, and hashed IP -- all fire-and-forget
- Proper error handling: 404 for inactive/missing links, 410 for expired links

## Task Commits

Each task was committed atomically:

1. **Task 1: Create minimal redirect service project** - `df776b6` (feat)
2. **Task 2: Verify redirect service and prepare for deployment** - checkpoint approved (no code changes)

**Plan metadata:** (pending)

## Files Created/Modified
- `hitschies-link-redirect/src/app/[code]/route.ts` - Core redirect handler with click tracking
- `hitschies-link-redirect/package.json` - Minimal Next.js 15 project with Supabase and Vercel deps
- `hitschies-link-redirect/next.config.ts` - Minimal Next.js config
- `hitschies-link-redirect/tsconfig.json` - Standard TS config with @/ path alias
- `hitschies-link-redirect/src/app/layout.tsx` - Minimal root layout
- `hitschies-link-redirect/src/app/page.tsx` - Landing page for bare domain
- `hitschies-link-redirect/.env.example` - Required env vars documentation
- `hitschies-link-redirect/.gitignore` - Standard Next.js gitignore

## Decisions Made
- Used Next.js 15 (not 16) for the redirect service since it is a tiny standalone project with no shared code with the main app
- Fire-and-forget pattern for click insert ensures redirect latency stays minimal
- SHA-256 IP hashing preserves analytics usefulness while protecting user privacy
- @vercel/functions geolocation and ipAddress helpers used instead of deprecated req.geo

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

**External services require manual configuration:**
- Create new Vercel project from hitschies-link-redirect directory (after moving to separate repo)
- Configure custom domain link.hitschies.de in Vercel project settings
- Add CNAME record: link.hitschies.de -> cname.vercel-dns.com in DNS provider
- Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables in Vercel

## Next Phase Readiness
- Redirect service code complete and TypeScript-verified
- Ready for separate repo creation, Vercel deployment, and DNS configuration
- Main app's link engine (Phase 3) generates short codes that this service resolves

---
*Phase: 05-publishing-pipeline-and-link-in-bio*
*Completed: 2026-03-13*
