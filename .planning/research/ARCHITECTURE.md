# Architecture Patterns

**Domain:** Social Media Content Planning Tool (internal, 3-5 users)
**Researched:** 2026-03-13

## Recommended Architecture

The hitschies Publisher follows a **modular monolith** pattern deployed as a Next.js App Router application with Supabase as the backend-as-a-service layer. This is the right choice for a small internal tool: it avoids microservices complexity while maintaining clear component boundaries through feature-based folder organization and Supabase's built-in service separation (Auth, DB, Storage, Edge Functions, Realtime).

### High-Level System Diagram

```
                         [Users: 3-5 Marketing Team]
                                    |
                    +---------------------------------+
                    |        Vercel (CDN + SSR)       |
                    |   Next.js App Router (App Shell)|
                    |                                 |
                    |  Server Components  |  Client   |
                    |  (data fetching)    |  Components|
                    |  Server Actions     |  (UI state)|
                    |  API Routes         |  Zustand   |
                    +--------+----------+-+----------+
                             |          |
              +--------------+          +----------------+
              |                                          |
    +---------v-----------+              +---------------v-------+
    |   Supabase Cloud    |              |  link.hitschies.de    |
    |                     |              |  (Short-Link Service) |
    | +-------+ +-------+ |              |  Next.js API Route    |
    | | PgSQL | |Storage| |              |  OR Vercel Edge Fn    |
    | +-------+ +-------+ |              +-----------+-----------+
    | +-------+ +-------+ |                          |
    | | Auth  | |Realtime ||              (redirects to full URL
    | +-------+ +-------+ |               + tracks clicks in DB)
    | +-------+           |
    | | Edge  |           |
    | | Funcs |           |
    | +-------+           |
    +--------+------------+
             |
    +--------v-----------+
    |  Late.dev API      |
    |  (Unified Social   |
    |   Publishing)      |
    +--------+-----------+
             |
    +--------v-----------+
    |  Instagram, TikTok |
    |  (via Late.dev)    |
    +--------------------+
```

### Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| **App Shell (Layout)** | Sidebar navigation, header, auth guard, responsive shell | All feature modules, Supabase Auth |
| **Calendar Module** | Month/week/day views, drag-drop rescheduling, post filtering | Posts API, Composer (opens on click), Campaigns |
| **Post Composer** | Multi-channel post creation, caption editing, scheduling, platform previews | Media Library, Link Engine, Channels API, Late.dev (publish) |
| **Link Engine** | UTM builder, short-link generation, link-in-bio management, click tracking | Posts (embeds links), Supabase DB (links table), Short-Link Redirect Service |
| **Media Library** | Upload, tag, browse, reuse media assets | Supabase Storage, Post Composer (asset picker) |
| **Ideas Board (Kanban)** | Content ideation pipeline, drag-drop status progression | Posts (convert idea to post), Campaigns |
| **Campaign Manager** | Seasonal campaign CRUD, color coding, date ranges | Posts, Links, Ideas (all reference campaigns) |
| **Short-Link Redirect Service** | Receives short-link hits, records clicks, 302 redirects to full URL | Supabase DB (links, link_clicks tables) |
| **Scheduled Publisher** | Cron job: finds due posts, calls Late.dev API, updates status | Late.dev API, Supabase DB (posts, channels), Link-in-Bio (auto-update) |
| **Auth & Roles** | Email+password login, session management, role-based access (admin/editor/viewer) | Supabase Auth, RLS policies on all tables |

### Data Flow

**Post Creation Flow:**
```
User opens Composer
  -> Selects channels (Instagram, TikTok)
  -> Writes caption (with platform-specific overrides)
  -> Attaches media from Media Library (Supabase Storage)
  -> Adds link -> Link Engine generates UTM params + short-link
  -> Sets schedule date/time
  -> Saves as draft/submits for review/schedules directly
  -> Post saved to `posts` table with status + `post_channels` join
```

**Post Publishing Flow:**
```
Supabase Edge Function (cron, every 1-2 min)
  -> Queries: SELECT * FROM posts WHERE status='scheduled' AND scheduled_at <= NOW()
  -> For each post:
      -> Load channels (post_channels JOIN channels)
      -> Load media (post_media JOIN media -> Storage URLs)
      -> Call Late.dev API with payload per channel
      -> On success: status='published', store platform_post_ids
      -> On failure: status='failed', store publish_errors
      -> If update_linkinbio=true: push link to position 1 in linkinbio_items
```

