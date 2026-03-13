# Project Research Summary

**Project:** hitschies Publisher
**Domain:** Internal social media content planning tool (replacing swat.io)
**Researched:** 2026-03-13
**Confidence:** HIGH

## Executive Summary

hitschies Publisher is a focused internal tool for a 3-5 person candy brand marketing team to plan, schedule, and publish content to Instagram and TikTok. Unlike general-purpose SaaS tools (swat.io, Buffer, Hootsuite), the tool's primary value proposition is not breadth of platform support but depth of URL-Link-Automation: integrated UTM auto-fill, branded short links at `link.hitschies.de`, and a link-in-bio manager that auto-updates when posts go live. No competitor offers this combination in a single workflow. The cost efficiency is structural — at 56-96 EUR/month total vs 200-500+ EUR/month for swat.io alone, the tool pays for itself within months.

The recommended approach is a modular monolith built on Next.js 16 App Router + Supabase + Tailwind v4 + Late.dev, deployed on Vercel. The existing concept documents describe the right architecture but reference outdated library versions across the board. Several version changes are breaking: `react-beautiful-dnd` is deprecated (replace with `@dnd-kit/react`), Tailwind v3 is a major version behind (v4 uses CSS-first config), and `@supabase/auth-helpers-nextjs` is replaced by `@supabase/ssr`. These corrections must be applied before writing any code. The Late.dev API handles the social publishing complexity but introduces vendor risk; a publisher abstraction layer must be built from day one to allow swapping to direct Meta Graph API + TikTok API later.

The most critical risks are: (1) TikTok's API audit process takes 2-8 weeks and blocks TikTok publishing entirely — the application must be submitted before development starts; (2) the scheduled publishing cron job will hit Supabase Edge Function CPU limits if it processes multiple posts per invocation — a queue-based architecture with one post per invocation is mandatory; and (3) OAuth token expiration silently breaks publishing — token health monitoring must be built in Phase 1, not deferred. Addressing these three risks early eliminates the most likely failure modes.

## Key Findings

### Recommended Stack

The Next.js + Supabase + Tailwind + Vercel stack is validated as excellent for this project. It matches the team size, budget (~58 EUR/month), and feature scope. The key correction is to use current versions: Next.js 16 (not 14.2), Tailwind v4 CSS-first config (not v3 with `tailwind.config.ts`), Zod v4, and `@supabase/ssr` (not the deprecated auth-helpers). Late.dev sits at MEDIUM confidence due to vendor lock-in risk, but is the correct trade-off for v1 given it eliminates weeks of direct OAuth implementation work. The abstraction layer in `lib/social/publisher.ts` makes this risk manageable.

**Core technologies:**
- **Next.js 16 + React 19**: Full-stack framework — App Router is mature, Turbopack default, required for Vercel deployment
- **Supabase Pro**: PostgreSQL + Auth + Storage + Edge Functions + Realtime — all-in-one BaaS for 25 EUR/month
- **@supabase/ssr ^0.9**: Server-side auth for App Router — replaces deprecated `@supabase/auth-helpers-nextjs`
- **Late.dev (Build plan)**: Unified social publishing API — handles Instagram + TikTok without direct OAuth complexity
- **Tailwind CSS v4 + shadcn/ui CLI v4**: CSS-first design system — 5-100x faster builds, supports hitschies brand tokens
- **@dnd-kit/react**: Drag-and-drop — replaces deprecated `react-beautiful-dnd` (archived Aug 2025)
- **Zustand v5 + TanStack Query v5**: State management — Zustand for ephemeral UI state, TanStack Query for server state
- **Zod v4**: Runtime validation — shared between Server Actions, forms, and API routes
- **date-fns v4 + @date-fns/tz**: Date/time — timezone-aware scheduling, essential for Europe/Berlin default
- **nanoid v5 + qrcode**: URL engine — short code generation and QR code output for short links

### Expected Features

