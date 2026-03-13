# Requirements: hitschies Publisher

**Defined:** 2026-03-13
**Core Value:** Marketing-Team kann Posts fuer Instagram und TikTok planen, erstellen und veroeffentlichen -- mit integrierter URL-Link-Automation

## v1 Requirements

### Authentication

- [x] **AUTH-01**: User can sign up and log in with email and password
- [x] **AUTH-02**: User session persists across browser refresh
- [x] **AUTH-03**: Admin can assign roles (Admin, Editor, Viewer) to users
- [x] **AUTH-04**: Editor can create and edit posts, Viewer has read-only access

### Channels

- [x] **CHAN-01**: Admin can connect an Instagram account via Late.dev
- [x] **CHAN-02**: Admin can connect a TikTok account via Late.dev
- [x] **CHAN-03**: User can see connection status and token health per channel
- [x] **CHAN-04**: System monitors token expiration and alerts before tokens expire

### Calendar

- [x] **CAL-01**: User can view posts in a monthly calendar grid
- [x] **CAL-02**: User can switch between month, week, and day views
- [x] **CAL-03**: User can drag and drop a post to reschedule it to a different date/time
- [x] **CAL-04**: User can filter calendar by channel, status, and campaign
- [x] **CAL-05**: Post cards show thumbnail, caption snippet, channel icon, and status badge
- [x] **CAL-06**: User can click a day to quick-add a new post

### Composer

- [x] **COMP-01**: User can write a caption with a character count per platform
- [x] **COMP-02**: User can override the caption per platform (e.g., shorter for TikTok)
- [x] **COMP-03**: User can attach images and videos from the Media Library
- [x] **COMP-04**: User can select target channels (Instagram, TikTok) for a post
- [x] **COMP-05**: User can see a live platform-specific preview that updates as they type
- [x] **COMP-06**: User can schedule a post for a specific date and time
- [x] **COMP-07**: User can assign a campaign tag to a post
- [x] **COMP-08**: User can insert a hashtag set with one click
- [x] **COMP-09**: User can add a first comment (Instagram strategy)

### Workflow

- [x] **WRKF-01**: Post has status lifecycle: Draft > In Review > Approved > Scheduled > Published
- [x] **WRKF-02**: User can submit a post for review
- [x] **WRKF-03**: Reviewer can approve or reject a post with an optional comment
- [x] **WRKF-04**: Approved posts can be scheduled for auto-publishing
- [ ] **WRKF-05**: System auto-publishes scheduled posts at the specified time via Late.dev
- [x] **WRKF-06**: Failed publications show error details and allow retry

### Media Library

- [x] **MEDIA-01**: User can upload images and videos via drag-and-drop or file picker
- [x] **MEDIA-02**: User can tag media assets with keywords
- [x] **MEDIA-03**: User can search and filter media by type, tags, and campaign
- [x] **MEDIA-04**: Media shows usage count (how many posts reference it)
- [x] **MEDIA-05**: System generates thumbnails for uploaded videos

### URL-Link-Automation

- [x] **LINK-01**: User can create a link with auto-generated UTM parameters
- [x] **LINK-02**: UTM source auto-fills from selected channel (instagram/tiktok)
- [x] **LINK-03**: UTM campaign auto-fills from post campaign tag
- [x] **LINK-04**: User can select from predefined UTM templates
- [x] **LINK-05**: System auto-generates a branded short link (link.hitschies.de/abc123)
- [ ] **LINK-06**: Short link redirects to full URL with UTM parameters (302 redirect)
- [ ] **LINK-07**: System tracks clicks on short links (count, device, referrer)
- [x] **LINK-08**: User can view all links in a central link library
- [x] **LINK-09**: Link library shows click count, associated posts, and campaign
- [ ] **LINK-10**: User can generate a QR code for any short link

### Link-in-Bio

- [ ] **BIO-01**: User can create a branded link-in-bio landing page
- [ ] **BIO-02**: User can add, remove, and reorder links via drag-and-drop
- [ ] **BIO-03**: When a post with "update bio" enabled publishes, the link auto-moves to position 1
- [ ] **BIO-04**: User can set link expiration dates (e.g., for Gewinnspiele)
- [ ] **BIO-05**: Link-in-bio page is publicly accessible at a branded URL

### Campaigns

- [x] **CAMP-01**: User can create campaigns with name, color, start/end date
- [x] **CAMP-02**: User can assign campaigns to posts
- [x] **CAMP-03**: Calendar shows campaign colors on post cards

### Hashtags

- [x] **HASH-01**: User can create named hashtag sets (e.g., "hitschies Standard", "Karneval")
- [x] **HASH-02**: User can insert a hashtag set into a post caption with one click
- [x] **HASH-03**: Hashtag sets can be categorized (brand, product, campaign)

### Ideas Board

- [x] **IDEA-01**: User can create content ideas with title and description
- [x] **IDEA-02**: Kanban board with 4 columns: Idee, In Bearbeitung, Bereit, Geplant
- [x] **IDEA-03**: User can drag ideas between columns
- [x] **IDEA-04**: User can promote an idea to a full post in the Composer

### Brand & UX