**Short-Link Click Flow:**
```
External user clicks link.hitschies.de/abc123
  -> Vercel Edge Function (or Next.js API route)
  -> Lookup short_code in links table
  -> Check is_active and expires_at
  -> INSERT into link_clicks (referrer, user_agent, device_type)
  -> 302 Redirect to full_url (with UTM params baked in)
  -> DB trigger increments links.click_count
```

**Calendar Data Flow:**
```
Calendar page (Server Component)
  -> Fetch posts for date range with Supabase server client
  -> Filter by channel, status, campaign (URL search params)
  -> Render PostCards in day cells
  -> Drag-drop triggers Server Action: UPDATE posts SET scheduled_at = new_date
  -> Supabase Realtime subscription updates other open tabs
```

## Patterns to Follow

### Pattern 1: Server Components for Data, Client Components for Interaction

**What:** Use Next.js Server Components as the default for data fetching. Only mark components as `'use client'` when they need browser APIs, event handlers, or stateful hooks.

**When:** Every page and data-display component.

**Example:**
```typescript
// app/(auth)/calendar/page.tsx — Server Component (default)
import { createClient } from '@/lib/supabase/server'

export default async function CalendarPage({ searchParams }) {
  const supabase = await createClient()
  const { data: posts } = await supabase
    .from('posts')
    .select('*, post_channels(channel:channels(*))')
    .gte('scheduled_at', startDate)
    .lte('scheduled_at', endDate)

  return <CalendarGrid posts={posts} /> // Client component for drag-drop
}
```

### Pattern 2: Feature-Based Folder Organization

**What:** Group all related code (components, hooks, types, server actions) by feature, not by type.

**When:** Always. The existing spec structure already follows this with `components/calendar/`, `components/composer/`, etc.

**Example:**
```
src/
  features/
    calendar/
      components/   (CalendarGrid, DayCell, PostCard)
      hooks/        (useCalendarNavigation)
      actions/      (reschedulePost.ts — Server Action)
      types.ts
    composer/
      components/   (PostEditor, PostPreview, UTMBuilder)
      hooks/        (useAutoSave, useCharacterCount)
      actions/      (savePost.ts, publishPost.ts)
      types.ts
    links/
      components/   (LinkTable, UTMTemplateManager, LinkInBioEditor)
      actions/      (createLink.ts, generateShortCode.ts)
      lib/          (utm.ts, shortener.ts)
      types.ts
```

### Pattern 3: Supabase Server Client in Server Components, Browser Client for Realtime

**What:** Create two Supabase client factories. The server client uses cookies for auth in Server Components/Actions. The browser client is used only in Client Components that need Realtime subscriptions.

**When:** Every Supabase interaction.