**Must have (table stakes — matches swat.io baseline):**
- Editorial Calendar (month/week/day views) — primary navigation surface, every competitor has this
- Post Composer with multi-channel support (Instagram + TikTok) — includes platform-specific caption overrides and previews
- Scheduled Auto-Publishing — the core reason the tool exists
- Media Library (upload, tag, reuse) — Supabase Storage backend with thumbnail generation
- Post Status Workflow (Draft > In Review > Approved > Scheduled > Published) — single-level approval for v1
- Hashtag Sets — predefined groups with one-click insert
- Campaign/Label Tagging — seasonal campaigns (Karneval, Halloween, Weihnachten) are core to hitschies strategy
- User Auth + Roles (Admin, Editor, Viewer) — Supabase Auth with email+password

**Should have (differentiators unique to hitschies Publisher):**
- UTM Builder with auto-fill from campaign + channel context — no competitor offers this integrated in the publishing flow
- Branded Short Links at `link.hitschies.de` — custom domain, auto-generated on post save, click tracking
- Link-in-Bio Manager with auto-update on publish — killer differentiator, eliminates manual bio-link management
- Central Link Library — registry of all links with click count, device breakdown, referrer data
- Ideen-Board (Kanban) — content ideation pipeline from idea to scheduled post

**Defer to Phase 2:**
- AI Content Assistant (Claude API for caption suggestions)
- Best-Time-to-Post heatmap (requires historical data from Fabric)
- Analytics Dashboard (Fabric integration)
- Multi-level approval workflows + email notifications
- Facebook/LinkedIn/YouTube channel support (Late.dev supports them)
- Dark Mode (CSS custom properties are already structured for this)

**Deliberate anti-features (never build or defer to Phase 3):**
- Team Inbox / Community Management — use Meta Business Suite
- Social Listening — use existing n8n Trend Scout
- Analytics (own) — use Microsoft Fabric
- Native Mobile App — responsive web is sufficient for internal tool

### Architecture Approach

The application follows a modular monolith pattern: a single Next.js App Router deployment on Vercel with Supabase as the complete backend layer. The short-link service (`link.hitschies.de`) is the sole exception — it runs as a minimal separate Vercel project with a catch-all catch route for clean URLs and edge-speed redirects. Server Components handle all data fetching by default; Client Components are used only for interactive UI (drag-and-drop, real-time subscriptions, form state). Server Actions replace REST endpoints for all internal mutations. Supabase Realtime is used selectively for the calendar and Kanban board only.

**Major components:**
1. **App Shell + Auth Guard** — sidebar navigation, Supabase Auth session management, role-based access via RLS
2. **Post Composer** — multi-channel post creation, platform previews, media attachment, scheduling, UTM/link generation
3. **Editorial Calendar** — month/week/day views, drag-to-reschedule (Server Action), Realtime subscription for live updates
4. **Link Engine** — UTM builder, short-code generation (nanoid), link library, click tracking
5. **Media Library** — Supabase Storage with resumable uploads (tus), thumbnail generation (sharp), asset reuse
6. **Ideas Board (Kanban)** — content pipeline, drag-and-drop between columns, promote to post
7. **Scheduled Publisher** — pg_cron + Edge Function queue, Late.dev API calls, idempotent via `platform_post_ids`
8. **Short-Link Redirect Service** — separate Vercel project, catch-all route, tracks clicks async, 302 redirect
9. **Link-in-Bio Manager** — branded landing page builder, auto-update on publish via sequential queue
10. **Campaign Manager** — CRUD for seasonal campaigns, color coding, UTM template source

**Build order (5 dependency layers):**
- Layer 0: Supabase schema, Next.js scaffold, Auth, design tokens
- Layer 1: Channel management, Campaign CRUD, Media Library, Hashtag Sets
- Layer 2: Post Composer, Link Engine core, Ideas Board
- Layer 3: Editorial Calendar, Link-in-Bio Manager, Post status workflow, UTM Templates
- Layer 4: Scheduled Publisher, Short-Link Redirect Service, Click tracking
- Layer 5: Polish (keyboard shortcuts, empty states, responsive refinement)

