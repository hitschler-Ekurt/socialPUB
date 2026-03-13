# Technology Stack

**Project:** hitschies Publisher
**Researched:** 2026-03-13

## Stack Validation Verdict

The chosen stack (Next.js + Supabase + Tailwind CSS + Late.dev + Vercel) is **excellent** for this project. It is well-matched to the team size (3-5 users), the budget constraints (~56-96 EUR/month), and the feature scope. However, the existing spec documents reference **outdated versions** across the board. This file provides corrected, current versions and flags critical library changes.

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Next.js | ^16.1 | Full-stack React framework | Best Vercel integration, App Router is mature, Turbopack stable as default bundler. v16 brings cache components via PPR and `use cache`, proxy.ts replaces middleware for network-level routing. The spec references v14.2 which is two major versions behind. | HIGH |
| TypeScript | ^5.7 | Type safety | Non-negotiable for a tool with complex data models (posts, links, campaigns). Catches schema drift early. | HIGH |
| React | ^19 | UI library | Next.js 16 requires React 19. React 19 brings Server Components as stable, `use()` hook, and improved suspense. | HIGH |

### Backend / BaaS

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Supabase (Cloud) | Pro plan | PostgreSQL, Auth, Storage, Edge Functions, Realtime | All-in-one backend at ~25 EUR/month. RLS for security, Realtime for live post-status updates, Storage for media library, Edge Functions for short-link redirects and scheduled publishing. PostgREST v14 delivers ~20% more RPS. Supabase Auth now supports OAuth 2.1/OIDC server mode for future SSO needs. | HIGH |
| @supabase/supabase-js | ^2.99 | Supabase client SDK | The JS client is stable, well-maintained, and the only officially supported way to interact with Supabase from JS/TS. Requires Node.js >= 20 (dropped Node 18 in v2.79). | HIGH |
| @supabase/ssr | ^0.9 | Server-side auth for Next.js | Replaces the deprecated `@supabase/auth-helpers-nextjs`. Handles cookie-based sessions for App Router server components, server actions, and middleware. The spec references `@supabase/ssr@^0.5` which is outdated. | HIGH |

### Social Media API

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Late.dev (getlate.dev) | Build plan ($13/mo) | Unified social publishing API | Supports Instagram (photos, reels, carousels, stories), TikTok (video upload), and 11 other platforms via a single REST API. No Facebook app review or Business Manager setup required. Simple API key auth. Automatic media validation and optimization. 99.97% uptime SLA. Integrates with n8n natively. The Build plan (10 profiles, 120 posts/month) is sufficient for a 3-5 person team posting to 2 channels. | MEDIUM |

**Late.dev risk assessment:** Late.dev is a relatively young service. The MEDIUM confidence reflects vendor lock-in risk. Mitigation: the `lib/social/publisher.ts` abstraction layer in the spec is correct -- wrap Late.dev behind an interface so you can swap to direct Meta Graph API + TikTok API later if needed. Keep the direct API integration files (`instagram.ts`, `tiktok.ts`) as stubs ready to implement.

### UI / Design System

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Tailwind CSS | ^4.1 | Utility-first CSS | v4 is a ground-up rewrite: 5x faster full builds, 100x faster incremental builds. CSS-first config via `@theme` (no more `tailwind.config.ts`). Built-in container queries, cascade layers, `@property` for design tokens. The spec references v3.4 which is a major version behind. | HIGH |
| shadcn/ui | CLI v4 | Component library (copy-paste model) | Tailwind v4 compatible, accessible, fully customizable. CLI v4 released March 2026 with monorepo support and agent-friendly `shadcn/skills`. Supports both Radix UI and Base UI primitives. Perfect for brand theming (hitschies Magenta/Blau). | HIGH |
| Lucide React | ^0.577 | Icon library | Consistent, tree-shakeable, matches shadcn/ui's default icon set. Already specified in brand design. | HIGH |

### State Management & Data Fetching

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Zustand | ^5.0 | Client-side state (UI state, composer state) | Minimal API, React 18+ native `useSyncExternalStore`, tiny bundle (~1KB). Perfect for ephemeral UI state (calendar view mode, composer draft, sidebar state). v5 dropped `use-sync-external-store` shim. The spec references v4.5. | HIGH |
| TanStack Query | ^5.90 | Server state / data fetching | Handles caching, background refetching, optimistic updates, pagination. Essential for the calendar view (fetching posts by date range), media library (paginated grid), and link library. ~20% smaller than v4. The spec references v5.50 which is fine but should use latest. | HIGH |

