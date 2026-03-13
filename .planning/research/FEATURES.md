# Feature Landscape

**Domain:** Internal social media content planning tool (replacing swat.io for a candy brand)
**Researched:** 2026-03-13
**Competitors analyzed:** swat.io, Planable, Later, Buffer, Hootsuite, Metricool

## Table Stakes

Features users expect. Missing = product feels incomplete. These are features that every social media planning tool in the market provides. Without them, the hitschies team would feel a downgrade from swat.io.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Editorial Calendar (Month/Week/Day)** | Every competitor has this. swat.io, Planable, Later, Buffer all center around a calendar view. Without it there is no planning tool. | High | Core navigation hub. Planable's calendar UX is the gold standard for visual planning. Must support month, week, and day views. Drag-and-drop to reschedule is mandatory. |
| **Post Composer with multi-channel support** | Fundamental to any publishing tool. Users must create content for Instagram + TikTok from one editor. swat.io, Buffer, Planable all have this. | High | Must handle platform-specific caption limits (IG: 2200 chars, TikTok: 2200 chars), media format constraints, and hashtag limits. Platform-specific overrides (different caption per channel) are expected. |
| **Scheduled Publishing** | Auto-publishing at a set time is the reason these tools exist. swat.io, Buffer, Later, Hootsuite all do this. Without it the team is copy-pasting into native apps. | High | Via Late.dev unified API for v1. Must handle Instagram feed posts, Reels, and TikTok videos. Cron-based edge function checks for due posts every minute. |
| **Media Library** | All competitors provide asset management. Uploading the same image twice or losing track of assets is a common pain point. swat.io, Planable, Hootsuite all include this. | Medium | Upload, tag, search, reuse. Show usage count per asset. Support image and video with thumbnail generation. Supabase Storage is the backend. |
| **Post Status Workflow** | Even basic tools have draft/scheduled/published states. swat.io has approval processes. Planable's multi-level approval is a headline feature. | Medium | For v1: Draft > In Review > Approved > Scheduled > Published. Simple single-level approval (not multi-level, that is Phase 2). Status changes logged in approval_logs. |
| **Platform Preview** | Planable, Later, and Buffer all show how a post will look on each platform before publishing. Users need to see what followers will see. | Medium | Live preview in composer that updates as text changes. Must render differently for Instagram (square/portrait feed) vs TikTok (vertical video). Character count per platform. |
| **Hashtag Management** | swat.io, Later, and Hootsuite all offer hashtag saving/grouping. Manually typing the same 15 hashtags every post is a known pain point. | Low | Predefined hashtag sets per campaign/category. One-click insert into caption. Store as reusable groups (e.g., "hitschies Standard", "Product Launch", "Karneval"). |
| **User Authentication + Roles** | Any multi-user tool needs auth and permissions. swat.io has user management. With 3-5 team members, knowing who did what matters. | Low | Supabase Auth with email+password. Three roles: Admin (full access), Editor (create/edit posts), Viewer (read-only). Simple, no complex permission matrix needed for 3-5 users. |
| **Campaign/Label Tagging** | Planable has labels, Buffer has tags, Hootsuite has campaigns. Grouping content by campaign (Karneval, Halloween, Weihnachten) is standard for brand teams. | Low | Color-coded campaign tags on calendar cards. Filter calendar by campaign. Seasonal campaigns are core to hitschies content strategy. |
| **Responsive Web App** | All competitors work on desktop and mobile. The team needs to check content status from mobile. swat.io has a mobile app (though reviews say it is limited). | Medium | Desktop-first but functional on tablet and mobile. No native app needed -- responsive web is sufficient for an internal tool with 3-5 users. |

## Differentiators