### Critical Pitfalls

1. **TikTok API audit takes 2-8 weeks** — submit the API application before writing any code. If Late.dev covers TikTok audit requirements on their end, verify this immediately. Build a fallback "draft to TikTok" mode for launch.

2. **OAuth token expiration silently breaks publishing** — build `token_health` monitoring in Phase 1: daily cron checks token validity, warning banner 7 days before expiry, proactive Instagram token refresh at 50-day intervals. `token_expires_at` is already in the schema — wire it to alerting.

3. **Edge Function 2-second CPU limit breaks batch publishing** — use a queue-based architecture: cron job enqueues posts to `publish_queue` (via Supabase `pgmq`), separate invocations process one post-channel combination at a time. Set intermediate `publishing` status before attempting to prevent double-publish on retry.

4. **Short-link redirect via Supabase Edge Function has cold-start latency and DNS complexity** — use a Vercel Edge Function at a separate project deployed to `link.hitschies.de`. Configure DNS before development starts, not after. Track clicks asynchronously (fire-and-forget) to never block the redirect.

5. **react-beautiful-dnd is deprecated** — do not install it. Use `@dnd-kit/react` from the first commit. This library is required for calendar drag-to-reschedule, Kanban column reordering, link-in-bio item ordering, and carousel media ordering.

## Implications for Roadmap

Based on the dependency graph in ARCHITECTURE.md and pitfall severity from PITFALLS.md, the following phase structure is recommended:

### Phase 0: Prerequisites and Foundation
**Rationale:** Several blockers must be resolved before development starts. TikTok API audit (2-8 weeks) and DNS configuration for `link.hitschies.de` are not code tasks — delaying them delays the entire project.
**Delivers:** Development-ready environment and unblocked external dependencies
**Tasks:** Submit TikTok API application, configure `link.hitschies.de` DNS, Supabase project setup with full schema + RLS policies, Next.js 16 scaffold with correct dependency versions (all corrections from STACK.md applied), hitschies design tokens in Tailwind v4, CI/CD on Vercel
**Avoids:** TikTok audit blocking launch (Pitfall 5), deprecated dependencies causing technical debt (Pitfall 3, 14)

### Phase 1: Core Authentication and Content Entity Layer
**Rationale:** Auth and the foundational entities (channels, campaigns, media, hashtags) are prerequisites for everything else. Nothing can be built without them. Channel management must include token health monitoring from day one.
**Delivers:** Working auth with roles, connected social channels with health monitoring, campaign management, media library with resumable uploads
**Addresses:** User Auth + Roles, Channel Management, Media Library, Campaign/Label Tagging, Hashtag Sets (from FEATURES.md)
**Avoids:** Token expiration breaking publishing silently (Pitfall 1), large video upload failures (Pitfall 8)

### Phase 2: Post Composer and Link Engine
**Rationale:** The composer and link engine are the heart of the product. Both are required simultaneously because the UTM builder and short-link generation happen inside the composer flow. The Ideas Board can be built in parallel as it has fewer dependencies.
**Delivers:** Full post creation with platform-specific captions, previews, scheduling, UTM auto-fill, and short-link generation
**Addresses:** Post Composer, Platform Preview, UTM Builder, Smart Short-Links, Link Library, Ideen-Board (from FEATURES.md)
**Avoids:** UTM parameter inconsistency (Pitfall 11), timezone confusion in scheduling (Pitfall 13), platform content validation failures (Pitfall 6)

### Phase 3: Editorial Calendar and Post Workflow
**Rationale:** The calendar requires posts to exist. Post status workflow (Draft > Review > Approved > Scheduled) is required before publishing can be meaningful. This phase makes the tool functional as a planning surface.
**Delivers:** Month/week/day calendar with drag-to-reschedule, full approval workflow, Supabase Realtime for live collaboration
**Addresses:** Editorial Calendar, Post Status Workflow (from FEATURES.md)
**Avoids:** Calendar performance degradation (Pitfall 9) — design lazy loading and virtualization from the start