**Example:**
```typescript
// lib/supabase/server.ts — for Server Components & Server Actions
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { /* cookie adapter */ } }
  )
}

// lib/supabase/client.ts — for Client Components (Realtime only)
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### Pattern 4: Server Actions for Mutations

**What:** Use Next.js Server Actions instead of custom API routes for all CRUD mutations. Server Actions provide type safety, automatic revalidation, and progressive enhancement.

**When:** All create/update/delete operations on posts, links, campaigns, media metadata, ideas.

**Example:**
```typescript
// features/calendar/actions/reschedulePost.ts
'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function reschedulePost(postId: string, newDate: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('posts')
    .update({ scheduled_at: newDate, updated_at: new Date().toISOString() })
    .eq('id', postId)

  if (error) throw new Error(`Failed to reschedule: ${error.message}`)
  revalidatePath('/calendar')
}
```

### Pattern 5: Zustand for Ephemeral UI State Only

**What:** Use Zustand stores exclusively for transient UI state (sidebar open/closed, active filters, composer draft in progress). All persistent data goes through Supabase via Server Actions or TanStack Query.

**When:** UI toggles, form drafts, optimistic UI state.

## Anti-Patterns to Avoid

### Anti-Pattern 1: API Routes for Everything

**What:** Creating `/api/posts`, `/api/links`, `/api/campaigns` REST endpoints for internal data mutations.

**Why bad:** Unnecessary indirection. Server Actions are simpler, type-safe, and co-located with the UI that calls them. API routes should only be used for external integrations (webhooks, short-link redirects, Late.dev callbacks).

**Instead:** Use Server Actions for internal mutations. Reserve API routes for: (1) short-link redirect endpoint, (2) webhook receivers, (3) cron-triggered publishing.

### Anti-Pattern 2: Client-Side Data Fetching by Default

**What:** Using `useEffect` + `fetch` or TanStack Query for initial page data.

**Why bad:** Slower initial load, layout shift, unnecessary loading spinners. Server Components fetch data before HTML reaches the browser.

**Instead:** Fetch in Server Components. Use TanStack Query only for data that needs client-side polling, infinite scroll, or optimistic updates (e.g., link click counts refreshing).

### Anti-Pattern 3: Fat Zustand Stores Mirroring Database

**What:** Keeping a local copy of all posts, links, campaigns in Zustand and syncing with the database.

**Why bad:** Stale data, sync bugs, duplicate source of truth. With 3-5 users and Supabase Realtime, this complexity is unnecessary.

**Instead:** Let Supabase be the single source of truth. Use Server Components for reads, Server Actions for writes, and Supabase Realtime subscriptions for live updates across tabs.

### Anti-Pattern 4: Supabase Edge Functions for the Short-Link Redirect

**What:** Using Supabase Edge Functions to handle `link.hitschies.de` redirects.

**Why bad:** Supabase custom domains apply to the entire project (`api.yourdomain.com`), not to individual Edge Functions at a separate domain. Setting up `link.hitschies.de` to route to a specific Supabase Edge Function requires workarounds, and Edge Functions custom domains have known issues (see GitHub issue #29354). The function URL would be `link.hitschies.de/functions/v1/redirect-link` instead of the clean `link.hitschies.de/abc123`.

**Instead:** Use a **Vercel API Route or Vercel Edge Function** at a separate Vercel project deployed to `link.hitschies.de`. This project contains a single catch-all route that looks up the short code, tracks the click in Supabase, and returns a 302 redirect. Vercel supports custom domains natively with zero-config SSL.

## Architecture Decisions

### Short-Link Service: Separate Vercel Project

The short-link redirect service (`link.hitschies.de`) should be a **minimal separate Vercel project** rather than a Supabase Edge Function. Rationale:

1. **Clean URLs:** `link.hitschies.de/abc123` instead of `/functions/v1/redirect-link?code=abc123`
2. **Custom domain:** Vercel handles custom domains and SSL natively
3. **Edge performance:** Vercel Edge Functions run globally at the CDN edge, providing sub-50ms redirects
4. **Simplicity:** A single catch-all `app/[code]/route.ts` file, ~30 lines of code
5. **Same Supabase:** Both projects connect to the same Supabase instance

```
link-hitschies/               # Separate Vercel project
  app/
    [code]/
      route.ts               # GET -> lookup + track + 302 redirect
  lib/
    supabase.ts              # Supabase client (service role key)
  vercel.json                # Domain config
```

### Scheduled Publishing: Supabase pg_cron + Edge Function

Use Supabase's built-in `pg_cron` extension to trigger an Edge Function every 1-2 minutes. The Edge Function:

1. Queries posts due for publishing
2. Calls Late.dev API for each post+channel combination
3. Updates post status
4. Optionally updates link-in-bio

This stays within Supabase because it is a background job with no custom domain requirement.

### Realtime: Selective Subscriptions

Use Supabase Realtime only where concurrent editing matters:

- **Calendar view:** Subscribe to `posts` changes so multiple team members see updates live
- **Kanban board:** Subscribe to `drafts` changes for live column updates
- **Do NOT use for:** Media library, link manager, settings (low concurrency, page refresh is fine)

### Drag-and-Drop: @dnd-kit instead of react-beautiful-dnd

The tech spec lists `react-beautiful-dnd` but it was **archived by Atlassian in August 2025** and is deprecated. Use `@dnd-kit/core` + `@dnd-kit/sortable` instead:

- Actively maintained, modern React patterns
- Better TypeScript support
- Works with React 18+ concurrent features
- Used for: Calendar drag-to-reschedule, Kanban column reordering, Link-in-Bio item reordering, Carousel media ordering

### Data Validation: Zod Schemas Shared Between Client and Server

Define Zod schemas once per entity and use them in:
- Server Action input validation
- Form validation (via react-hook-form + @hookform/resolvers/zod)
- API route input validation (short-link service)

This ensures the same validation rules apply everywhere without duplication.

## Component Dependency Graph & Build Order

```
Layer 0 (Foundation — no dependencies):
  ├── Supabase setup (project, schema, migrations, RLS)
  ├── Next.js project scaffold (App Router, Tailwind, shadcn/ui)
  ├── Auth (Supabase Auth, login page, middleware, profiles)
  └── Design tokens (hitschies brand, CSS variables)