Features that set hitschies Publisher apart. Not expected in a basic planning tool, but these solve specific hitschies pain points that swat.io does not address.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **URL-Link-Automation Engine (UTM Builder)** | The primary reason to build this tool. swat.io has zero UTM automation. Metricool has a basic UTM builder + URL shortener, but not the integrated workflow hitschies needs. Eliminates manual UTM parameter creation for every post. | Medium | Auto-fill utm_source from channel (instagram/tiktok), utm_medium=social, utm_campaign from campaign tag. Predefined UTM templates. This alone justifies the tool. |
| **Smart Short-Links (link.hitschies.de)** | Own branded domain for short links. No competitor offers custom-domain short links integrated into the composer flow. Metricool has a generic shortener but not branded. Later has Linkin.bio but not custom short-link domains. | Medium | Custom domain (link.hitschies.de) requires DNS setup. Auto-generate short codes on post save. 302 redirect via Supabase Edge Function. Click tracking built in. |
| **Link-in-Bio Manager with Auto-Update** | Later has Linkin.bio (grid-style, pulls from scheduled posts). Linktree is standalone. Neither auto-updates the bio link when a new post goes live. hitschies Publisher can automatically push the latest link to position 1 when a post publishes. | High | Custom branded landing page. Drag-and-drop link ordering. Auto-update on publish is the killer differentiator -- no manual bio-link management. Link expiration for time-limited campaigns (Gewinnspiele). |
| **Central Link Library with Click Tracking** | No competitor combines link management, UTM tracking, and click analytics in one view integrated with the post composer. Teams usually juggle Bitly + Google Analytics + spreadsheets. | Medium | Central registry of all links. Shows which posts use each link. Click count, device breakdown, referrer data. Broken-link detection (Phase 2). |
| **Ideen-Board (Kanban)** | Planable has a content pipeline view. Most competitors only have calendar. A Kanban board for content ideas (Idea > In Progress > Ready > Scheduled) bridges the gap between brainstorming and publishing. | Medium | Kanban with 4 columns. Cards can be promoted to full posts. Drag-and-drop between columns. Lightweight -- not a project management tool, just idea staging. |
| **hitschies Brand Identity** | No off-the-shelf tool will have hitschies Magenta (#E6007E), playful micro-interactions, candy-themed empty states, or brand-specific personality moments. The tool feels like it belongs to the brand. | Low | Personality moments: confetti on publish, branded loading states, hitschies color palette throughout. "Playful Professional" design philosophy. Low effort, high team satisfaction impact. |
| **QR Code Generation for Short-Links** | Useful for offline-to-online campaigns (packaging, events, POS displays). No major social media tool includes this. Usually requires a separate tool like QR Code Generator. | Low | Generate QR code for any short link. Download as PNG/SVG. Useful for hitschies packaging and event marketing. nanoid + qrcode library. |
| **Cost Efficiency** | At 56-96 EUR/month vs 200-500+ EUR/month for swat.io, the tool pays for itself. No competitor in this price range offers the full feature set plus URL automation. | N/A | Not a feature per se, but a structural advantage. Break-even in 3-6 months. |

## Anti-Features

Features to explicitly NOT build. These are deliberate exclusions with reasoning to prevent scope creep.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Inbox / Community Management** | swat.io, Hootsuite, and Planable all have inbox features for managing comments and DMs. This is a massive scope increase (real-time message syncing, reply workflows, notification systems). The team already uses Meta Business Suite for this. Building it would double the development timeline. | Use Meta Business Suite for comment/DM management. Revisit in Phase 3 if the team outgrows it. |
| **Social Listening / Monitoring** | Hootsuite and Sprout Social offer monitoring. This requires crawling, keyword tracking, sentiment analysis -- an entirely separate product domain. hitschies already has n8n Trend Scout for this. | Continue using n8n Trend Scout automation workflows. |
| **Analytics Dashboard (v1)** | Hootsuite, Buffer, Later, Metricool all have analytics. But hitschies already feeds data into Microsoft Fabric. Building a parallel analytics system creates data fragmentation. | Use Microsoft Fabric for post performance analytics. Build integration in Phase 2 to pull Fabric data into the Publisher for convenience. |
| **AI Content Assistant (v1)** | Buffer, Hootsuite, and swat.io now have AI writing assistants. Tempting but not core to the planning workflow. Adding AI caption generation increases API costs and development complexity without solving the primary pain point (URL automation). | Defer to Phase 2. Claude API integration is straightforward to add later. Focus v1 on the URL-Link-Automation engine. |
| **Competitor Analysis** | Sprout Social and some enterprise tools offer this. Not relevant for a 3-5 person internal team focused on content creation, not competitive intelligence. | Not planned. Use manual research or specialized tools if needed. |
| **Influencer Management** | Tools like Grin, CreatorIQ exist for this. Entirely different domain with contracts, payments, content rights tracking. | Use dedicated influencer management tools if hitschies scales influencer work. |
| **Ad Management** | Hootsuite and Sprout Social integrate with ad platforms. Meta Ads Manager is purpose-built and free. Replicating ad management adds no value. | Continue using Meta Ads Manager directly. |
| **Native Mobile App** | Later and Buffer have native apps. For an internal tool with 3-5 users, a responsive web app is sufficient. Native apps require App Store maintenance, push notification infrastructure, and platform-specific code. | Build responsive web app. Test on mobile browsers. The team primarily works from desktop anyway. |
| **Facebook Publishing (v1)** | swat.io supports Facebook. But hitschies prioritizes Instagram and TikTok. Adding Facebook in v1 means additional API integration and testing for a lower-priority channel. | Defer to Phase 2. Late.dev supports Facebook, so adding it later is straightforward. |
| **Multi-level Approval Workflows with Email** | Planable's headline feature is multi-level approvals with multiple stakeholders per level. For a 3-5 person team, this is overengineered. A simple approve/reject flow is sufficient. | Build single-level approval in v1 (submit for review, approve/reject). Add multi-level + email notifications in Phase 2. |
| **Best-Time-to-Post Heatmap** | Metricool and Later offer this. Requires historical engagement data analysis. Not critical for v1 launch -- the team has institutional knowledge of when their audience is active. | Defer to Phase 2. Requires analytics data from Fabric to be useful. |
| **Content Recycling / Evergreen Reposts** | Some tools auto-repost evergreen content. Niche feature that risks spammy behavior and requires careful curation logic. | Defer to Phase 3. Low priority for a team creating primarily timely/seasonal content. |
| **Dark Mode** | Nice to have, not critical. Design tokens are prepared for it but implementing and testing doubles the UI work. | Defer to Phase 2. CSS custom properties are already structured for easy dark mode addition later. |
| **Microsoft SSO** | Enterprise feature. Email+password via Supabase Auth is sufficient for 3-5 internal users who all know each other. | Defer. Supabase Auth supports SSO providers, so adding Microsoft SSO later is a configuration change, not a rebuild. |

## Feature Dependencies

```
User Auth + Roles
  --> All other features (auth is the foundation)

Channel Management (connect Instagram + TikTok via Late.dev)
  --> Post Composer (need channels to target)
  --> Scheduled Publishing (need channel API tokens)
  --> Platform Preview (need to know which platforms)

Media Library
  --> Post Composer (attach media to posts)
  --> Post Media junction table

Campaign Management
  --> Campaign Tagging on posts
  --> UTM Builder (auto-fill utm_campaign from campaign name)
  --> Link Library (filter links by campaign)

Post Composer
  --> Post Status Workflow (statuses live on posts)
  --> Editorial Calendar (calendar displays posts)
  --> Hashtag Sets (insert into composer)

UTM Builder + Templates
  --> Smart Short-Links (UTM URL gets shortened)
  --> Link Library (stores all links)

Link Library
  --> Link-in-Bio Manager (bio items reference links)
  --> Click Tracking (tracks link performance)

Editorial Calendar
  --> Drag & Drop rescheduling (changes scheduled_at)

Ideen-Board (Kanban)
  --> Post Composer (promote idea to post)
  (mostly independent -- can be built in parallel)
```

## MVP Recommendation

**Phase 1 (must ship -- these form a usable replacement for swat.io):**

1. **User Auth + Roles** -- Foundation. Without it, nothing works. Low complexity.
2. **Channel Management** -- Connect Instagram + TikTok via Late.dev. Required before publishing.
3. **Media Library** -- Upload and manage assets. Required before post creation.
4. **Campaign Management** -- Create campaigns with colors and date ranges. Required for UTM auto-fill.
5. **Post Composer** -- Create posts with captions, media, hashtags, platform targeting, and scheduling.
6. **Platform Preview** -- Live preview in the composer. Critical for user confidence.
7. **Editorial Calendar** -- Month/week/day views with drag-and-drop. The primary navigation surface.
8. **Post Status Workflow** -- Draft > Review > Approved > Scheduled > Published. Simple single-level approval.
9. **UTM Builder + Templates** -- The killer feature. Auto-generate UTM parameters from campaign + channel context.
10. **Smart Short-Links** -- Branded short URLs with link.hitschies.de. Auto-generate on post save.
11. **Link Library** -- Central link registry with click tracking.
12. **Link-in-Bio Manager** -- Branded landing page with auto-update on publish.
13. **Hashtag Sets** -- Predefined groups, one-click insert.

**Defer to Phase 2:**

- **AI Content Assistant**: Claude API integration for caption suggestions. Straightforward to add but not critical for launch.
- **Best-Time-to-Post Heatmap**: Requires historical data from Fabric.
- **Analytics Dashboard**: Fabric integration for post performance.
- **Multi-level Approval Workflows + Email Notifications**: Overkill for 3-5 users in v1.
- **Facebook / LinkedIn / YouTube channels**: Late.dev supports them; add when the team is ready.
- **Content Recycling**: Low priority for seasonal content strategy.
- **Dark Mode**: Design tokens are ready; implementation is Phase 2.

**Defer to Phase 3:**

- **Team Inbox (Comments/DMs)**: Major scope. Meta Business Suite covers this today.
- **WhatsApp Business Integration**: Niche channel.
- **External API**: Only if third-party tools need to integrate.

## Competitor Feature Matrix

| Feature | swat.io | Planable | Later | Buffer | Hootsuite | Metricool | hitschies Publisher (v1) |
|---------|---------|----------|-------|--------|-----------|-----------|--------------------------|
| Editorial Calendar | Yes | Yes (best UX) | Yes | Yes | Yes | Yes | Yes |
| Post Composer | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Multi-channel publish | Yes (many) | Yes (9 platforms) | Yes (8) | Yes (10) | Yes (many) | Yes (7) | Instagram + TikTok only |
| Auto-publishing | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Media Library | Basic | Yes | Yes | Basic | Yes | Basic | Yes |
| Approval Workflow | Yes | Yes (multi-level) | No | No | Yes | No | Yes (single-level) |
| Platform Preview | Basic | Yes (best) | Yes | Yes | Basic | Basic | Yes |
| AI Writing | Yes (new) | Yes | No | Yes (all plans) | Yes | No | No (Phase 2) |
| UTM Builder | No | No | No | No | Basic | Yes (basic) | Yes (advanced, auto-fill) |
| Branded Short Links | No | No | No | No | No | No (generic) | Yes (link.hitschies.de) |
| Link-in-Bio | No | No | Yes (Linkin.bio) | No | No | No | Yes (with auto-update) |
| Link Click Tracking | No | No | Yes (bio only) | No | Basic | Yes (basic) | Yes (all links) |
| Community Inbox | Yes | Yes | Yes (limited) | No | Yes | No | No (use Meta BS) |
| Analytics | Yes | Yes (basic) | Yes | Yes | Yes | Yes (best) | No (use Fabric) |
| Social Listening | No | No | No | No | Yes | No | No |
| Kanban Ideas Board | No | Yes (pipeline) | No | No | No | No | Yes |
| Custom Branding | No | No | No | No | No | No | Yes (hitschies identity) |
| **Price/month** | **200-500+** | **33+/workspace** | **25+** | **6+** | **199+** | **Free tier** | **56-96 total** |

## Key Insight

The hitschies Publisher is NOT trying to compete with Hootsuite or Buffer on breadth. It is a **focused internal tool** that does three things better than any competitor:

1. **URL-Link-Automation** -- No competitor offers integrated UTM auto-fill + branded short links + link-in-bio auto-update in the publishing flow. This is the killer feature that justifies building a custom tool.
2. **Cost efficiency** -- At 56-96 EUR/month total infrastructure cost vs 200-500+ EUR/month for swat.io alone, the tool pays for itself within months.
3. **Brand identity** -- A tool that feels like hitschies, not a generic SaaS product. This matters for team adoption and daily satisfaction.

The trade-off is fewer channels (Instagram + TikTok vs "all platforms") and no inbox/analytics (handled by existing tools). This is the right trade-off for a 3-5 person team.

## Sources

- [swat.io Features](https://swat.io/en/features/)
- [swat.io Content Planning](https://swat.io/en/features/social-media-content-planning/)
- [swat.io on OMR Reviews](https://omr.com/en/reviews/product/swat-io)
- [Planable Product](https://planable.io/product/)
- [Planable Pricing](https://planable.io/pricing/)
- [Planable on G2](https://www.g2.com/products/planable/reviews)
- [Buffer Social Media Scheduling Tools 2026](https://buffer.com/resources/social-media-scheduling-tools/)
- [Buffer vs Hootsuite vs Later vs SocialCal Comparison 2025](https://www.socialcal.app/blog/buffer-vs-hootsuite-vs-later-vs-socialcal-comparison-2025)
- [Hootsuite vs Later](https://www.hootsuite.com/hootsuite-vs-later)
- [Metricool UTM Builder](https://help.metricool.com/en/article/utm-builder-while-planning-your-content-in6qsh/)
- [Metricool Review 2026](https://research.com/software/reviews/metricool)
- [Later Link in Bio vs Linktree](https://later.com/blog/linkin-bio-vs-linktree/)
- [Best Link in Bio Tools 2026](https://bloggingwizard.com/instagram-bio-link-tools/)
- [Best Social Media Schedulers 2026](https://www.eclincher.com/articles/12-best-social-media-schedulers-in-2026-features-and-pricing)
