# Roadmap: hitschies Publisher

## Overview

The hitschies Publisher replaces swat.io as the marketing team's social media planning tool. The build progresses from foundation (auth, design system, entity layer) through the core content creation experience (composer, link engine, media), into the planning surface (calendar, workflow), and culminates with the publishing pipeline and polish. The URL-Link-Automation engine -- the primary differentiator -- is woven through Phases 3 and 5 rather than isolated, because UTM/short-link generation happens inside the composer flow and publishing triggers link-in-bio updates.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation and Authentication** - Project scaffold, Supabase schema, auth with roles, app shell with hitschies branding
- [ ] **Phase 2: Entity Layer** - Channels, campaigns, hashtag sets, media library -- the building blocks every feature depends on
- [ ] **Phase 3: Post Composer and Link Engine** - Post creation with platform previews, UTM builder, short-link generation, link library
- [ ] **Phase 4: Editorial Calendar and Ideas Board** - Calendar views with drag-and-drop, filtering, and Kanban ideas board
- [ ] **Phase 5: Publishing Pipeline and Link-in-Bio** - Scheduled auto-publishing via Late.dev, short-link redirect service, link-in-bio with auto-update
- [ ] **Phase 6: Polish and Production Readiness** - Keyboard shortcuts, responsive refinement, empty states, confetti, QR codes

## Phase Details

### Phase 1: Foundation and Authentication
**Goal**: Users can log in to a branded app shell with role-based access, and the entire database schema and design system are in place
**Depends on**: Nothing (first phase)
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, UX-01, UX-04
**Success Criteria** (what must be TRUE):
  1. User can sign up with email/password, log in, and remain logged in after browser refresh
  2. Admin can assign Admin/Editor/Viewer roles, and each role sees appropriate UI (Editor can create, Viewer is read-only)
  3. App shell displays with hitschies branding (Magenta primary, brand typography), collapsible sidebar, and navigation to all major sections
  4. Supabase project is live with complete database schema, RLS policies, and storage buckets configured
**Plans**: TBD

Plans:
- [ ] 01-01: Supabase setup and database schema
- [ ] 01-02: Auth and role system
- [ ] 01-03: App shell and design tokens

### Phase 2: Entity Layer
**Goal**: Users can manage channels, campaigns, hashtag sets, and media assets -- all prerequisite data that the composer and calendar depend on
**Depends on**: Phase 1
**Requirements**: CHAN-01, CHAN-02, CHAN-03, CHAN-04, CAMP-01, CAMP-02, HASH-01, HASH-02, HASH-03, MEDIA-01, MEDIA-02, MEDIA-03, MEDIA-04, MEDIA-05
**Success Criteria** (what must be TRUE):
  1. Admin can connect Instagram and TikTok accounts via Late.dev and see connection status with token health indicators
  2. User can create campaigns with name, color, and date range, and these campaigns are available for assignment elsewhere
  3. User can create and categorize hashtag sets, and view them in a list ready for one-click insertion
  4. User can upload images/videos via drag-and-drop, tag them, search/filter by type and tags, and see usage counts
  5. System generates thumbnails for uploaded videos and monitors channel token expiration with alerts
**Plans**: TBD

Plans:
- [ ] 02-01: Channel management and token health
- [ ] 02-02: Campaigns and hashtag sets
- [ ] 02-03: Media library

### Phase 3: Post Composer and Link Engine
**Goal**: Users can create fully-featured posts with platform-specific captions, live previews, media attachments, scheduling, and integrated URL-Link-Automation (UTM builder + short links + link library)
**Depends on**: Phase 2
**Requirements**: COMP-01, COMP-02, COMP-03, COMP-04, COMP-05, COMP-06, COMP-07, COMP-08, COMP-09, LINK-01, LINK-02, LINK-03, LINK-04, LINK-05, LINK-06, LINK-07, LINK-08, LINK-09, CAMP-03
**Success Criteria** (what must be TRUE):
  1. User can write a caption with per-platform character count, override per platform (e.g., shorter for TikTok), and see a live platform-specific preview
  2. User can attach media from the library, select target channels, assign a campaign tag, insert a hashtag set, add a first comment, and schedule for a specific date/time
  3. User can create a link with auto-generated UTM parameters (source from channel, campaign from tag), select from UTM templates, and system auto-generates a branded short link at link.hitschies.de
  4. User can browse the central link library showing all links with click counts, associated posts, and campaign
  5. Short links resolve correctly (302 redirect to full UTM URL) and clicks are tracked