Layer 1 (Core entities — depends on Layer 0):
  ├── Channel management (connect Instagram/TikTok via Late.dev)
  ├── Campaign CRUD (name, color, dates)
  ├── Media Library (upload to Supabase Storage, tagging, grid view)
  └── Hashtag Sets CRUD

Layer 2 (Content creation — depends on Layer 1):
  ├── Post Composer (caption, channel selection, media attachment,
  │                  scheduling, platform preview, hashtag picker)
  ├── Link Engine core (UTM builder, short-code generation, link CRUD)
  └── Ideas Board / Kanban (draft CRUD, column drag-drop)

Layer 3 (Content orchestration — depends on Layer 2):
  ├── Editorial Calendar (month/week/day views, post cards,
  │                       drag-drop rescheduling, filters)
  ├── Link-in-Bio Manager (page builder, auto-update on publish)
  ├── Post status workflow (draft -> review -> approved -> scheduled)
  └── UTM Templates (predefined parameter sets)

Layer 4 (Publishing & tracking — depends on Layer 3):
  ├── Scheduled Publisher (pg_cron + Edge Function + Late.dev)
  ├── Short-Link Redirect Service (separate Vercel project)
  └── Click tracking (link_clicks table, analytics view)

Layer 5 (Polish — depends on Layer 4):
  ├── Keyboard shortcuts
  ├── Onboarding checklist
  ├── Empty states & personality moments
  └── Responsive refinement (tablet, mobile)
```

**Build order rationale:** Each layer provides the building blocks for the next. You cannot build the Composer without Media Library and Channels. You cannot build the Calendar without Posts. You cannot publish without the Composer and Link Engine in place. This layered approach means each phase delivers testable, usable functionality.

## Scalability Considerations

| Concern | At 5 users (current) | At 50 users | At 500 users |
|---------|----------------------|-------------|--------------|
| Database load | Supabase Free/Pro handles easily | Still fine, add connection pooling | Consider read replicas |
| Media storage | Supabase Storage (1GB free, 100GB Pro) | Sufficient at Pro tier | Add CDN or switch to S3 |
| Short-link traffic | Vercel Edge handles 100K+ req/day | Add caching headers, use edge runtime | Add Redis cache for hot links |
| Publishing queue | pg_cron every 2 min, handles ~100 posts/day | Sufficient | Switch to dedicated queue (BullMQ) |
| Realtime connections | 200 concurrent (Supabase Pro) | Sufficient | May need to limit subscription scope |

For an internal tool with 3-5 users, **scalability is a non-concern for v1**. The architecture is designed to be simple and correct first.

## Sources

- [Supabase + Next.js Starter Template (Vercel)](https://vercel.com/templates/next.js/supabase) - HIGH confidence
- [Supabase Custom Domains docs](https://supabase.com/docs/guides/platform/custom-domains) - HIGH confidence
- [Edge Functions Custom Domains issue #29354](https://github.com/supabase/supabase/issues/29354) - HIGH confidence
- [react-beautiful-dnd deprecation issue #2672](https://github.com/atlassian/react-beautiful-dnd/issues/2672) - HIGH confidence
- [Late.dev Unified Social Media API](https://getlate.dev/) - MEDIUM confidence
- [Late.dev API Documentation](https://docs.getlate.dev) - MEDIUM confidence
- [Top 5 Drag-and-Drop Libraries for React in 2026](https://puckeditor.com/blog/top-5-drag-and-drop-libraries-for-react) - MEDIUM confidence
- [Next.js App Router Patterns 2026 (DEV.to)](https://dev.to/teguh_coding/nextjs-app-router-the-patterns-that-actually-matter-in-2026-146) - LOW confidence
- [Edge Functions Routing (Supabase docs)](https://supabase.com/docs/guides/functions/routing) - HIGH confidence
