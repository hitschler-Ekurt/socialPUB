# Domain Pitfalls

**Domain:** Social media content planning tool (hitschies Publisher)
**Researched:** 2026-03-13

---

## Critical Pitfalls

Mistakes that cause rewrites or major issues.

### Pitfall 1: OAuth Token Expiration Silently Breaks Publishing

**What goes wrong:** Social media API tokens expire without warning. Instagram long-lived tokens expire after 60 days of non-use. TikTok tokens have their own expiration cadence. When tokens expire, scheduled posts silently fail at publish time -- the user only discovers the failure when the post never appears.

**Why it happens:** Developers build the "happy path" of token setup during channel connection but neglect the ongoing lifecycle. Token refresh logic is deferred as a "later" concern. With Late.dev as an abstraction layer, developers assume the API handles token management, but the underlying platform tokens still expire and Late.dev cannot refresh them without re-authorization.

**Consequences:** Scheduled posts fail at the worst possible time (campaign launch day). Team loses trust in the tool. Manual re-authentication disrupts workflow, sometimes requiring full re-connection of the channel.

**Prevention:**
- Build a `token_health` monitoring system from day one: a daily cron job that checks token validity for each connected channel
- Display token expiration status prominently in the channel management UI (warning banner 7 days before expiry)
- Implement proactive token refresh: for Instagram, refresh every 50 days automatically (before the 60-day expiration)
- If using Late.dev: understand which token management Late.dev handles vs. what you must handle yourself -- verify this before committing to the integration
- Store `token_expires_at` in the channels table (already in schema, good) and build alerting around it

**Detection:** Posts with status "failed" appearing after scheduled time. No publishing activity despite scheduled posts existing. Users reporting "channel disconnected" errors.

**Phase:** Must be addressed in Phase 1 (Channel Management). This is not deferrable.

---

### Pitfall 2: Supabase Edge Function Cron Has a 2-Second CPU Limit

**What goes wrong:** The scheduled publisher (cron job that finds due posts and publishes them) is implemented as a Supabase Edge Function invoked by pg_cron. Edge Functions have a hard 2-second CPU time limit and a 150-second idle timeout. If multiple posts are scheduled for the same minute, or if social API calls are slow, the function times out and posts are lost or double-published.

**Why it happens:** The spec calls for "runs every minute via Supabase Cron" which is correct, but the assumption that a single Edge Function invocation can handle multiple posts with multiple API calls per post (one per channel) is flawed. Each social API call can take 1-5 seconds, and media upload can take 10-30+ seconds.

**Consequences:** Posts fail to publish on time. Posts may be partially published (e.g., published to Instagram but not TikTok). In the worst case, retry logic without idempotency causes duplicate posts.

**Prevention:**
- Use a **queue-based pattern**: the cron job only enqueues posts into a `publish_queue` table (fast, fits within 2s CPU). Separate Edge Function invocations process one post at a time
- Use Supabase's `pgmq` (PostgreSQL Message Queue) for the publish queue -- it provides exactly-once delivery semantics
- Process one post-channel combination per invocation, not batches
- Implement idempotency: store `platform_post_ids` immediately upon successful publish, check before retry
- Set post status to `publishing` (add this intermediate status) before attempting, so the next cron run does not pick up the same post
- Have a "stuck post" detector: if a post stays in `publishing` for more than 5 minutes, mark it as `failed` and alert

**Detection:** Posts stuck in "scheduled" status past their scheduled time. Duplicate posts appearing on social channels. Edge Function timeout errors in Supabase logs.

**Phase:** Phase 1 (Post Publishing). Architecture decision must be made before building the publisher.

---

### Pitfall 3: react-beautiful-dnd Is Deprecated -- Calendar and Kanban Will Break

**What goes wrong:** The technical spec lists `react-beautiful-dnd` as a dependency for drag-and-drop in the calendar and Kanban board. This library was deprecated by Atlassian in 2022 and archived on GitHub in August 2025. It produces console warnings on installation, will not receive bug fixes, and is incompatible with React 19+ concurrent features.

**Why it happens:** The spec was written based on a popular library that was still widely referenced in tutorials and documentation. By 2026, it is dead code.

**Consequences:** Console warnings in development. Potential runtime issues with React 19 (if Next.js upgrades). No bug fixes for drag-drop edge cases. Technical debt from day one.

**Prevention:**
- Use **@dnd-kit/core** + **@dnd-kit/sortable** instead. It is the most modern, actively maintained, and customizable drag-and-drop library for React
- Alternative: **@hello-pangea/dnd** (community fork of react-beautiful-dnd with active maintenance) if API compatibility with existing tutorials is desired
- For the calendar specifically, consider whether a dedicated calendar component (like FullCalendar with its drag-drop plugin) is more appropriate than building from scratch