### Phase 4: Publishing Pipeline and Short-Link Redirect Service
**Rationale:** Publishing is the most technically complex phase and has the most pitfalls. Queue-based architecture, idempotency, and the separate Vercel project for `link.hitschies.de` must all be built correctly the first time.
**Delivers:** Scheduled auto-publishing via Late.dev, short-link redirect service at `link.hitschies.de`, click tracking, link-in-bio auto-update on publish
**Addresses:** Scheduled Publishing, Link-in-Bio Manager with auto-update, Click Tracking (from FEATURES.md)
**Avoids:** Edge Function timeout on batch publishing (Pitfall 2), short-link redirect latency (Pitfall 4), link-in-bio race condition (Pitfall 7), Late.dev vendor lock-in (Pitfall 10 — publisher abstraction layer)
**Uses:** pg_cron + pgmq queue pattern, Vercel Edge Function for redirects, Late.dev publisher behind abstraction interface

### Phase 5: Polish and Production Readiness
**Rationale:** The tool is functionally complete after Phase 4. Phase 5 addresses the experience quality that determines team adoption: empty states, error recovery, responsive refinement, and soft-delete undo.
**Delivers:** Branded empty states and personality moments (confetti on publish), QR code generation for short links, soft-delete with 30-day recovery, keyboard shortcuts, responsive tablet/mobile refinement, onboarding checklist
**Addresses:** hitschies Brand Identity, QR Code Generation (from FEATURES.md)
**Avoids:** Missing undo for destructive actions (Pitfall 12)

### Phase Ordering Rationale

- Auth and entity layer before content creation: no composer can function without channels, campaigns, and media
- Link Engine co-located with Composer (Phase 2): UTM fill and short-link generation happen inside the composer — they cannot be separated
- Calendar after Composer (Phase 3): the calendar renders posts that must first exist
- Publishing last among core phases (Phase 4): the most failure-prone component — all inputs must be stable before the pipeline is built
- Pitfall 2 (Edge Function CPU limit) mandates queue architecture decided before Phase 4 begins
- Pitfall 1 (token expiration) mandates monitoring built in Phase 1, not bolted on later

### Research Flags

Phases likely needing deeper `/gsd:research-phase` during planning:

- **Phase 4 (Publishing Pipeline):** Late.dev API documentation needs hands-on validation. Supabase pgmq queue API requires implementation research. The exact mechanism by which Late.dev handles TikTok authorization vs. what the app must manage is unclear and must be resolved before building the publisher.
- **Phase 4 (Short-Link Redirect):** Vercel Edge Function + separate project + custom domain setup needs step-by-step validation. The pattern is well-known but the configuration details are specific.
- **Phase 1 (Token Health Monitoring):** Late.dev's token refresh documentation is sparse. Need to verify whether Late.dev auto-refreshes Instagram tokens or whether the app must implement 50-day proactive refresh.

Phases with standard patterns (research-phase likely unnecessary):

- **Phase 0 (Foundation):** Next.js 16 + Supabase scaffold has a first-class Vercel template. Well-documented, zero ambiguity.
- **Phase 1 (Auth + Entities):** Supabase Auth + `@supabase/ssr` in App Router is thoroughly documented. Standard CRUD patterns.
- **Phase 2 (Composer + Link Engine):** All components are standard React patterns with well-documented libraries. UTM logic is straightforward string manipulation.
- **Phase 3 (Calendar + Workflow):** dnd-kit and Supabase Realtime have excellent documentation.
- **Phase 5 (Polish):** No research needed — standard UX patterns and nanoid + qrcode library usage.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All primary technologies have official documentation. Version corrections are based on release notes. `react-beautiful-dnd` deprecation is a confirmed GitHub archived repo. |
| Features | HIGH | Competitor analysis covers 6 tools. Feature gaps are based on direct product comparison, not inference. Table stakes vs differentiators is well-grounded. |
| Architecture | HIGH | Supabase + Next.js App Router patterns are mature and well-documented. The short-link Vercel edge approach is confirmed by Supabase's own documentation noting Edge Function custom domain limitations. |
| Pitfalls | MEDIUM | TikTok audit process, token expiration, and Edge Function limits are confirmed. Late.dev-specific behavior (token refresh scope, TikTok audit coverage) is MEDIUM confidence — needs hands-on verification. |