**Plans**: TBD

Plans:
- [ ] 03-01: Post composer core (caption, media, channels, scheduling)
- [ ] 03-02: Platform previews and composer refinements
- [ ] 03-03: UTM builder and short-link generation
- [ ] 03-04: Link library

### Phase 4: Editorial Calendar and Ideas Board
**Goal**: Users can plan content visually on a calendar with drag-and-drop rescheduling, and manage content ideas on a Kanban board that feeds into the composer
**Depends on**: Phase 3
**Requirements**: CAL-01, CAL-02, CAL-03, CAL-04, CAL-05, CAL-06, IDEA-01, IDEA-02, IDEA-03, IDEA-04
**Success Criteria** (what must be TRUE):
  1. User can view posts in month, week, and day calendar views, with post cards showing thumbnail, caption snippet, channel icon, and status badge
  2. User can drag and drop a post to reschedule it to a different date/time
  3. User can filter the calendar by channel, status, and campaign, and click a day to quick-add a new post
  4. User can create content ideas, organize them on a Kanban board (Idee / In Bearbeitung / Bereit / Geplant), drag between columns, and promote an idea to a full post
**Plans**: TBD

Plans:
- [ ] 04-01: Calendar month/week/day views
- [ ] 04-02: Calendar interactions (drag-drop, filtering, quick-add)
- [ ] 04-03: Ideas Kanban board

### Phase 5: Publishing Pipeline and Link-in-Bio
**Goal**: Posts auto-publish at scheduled times via Late.dev with robust error handling, the short-link redirect service is live at link.hitschies.de, and the link-in-bio page auto-updates when posts publish
**Depends on**: Phase 4
**Requirements**: WRKF-01, WRKF-02, WRKF-03, WRKF-04, WRKF-05, WRKF-06, BIO-01, BIO-02, BIO-03, BIO-04, BIO-05
**Success Criteria** (what must be TRUE):
  1. Post follows full status lifecycle (Draft > In Review > Approved > Scheduled > Published) with submit-for-review, approve/reject with comment, and schedule actions
  2. System auto-publishes scheduled posts at the specified time via Late.dev, and failed publications show error details with retry capability
  3. User can create a branded link-in-bio landing page, add/remove/reorder links via drag-and-drop, and set link expiration dates
  4. When a post with "update bio" enabled publishes, the associated link auto-moves to position 1 on the bio page
  5. Link-in-bio page is publicly accessible at a branded URL
**Plans**: TBD

Plans:
- [ ] 05-01: Post status workflow (review, approve, schedule)
- [ ] 05-02: Publishing pipeline (queue, Late.dev, retry)
- [ ] 05-03: Short-link redirect service (separate Vercel project)
- [ ] 05-04: Link-in-bio manager

### Phase 6: Polish and Production Readiness
**Goal**: The tool feels polished, responsive, and delightful -- with keyboard shortcuts, branded empty states, responsive refinement, and personality moments that reflect the hitschies brand
**Depends on**: Phase 5
**Requirements**: UX-02, UX-03, UX-05, UX-06, LINK-10
**Success Criteria** (what must be TRUE):
  1. User can use keyboard shortcuts for common actions (N=new post, K=calendar, etc.)
  2. App layout is functional and usable on tablet and mobile (768px breakpoint)
  3. Empty states show hitschies personality (branded illustrations/messages) throughout the app
  4. Confetti animation plays when a post is successfully published
  5. User can generate a QR code for any short link
**Plans**: TBD

Plans:
- [ ] 06-01: Keyboard shortcuts and responsive refinement
- [ ] 06-02: Empty states, confetti, and QR codes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 > 2 > 3 > 4 > 5 > 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation and Authentication | 0/3 | Not started | - |
| 2. Entity Layer | 0/3 | Not started | - |
| 3. Post Composer and Link Engine | 0/4 | Not started | - |
| 4. Editorial Calendar and Ideas Board | 0/3 | Not started | - |
| 5. Publishing Pipeline and Link-in-Bio | 0/4 | Not started | - |
| 6. Polish and Production Readiness | 0/2 | Not started | - |