### Drag & Drop

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| @dnd-kit/react | ^0.3 | Drag & drop for calendar and Kanban | **CRITICAL CHANGE:** The spec lists `react-beautiful-dnd@^13.1` which is **deprecated and archived** (Aug 2025). Use `@dnd-kit/react` instead. It is the modern, actively maintained successor recommended by Atlassian. Lightweight, accessible, supports mouse/keyboard/touch/pointer. | HIGH |

### Validation & Schema

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Zod | ^4.3 | Runtime validation, form schemas, API input validation | v4 is a major rewrite with better performance, smaller bundle, and improved TypeScript inference. The spec references v3.23. Use v4 for new projects. Works with React 19 server actions for form validation. | HIGH |

### Date/Time

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| date-fns | ^4.1 | Date manipulation and formatting | Tree-shakeable, immutable, comprehensive. Essential for calendar views, scheduling, timezone handling. Use `@date-fns/tz` for timezone-aware scheduling (social posts need to be scheduled in the user's timezone). | HIGH |

### Media Processing

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| sharp | ^0.33 | Server-side image processing | Thumbnail generation, image optimization before upload to Supabase Storage. Fast, native, well-supported. Runs in Next.js API routes or server actions. | HIGH |

### URL / Link Engine

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| nanoid | ^5.0 | Short code generation | Fast, URL-safe, collision-resistant ID generation for short links. 6-char nanoid has ~2 billion possible combinations, more than enough for this use case. | HIGH |

### QR Codes

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| qrcode | ^1.5 | QR code generation for short links | Generates QR codes for link.hitschies.de URLs. Simple, well-maintained. Can generate SVG or PNG. | HIGH |

### Deployment

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Vercel | Pro plan (~20 EUR/mo) | Hosting, edge network, serverless functions | Native Next.js 16 support (Vercel builds Next.js). Edge network for fast page loads. Serverless functions for API routes. Preview deployments for review workflow. | HIGH |

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Framework | Next.js 16 | Remix / Nuxt / SvelteKit | Next.js has the deepest Vercel integration, largest ecosystem, and Supabase has first-class Next.js support. No reason to deviate. |
| Backend | Supabase | Firebase / Appwrite / PocketBase | Supabase gives you raw PostgreSQL (complex queries, joins, triggers), RLS, and Edge Functions. Firebase's NoSQL model is wrong for relational data like posts-channels-campaigns. PocketBase is self-hosted only. |
| Social API | Late.dev | Ayrshare / Direct APIs | Ayrshare is more expensive ($49/mo starter) and less developer-friendly. Direct APIs save money but cost weeks of development time for OAuth flows, token refresh, media upload, and format validation. Late.dev is the best trade-off for v1. |
| CSS | Tailwind v4 | CSS Modules / Styled Components / Panda CSS | Tailwind v4 with shadcn/ui is the standard for component-based React apps. Styled Components has SSR complexity. Panda CSS is newer with smaller ecosystem. |
| Drag & Drop | @dnd-kit/react | react-beautiful-dnd / pragmatic-drag-and-drop | react-beautiful-dnd is deprecated. pragmatic-drag-and-drop (Atlassian) is headless but requires more boilerplate. dnd-kit is the sweet spot. |
| State | Zustand + TanStack Query | Redux Toolkit / Jotai | Redux is overkill for 3-5 users / small team. Jotai is good but Zustand has better devtools and simpler API for this use case. |
| Validation | Zod v4 | Yup / Valibot | Zod has the best TypeScript integration and is the de facto standard with shadcn/ui forms. Valibot is smaller but less mature. |
| Icons | Lucide | Heroicons / Phosphor | Lucide is shadcn/ui's default and specified in the brand guidelines. No reason to change. |
| Date | date-fns | Day.js / Luxon / Temporal | date-fns is tree-shakeable (Day.js is not fully), has the best TypeScript support, and the most comprehensive API for calendar-related work. Temporal API is not widely supported yet. |

## Libraries to NOT Use

| Library | Why Not |
|---------|---------|
| `react-beautiful-dnd` | **Deprecated and archived** (Aug 2025). Will not receive security patches. |
| `@supabase/auth-helpers-nextjs` | **Deprecated.** Replaced by `@supabase/ssr`. |
| `moment.js` | Bloated (66KB), mutable API, officially in maintenance mode. |
| `axios` | Unnecessary -- `fetch` is built into Next.js with caching semantics. TanStack Query wraps fetch. |
| `tailwind.config.ts` | Tailwind v4 uses CSS-first config via `@theme`. No JS config file needed. |
| `styled-components` / `emotion` | SSR complexity with App Router, conflicts with Tailwind approach. |
| `next-auth` / `Auth.js` | Unnecessary -- Supabase Auth handles everything (email/password, future SSO). Adding Auth.js creates duplicate auth systems. |

## Version Corrections from Existing Specs

The `03-TECHNISCHE-SPECS.md` lists outdated versions. Here are the corrections:

| Package | Spec Version | Current Version | Breaking Changes? |
|---------|-------------|----------------|-------------------|
| next | ^14.2 | ^16.1 | YES - Turbopack default, proxy.ts replaces middleware for network routing, requires React 19 |
| @supabase/ssr | ^0.5 | ^0.9 | Minor API changes |
| zustand | ^4.5 | ^5.0 | YES - Requires React 18+, `create` no longer supports custom equality |
| react-beautiful-dnd | ^13.1 | DEPRECATED | YES - Replace with @dnd-kit/react |
| tailwindcss | ^3.4 | ^4.1 | YES - CSS-first config, no tailwind.config.ts |
| zod | ^3.23 | ^4.3 | YES - Major API changes, better perf |
| date-fns | ^3.6 | ^4.1 | Minor - Mostly additive |
| lucide-react | ^0.383 | ^0.577 | No - Additive icon updates |
| eslint | ^8 | ^9 | YES - Flat config format |

## Installation

```bash
# Core framework
npm install next@latest react@latest react-dom@latest

# Supabase
npm install @supabase/supabase-js @supabase/ssr

# UI / Styling
npx shadcn@latest init
npm install tailwind-merge clsx lucide-react

# State & Data
npm install zustand @tanstack/react-query

# Drag & Drop
npm install @dnd-kit/react

# Validation
npm install zod

# Date/Time
npm install date-fns @date-fns/tz

# Media & Links
npm install sharp nanoid qrcode

# Dev dependencies
npm install -D typescript @types/react @types/react-dom @types/node
npm install -D eslint @eslint/js typescript-eslint
npm install -D prettier prettier-plugin-tailwindcss
npm install -D supabase
npm install -D @types/qrcode
```

## Environment Requirements

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| Node.js | 20.x | 22.x (LTS) |
| npm | 10.x | 10.x |
| Supabase CLI | 2.x | Latest |

## Monthly Cost Estimate

| Service | Plan | Cost (EUR/mo) |
|---------|------|---------------|
| Supabase | Pro | ~25 |
| Vercel | Pro | ~20 |
| Late.dev | Build ($13) | ~12 |
| Short-link domain | DNS | ~1 |
| **Total** | | **~58** |

This is well within the stated budget of 56-96 EUR/month. The Late.dev Build plan (120 posts/month) should be sufficient for a team posting 3-5 times per week across 2 channels (~30-40 posts/month). If volume increases, upgrade to Accelerate ($33/mo) for unlimited posts.

## Sources

- [Next.js 16 Release](https://nextjs.org/blog/next-16)
- [Next.js 16.1 Release](https://nextjs.org/blog/next-16-1)
- [Late.dev Pricing](https://getlate.dev/pricing)
- [Late.dev Instagram API](https://getlate.dev/instagram)
- [Late.dev TikTok API](https://getlate.dev/tiktok)
- [Supabase Changelog](https://supabase.com/changelog)
- [Supabase + Next.js Quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [shadcn/ui CLI v4 Changelog](https://ui.shadcn.com/docs/changelog/2026-03-cli-v4)
- [Tailwind CSS v4.0](https://tailwindcss.com/blog/tailwindcss-v4)
- [react-beautiful-dnd Deprecation](https://github.com/atlassian/react-beautiful-dnd/issues/2672)
- [dnd-kit Documentation](https://dndkit.com/)
- [Zustand v5 Announcement](https://pmnd.rs/blog/announcing-zustand-v5)
- [TanStack Query v5](https://tanstack.com/query/latest)
- [Zod v4 Release Notes](https://zod.dev/v4)
- [@supabase/supabase-js on npm](https://www.npmjs.com/package/@supabase/supabase-js)
- [@supabase/ssr on npm](https://www.npmjs.com/package/@supabase/ssr)