**Detection:** npm warnings during installation. TypeScript compatibility issues. Drag-drop bugs that cannot be fixed upstream.

**Phase:** Phase 1 (project setup). Replace in package.json before writing any drag-drop code.

---

### Pitfall 4: Short-Link Redirect Latency and DNS Misconfiguration

**What goes wrong:** The custom short-link service (link.hitschies.de) is implemented as a Supabase Edge Function. Every click on a short link requires: DNS resolution -> Edge Function cold start -> database lookup -> redirect. Cold starts can add 500ms-2s latency. If DNS is misconfigured, the entire link-in-bio system goes down, breaking all existing short links.

**Why it happens:** Developers test with warm Edge Functions and don't account for cold start latency. The DNS configuration for a subdomain (link.hitschies.de) pointing to Supabase Edge Functions is non-trivial and easy to misconfigure.

**Consequences:** Users clicking short links experience noticeable delay (bad UX, lower click-through rates). DNS misconfiguration = all short links are dead links (catastrophic for published content). Google and social platforms may flag slow-redirecting links as suspicious.

**Prevention:**
- **Use Vercel's edge middleware** for the redirect instead of Supabase Edge Functions -- Vercel has faster cold starts and global edge distribution. Route `link.hitschies.de` to the same Vercel deployment with a catch-all route
- Cache hot links in-memory or use Vercel KV/Edge Config for the most-clicked links
- Implement a **fallback redirect**: if the Edge Function/database is unreachable, redirect to hitschies.de homepage rather than showing an error
- Set up DNS **before** building the feature: verify `link.hitschies.de` resolves correctly as a prerequisite
- Add uptime monitoring on the short-link domain from day one
- Track click asynchronously (fire-and-forget to a queue) -- never let tracking block the redirect

**Detection:** High redirect latency (>500ms) in analytics. Broken link reports from the marketing team. DNS resolution failures in monitoring.

**Phase:** Phase 1 (URL-Link-Automation). DNS setup is a prerequisite task that should be completed before any development starts.

---

### Pitfall 5: TikTok Content Posting API Requires App Audit and Has Visibility Restrictions

**What goes wrong:** Developers build and test TikTok publishing in a sandbox, then discover that unaudited apps can only publish to the developer's own account with private visibility. Getting the TikTok app audited requires a formal review process that can take weeks or months.

**Why it happens:** TikTok tightened API access in 2025, adding more steps to the approval process and requiring detailed documentation of app purpose and data usage. This is not a technical problem but a business/compliance problem that blocks the entire TikTok integration.

**Consequences:** TikTok publishing does not work in production at launch. The "MVP" ships without one of its two core platforms. Team has to manually post to TikTok, defeating the purpose of the tool.

**Prevention:**
- **Start the TikTok API application and audit process immediately** -- before writing any code. This is a 2-8 week process
- If using Late.dev: verify that Late.dev's API key covers TikTok publishing for your use case (they may handle the audit requirement on their end)
- Have a **fallback strategy**: if TikTok audit is not complete by launch, support "draft to TikTok" where the tool prepares the content but the user manually publishes from TikTok app
- Document exactly which TikTok API scopes you need (video.publish, video.upload) and apply for them early

**Detection:** API calls returning visibility restrictions or permission errors. Posts appearing as private instead of public.

**Phase:** Pre-Phase 1 (prerequisite). Start the application process as soon as the project is greenlit.

---

## Moderate Pitfalls

### Pitfall 6: Platform-Specific Content Validation Is an Iceberg

**What goes wrong:** The spec defines platform limits (caption length, aspect ratios, video duration) but these limits change frequently and have undocumented edge cases. For example: Instagram Reels have different duration limits than feed videos. TikTok silently rejects videos with certain codecs. Carousel posts have different image size requirements than single-image posts.

**Prevention:**
- Centralize all platform limits in a single configuration file (already planned as `platforms.ts`, good)
- Validate media **before upload** to social APIs (dimensions, codec, file size, duration)
- Build a validation layer that returns user-friendly error messages ("Your video is 11 minutes -- TikTok allows max 10 minutes")
- If using Late.dev: rely on their validation where available, but add client-side pre-validation for instant feedback
- Subscribe to platform developer changelogs (Meta for Developers blog, TikTok Developer updates) to catch limit changes

**Detection:** Posts failing with cryptic API errors. Users uploading content that appears to be valid but gets rejected.

**Phase:** Phase 1 (Post Composer). Build comprehensive validation before building the publishing pipeline.

---

### Pitfall 7: Link-in-Bio Auto-Update Race Condition