**Overall confidence:** HIGH

### Gaps to Address

- **Late.dev TikTok coverage:** Does Late.dev's API key authorization cover the TikTok Content Posting API audit requirement, or must hitschies independently apply for TikTok app review? This must be confirmed with Late.dev support before Phase 1 begins. If Late.dev does not cover this, TikTok publishing may be unavailable at launch.

- **Late.dev token refresh scope:** Does Late.dev handle Instagram long-lived token refresh (every 50 days) automatically, or does the app need to implement this? Review Late.dev API docs and support before building Phase 1 token health monitoring.

- **pgmq availability on Supabase Pro:** Confirm `pgmq` extension is available on Supabase Pro plan without additional configuration before designing the Phase 4 publishing queue.

- **link.hitschies.de DNS pre-configuration:** DNS propagation can take 24-48 hours. Domain must be configured as a prerequisite task in Phase 0 to avoid blocking Phase 4 development.

## Sources

### Primary (HIGH confidence)
- [Next.js 16 Release](https://nextjs.org/blog/next-16) — version features and requirements
- [Supabase + Next.js Quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs) — App Router patterns
- [Supabase Custom Domains docs](https://supabase.com/docs/guides/platform/custom-domains) — Edge Function domain limitations
- [Edge Functions Custom Domains issue #29354](https://github.com/supabase/supabase/issues/29354) — confirmed limitation
- [Supabase Edge Function Limits](https://supabase.com/docs/guides/functions/limits) — 2-second CPU limit
- [Supabase Cron Documentation](https://supabase.com/docs/guides/cron) — pg_cron patterns
- [react-beautiful-dnd Deprecation Issue #2672](https://github.com/atlassian/react-beautiful-dnd/issues/2672) — archived Aug 2025
- [Tailwind CSS v4.0](https://tailwindcss.com/blog/tailwindcss-v4) — CSS-first config changes
- [shadcn/ui CLI v4 Changelog](https://ui.shadcn.com/docs/changelog/2026-03-cli-v4) — Tailwind v4 support
- [Zod v4 Release Notes](https://zod.dev/v4) — breaking changes from v3
- [Zustand v5 Announcement](https://pmnd.rs/blog/announcing-zustand-v5) — API changes

### Secondary (MEDIUM confidence)
- [Late.dev Pricing](https://getlate.dev/pricing) — Build plan details
- [Late.dev Instagram API](https://getlate.dev/instagram) — Instagram publishing scope
- [Late.dev TikTok API](https://getlate.dev/tiktok) — TikTok publishing scope
- [Late.dev Reviews on AppSumo](https://appsumo.com/products/late/reviews/) — vendor stability signals
- [swat.io Features](https://swat.io/en/features/) — competitor baseline
- [Planable Product](https://planable.io/product/) — approval workflow and calendar UX benchmark
- [Top 5 Drag-and-Drop Libraries for React in 2026](https://puckeditor.com/blog/top-5-drag-and-drop-libraries-for-react) — dnd-kit recommendation
- [Processing Large Jobs with Supabase](https://supabase.com/blog/processing-large-jobs-with-edge-functions) — queue architecture pattern

### Tertiary (LOW confidence)
- [Next.js App Router Patterns 2026 (DEV.to)](https://dev.to/teguh_coding/nextjs-app-router-the-patterns-that-actually-matter-in-2026-146) — community patterns, needs validation
- [TikTok Content Posting API](https://developers.tiktok.com/doc/content-posting-api-get-started) — audit requirements (process may change)

---
*Research completed: 2026-03-13*
*Ready for roadmap: yes*