- [x] **UX-01**: App shell with collapsible sidebar navigation (hitschies branding)
- [ ] **UX-02**: Keyboard shortcuts for common actions (N=new post, K=calendar, etc.)
- [ ] **UX-03**: Responsive layout functional on tablet and mobile
- [x] **UX-04**: hitschies design tokens applied (Magenta primary, brand typography)
- [ ] **UX-05**: Empty states with hitschies personality (branded illustrations/messages)
- [ ] **UX-06**: Confetti animation when a post is published

## v2 Requirements

### AI & Intelligence

- **AI-01**: Claude API generates caption suggestions based on media and campaign
- **AI-02**: AI-generated hashtag recommendations
- **AI-03**: Best-time-to-post heatmap based on historical engagement data

### Analytics

- **ANLY-01**: Post performance dashboard with data from Microsoft Fabric
- **ANLY-02**: Link click analytics with charts (clicks over time, device breakdown)

### Extended Channels

- **EXCHAN-01**: Facebook page publishing via Late.dev
- **EXCHAN-02**: LinkedIn company page publishing via Late.dev
- **EXCHAN-03**: YouTube video upload scheduling

### Advanced Workflow

- **ADVWF-01**: Multi-level approval workflows with email notifications
- **ADVWF-02**: Content recycling (auto-repost evergreen content)

### Polish

- **POLISH-01**: Dark mode
- **POLISH-02**: Microsoft SSO login
- **POLISH-03**: Broken-link detection in link library

## Out of Scope

| Feature | Reason |
|---------|--------|
| Inbox / Community Management | Meta Business Suite handles comments/DMs already |
| Social Listening / Monitoring | n8n Trend Scout covers this |
| Competitor Analysis | Not core for content planning team |
| Influencer Management | Separate domain, use dedicated tools |
| Ad Management | Meta Ads Manager is free and purpose-built |
| Native Mobile App | Responsive web app sufficient for 3-5 internal users |
| Real-time Chat | Not needed for internal tool |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Complete |
| AUTH-02 | Phase 1 | Complete |
| AUTH-03 | Phase 1 | Complete |
| AUTH-04 | Phase 1 | Complete |
| UX-01 | Phase 1 | Complete |
| UX-04 | Phase 1 | Complete |
| CHAN-01 | Phase 2 | Complete |
| CHAN-02 | Phase 2 | Complete |
| CHAN-03 | Phase 2 | Complete |
| CHAN-04 | Phase 2 | Complete |
| CAMP-01 | Phase 2 | Complete |
| CAMP-02 | Phase 2 | Complete |
| HASH-01 | Phase 2 | Complete |
| HASH-02 | Phase 2 | Complete |
| HASH-03 | Phase 2 | Complete |
| MEDIA-01 | Phase 2 | Complete |
| MEDIA-02 | Phase 2 | Complete |
| MEDIA-03 | Phase 2 | Complete |
| MEDIA-04 | Phase 2 | Complete |
| MEDIA-05 | Phase 2 | Complete |
| COMP-01 | Phase 3 | Complete |
| COMP-02 | Phase 3 | Complete |
| COMP-03 | Phase 3 | Complete |
| COMP-04 | Phase 3 | Complete |
| COMP-05 | Phase 3 | Complete |
| COMP-06 | Phase 3 | Complete |
| COMP-07 | Phase 3 | Complete |
| COMP-08 | Phase 3 | Complete |
| COMP-09 | Phase 3 | Complete |
| LINK-01 | Phase 3 | Complete |
| LINK-02 | Phase 3 | Complete |
| LINK-03 | Phase 3 | Complete |
| LINK-04 | Phase 3 | Complete |
| LINK-05 | Phase 3 | Complete |
| LINK-06 | Phase 5 | Pending |
| LINK-07 | Phase 5 | Pending |
| LINK-08 | Phase 3 | Complete |
| LINK-09 | Phase 3 | Complete |
| CAMP-03 | Phase 3 | Complete |
| CAL-01 | Phase 4 | Complete |
| CAL-02 | Phase 4 | Complete |
| CAL-03 | Phase 4 | Complete |
| CAL-04 | Phase 4 | Complete |
| CAL-05 | Phase 4 | Complete |
| CAL-06 | Phase 4 | Complete |
| IDEA-01 | Phase 4 | Complete |
| IDEA-02 | Phase 4 | Complete |
| IDEA-03 | Phase 4 | Complete |
| IDEA-04 | Phase 4 | Complete |
| WRKF-01 | Phase 5 | Complete |
| WRKF-02 | Phase 5 | Complete |
| WRKF-03 | Phase 5 | Complete |
| WRKF-04 | Phase 5 | Complete |
| WRKF-05 | Phase 5 | Pending |
| WRKF-06 | Phase 5 | Complete |
| BIO-01 | Phase 5 | Pending |
| BIO-02 | Phase 5 | Pending |
| BIO-03 | Phase 5 | Pending |
| BIO-04 | Phase 5 | Pending |
| BIO-05 | Phase 5 | Pending |
| UX-02 | Phase 6 | Pending |
| UX-03 | Phase 6 | Pending |
| UX-05 | Phase 6 | Pending |
| UX-06 | Phase 6 | Pending |
| LINK-10 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 50 total
- Mapped to phases: 50
- Unmapped: 0

---
*Requirements defined: 2026-03-13*
*Last updated: 2026-03-13 after roadmap creation*