**What goes wrong:** When a post is published with "update link-in-bio" enabled, the system must update the bio link on Instagram via the API. If two posts publish simultaneously (or within seconds), they race to update the bio link, and the wrong link may end up in the bio.

**Prevention:**
- Queue link-in-bio updates and process them sequentially (FIFO)
- Add a `last_bio_update_at` timestamp to prevent rapid-fire updates (minimum 30-second gap)
- After updating, verify the bio link was set correctly by reading it back from the API
- Log all bio link changes in the approval_logs table for audit trail

**Detection:** Bio link pointing to the wrong post. Users reporting mismatched link-in-bio content.

**Phase:** Phase 1 (URL-Link-Automation / Link-in-Bio Manager).

---

### Pitfall 8: Supabase Storage Limits for Video Content

**What goes wrong:** TikTok and Instagram Reels content is video-heavy. The Supabase Free tier limits uploads to 50MB per file. Even on Pro, standard uploads are limited to 5GB but uploads above 6MB should use resumable upload methods. Teams upload high-resolution videos that exceed limits or fail mid-upload.

**Prevention:**
- Implement **resumable uploads** (tus protocol) for any file over 6MB -- Supabase supports this natively
- Set bucket-level file size limits appropriate for social media content (500MB for videos should cover most cases)
- Add client-side file size validation before upload begins
- Show upload progress for large files
- Consider video compression on the client before upload (e.g., using browser APIs or a service worker) to reduce storage costs
- Calculate storage cost implications: a team posting 3-5 videos per week at 100MB each = ~1.5-2.5GB per month

**Detection:** Upload failures for large video files. Storage cost exceeding budget. Slow upload experience reported by users.

**Phase:** Phase 1 (Media Library). Must use resumable uploads from the beginning.

---

### Pitfall 9: Calendar Performance with Many Posts

**What goes wrong:** The editorial calendar renders all posts for a visible date range. With a busy content schedule (20-30 posts per month across multiple channels), the calendar becomes sluggish due to unnecessary re-renders, especially during drag-and-drop operations and month transitions.

**Prevention:**
- Virtualize the calendar grid -- only render visible cells
- Fetch posts lazily by visible date range (not all posts at once)
- Use React.memo and stable keys for post cards
- Debounce drag-and-drop position updates (optimistic UI, single DB write on drop)
- Prefetch adjacent months when the user approaches the boundary
- Use Supabase Realtime sparingly -- subscribe to post changes for the visible range only

**Detection:** Calendar lag when switching months. Drag-and-drop stutter. High re-render counts in React DevTools.

**Phase:** Phase 1 (Calendar). Design the data fetching strategy correctly from the start.

---

### Pitfall 10: Late.dev Vendor Lock-In and Pricing Escalation

**What goes wrong:** Late.dev simplifies social API integration but creates a single point of failure. If Late.dev raises prices, changes terms, has extended downtime, or sunsets features (reviews mention features being moved to paid add-ons), the entire publishing pipeline breaks.

**Prevention:**
- Design a **publisher abstraction layer** (`lib/social/publisher.ts` is already planned) that can swap between Late.dev and direct API calls
- Keep the direct API integration code (Meta Graph API, TikTok API) as a fallback, even if Late.dev is the primary for v1
- Monitor Late.dev API response times and error rates independently
- Negotiate pricing/terms before committing to production use
- Set a cost ceiling: if Late.dev exceeds X EUR/month, trigger migration to direct APIs

**Detection:** Late.dev API errors or slow responses. Unexpected billing increases. Feature deprecation notices from Late.dev.

**Phase:** Phase 1 (architecture). The abstraction layer must be built before implementing any publishing logic.

---

## Minor Pitfalls

### Pitfall 11: UTM Parameter Inconsistency Across Team Members

**What goes wrong:** Without strict UTM naming conventions, team members create inconsistent campaign names (e.g., "karneval-2026" vs "Karneval_2026" vs "karneval2026"), making analytics data fragmented and unreliable.

**Prevention:**
- Enforce UTM naming conventions via validation (lowercase, hyphens only, no spaces)
- Auto-generate UTM campaign names from the campaign entity (already planned in schema)
- Make UTM templates the default path -- discourage manual UTM entry
- Add a "UTM preview" in the composer so users see exactly what will be tracked

**Detection:** Analytics showing fragmented campaign data. Multiple entries for what should be the same campaign.

**Phase:** Phase 1 (UTM Builder).

---

### Pitfall 12: Missing Undo/Recovery for Destructive Actions

**What goes wrong:** A user accidentally deletes a post, removes a campaign, or overwrites a link-in-bio configuration. With no undo mechanism, the data is gone.

**Prevention:**
- Implement soft deletes (`deleted_at` timestamp) for posts, campaigns, and links
- Add a confirmation dialog for destructive actions (delete, bulk operations)
- Keep a 30-day "trash" for recovered items
- Use optimistic UI updates with rollback capability

**Detection:** Users asking how to recover deleted content. Support requests for data recovery.

**Phase:** Phase 1 (core CRUD operations). Add `deleted_at` columns to the schema from the start.

---

### Pitfall 13: Timezone Confusion in Scheduling

**What goes wrong:** The scheduled_at timestamp is stored in UTC (correct), but the UI displays times in the user's browser timezone. If a user schedules a post for "14:00" thinking it is CET but their browser is set to a different timezone, the post publishes at the wrong time.

**Prevention:**
- Store and display all scheduled times in a single, explicit timezone (CET/CEST for hitschies, since it is a German team)
- Show the timezone explicitly in the scheduler UI: "14:00 CET"
- Convert to UTC only at the storage layer, never expose UTC to the user
- Add a timezone setting in the app settings, defaulting to Europe/Berlin

**Detection:** Posts publishing at unexpected times. Users confused about when their post will go live.

**Phase:** Phase 1 (Post Composer / Scheduling).

---

### Pitfall 14: Next.js Version and Dependency Staleness

**What goes wrong:** The tech spec references Next.js ^14.2, but Next.js 15 has been stable since late 2024 and the ecosystem is moving toward it. Starting with an older version means missing out on performance improvements and needing an upgrade migration later.

**Prevention:**
- Start with Next.js 15 (App Router) -- it is stable and has better caching, Turbopack support, and React 19 compatibility
- Update the dependency versions in package.json: Next.js 15, React 19, @supabase/ssr latest
- Verify all chosen libraries are compatible with React 19 before starting (this is why react-beautiful-dnd must be replaced)

**Detection:** Missing modern features. Performance issues that are solved in newer versions.

**Phase:** Phase 1 (project initialization).

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Project Setup | Deprecated dependencies (react-beautiful-dnd, old Next.js) | Audit and update all deps before writing code |
| Channel Connection | TikTok audit requirement blocking launch | Start API application process immediately |
| Channel Connection | Token expiration breaking publishing silently | Build token health monitoring from day one |
| Post Composer | Platform limits changing without notice | Centralized validation config, subscribe to changelogs |
| Publishing Pipeline | Edge Function timeout on batch publishing | Queue-based architecture, one post per invocation |
| Publishing Pipeline | Duplicate posts from retry without idempotency | Store platform_post_ids, check before retry |
| URL-Link-Automation | DNS not configured for link.hitschies.de | Configure DNS as a prerequisite before development |
| URL-Link-Automation | Short-link redirect latency from cold starts | Use Vercel edge middleware instead of Supabase Edge Functions |
| Link-in-Bio | Race condition on concurrent bio updates | Sequential queue processing with minimum gap |
| Media Library | Large video uploads failing | Resumable uploads (tus protocol) from day one |
| Calendar | Performance degradation with many posts | Virtualization, lazy loading by date range |
| Overall Architecture | Late.dev vendor lock-in | Abstraction layer with direct API fallback |
| Scheduling | Timezone confusion for German team | Default to Europe/Berlin, show timezone explicitly |

---

## Sources

- [Supabase Edge Function Limits](https://supabase.com/docs/guides/functions/limits)
- [Supabase Cron Documentation](https://supabase.com/docs/guides/cron)
- [Supabase Storage File Limits](https://supabase.com/docs/guides/storage/uploads/file-limits)
- [react-beautiful-dnd Deprecation Issue](https://github.com/atlassian/react-beautiful-dnd/issues/2672)
- [dnd-kit as Modern Alternative](https://puckeditor.com/blog/top-5-drag-and-drop-libraries-for-react)
- [Instagram Graph API Guide 2026](https://elfsight.com/blog/instagram-graph-api-complete-developer-guide-for-2026/)
- [Instagram API 2026 Changes](https://storrito.com/resources/Instagram-API-2026/)
- [TikTok Content Posting API](https://developers.tiktok.com/doc/content-posting-api-get-started)
- [TikTok API Rate Limits](https://developers.tiktok.com/doc/tiktok-api-v2-rate-limit)
- [Late.dev Reviews on AppSumo](https://appsumo.com/products/late/reviews/)
- [URL Shortener SEO Pitfalls](https://app.smler.io/blogs/avoid-url-shortener-mistakes-that-hurt-seo-performance-2026)
- [Common URL Shortener Errors](https://www.shortifyme.com/blog/common-errors-and-troubleshooting-with-url-shorteners/)
- [Processing Large Jobs with Supabase](https://supabase.com/blog/processing-large-jobs-with-edge-functions)
- [pg_cron Timeout Discussion](https://github.com/orgs/supabase/discussions/37574)
