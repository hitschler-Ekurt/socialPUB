# Phase 3: Post Composer and Link Engine - Research

**Researched:** 2026-03-13
**Domain:** Post composition UI, platform previews, UTM link engine, short-link generation
**Confidence:** HIGH

## Summary

Phase 3 builds the core content creation experience: a multi-platform post composer with per-platform caption overrides, live previews, media attachment from the existing library, scheduling, and an integrated URL-Link-Automation engine (UTM builder, branded short links at link.hitschies.de, link library with click tracking).

The database schema (001_initial_schema.sql) already defines all required tables: `posts`, `post_channels`, `post_media`, `links`, `link_clicks`, and `utm_templates` -- with triggers for short-code generation, full URL building with UTM params, and click-count incrementing. RLS policies are also in place. However, the TypeScript types file (`src/lib/supabase/types.ts`) is significantly out of sync with the actual schema -- the `posts` table type uses placeholder fields (`title`, `body`, `status` as string) instead of the real schema (`caption`, `caption_overrides`, `post_type` enum, `hashtags`, `first_comment`, `link_id`, etc.), and tables `post_channels`, `post_media`, `link_clicks`, `utm_templates` are entirely missing from the types file.

The established project patterns (TanStack Query hooks, Zod validation, Next.js API routes with Supabase server client, shadcn/ui components) should be extended directly. No new libraries are needed -- the existing stack (date-fns for dates, zod for validation, zustand for local UI state) covers all requirements.

**Primary recommendation:** Update TypeScript database types first (Wave 0 task), then build the composer as a multi-step form with Zustand for draft state, followed by the link engine as a composable sub-feature within the composer and as a standalone library page.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| COMP-01 | Caption with character count per platform | Platform limits researched: Instagram 2,200 chars, TikTok 4,000 chars. Use simple counter component. |
| COMP-02 | Override caption per platform | DB schema already has `caption_overrides JSONB` field on posts table. Store as `{ instagram?: string, tiktok?: string }`. |
| COMP-03 | Attach media from library | `post_media` junction table exists with position ordering. Reuse existing media grid component in picker mode. |
| COMP-04 | Select target channels | `post_channels` junction table exists. Reuse channel data from existing hooks. |
| COMP-05 | Live platform-specific preview | CSS mockup of Instagram feed card and TikTok feed card. Update on caption change via controlled state. |
| COMP-06 | Schedule for specific date/time | `scheduled_at TIMESTAMPTZ` field exists. Use shadcn calendar + time input with date-fns. |
| COMP-07 | Assign campaign tag | `campaign_id UUID` FK exists on posts. Reuse `useCampaigns()` hook with Select component. |
| COMP-08 | Insert hashtag set with one click | `hashtags TEXT[]` field exists. Reuse `useHashtagSets()` hook. Append to caption text on click. |
| COMP-09 | First comment (Instagram strategy) | `first_comment TEXT` field exists on posts table. Simple textarea in composer. |
| LINK-01 | Create link with auto-generated UTM | `links` table with UTM fields exists. `build_full_url()` trigger auto-computes `full_url`. |
| LINK-02 | UTM source auto-fills from channel | Map channel platform name to utm_source in the UI (instagram/tiktok). |
| LINK-03 | UTM campaign auto-fills from campaign tag | Map selected campaign slug to utm_campaign in the UI. |
| LINK-04 | Select from predefined UTM templates | `utm_templates` table exists. Build CRUD API + template selector dropdown. |
| LINK-05 | Auto-generate branded short link | `generate_short_code()` trigger and `short_url` generated column exist. Domain: link.hitschies.de. |
| LINK-06 | Short link 302 redirect | Redirect service is Phase 5 (05-03). This phase creates the link records; redirect is out of scope. |
| LINK-07 | Track clicks on short links | `link_clicks` table + `increment_link_clicks()` trigger exist. Click tracking API is Phase 5. |
| LINK-08 | View all links in link library | New page at `/links` replacing ComingSoon placeholder. Standard list/table UI. |
| LINK-09 | Link library shows click count, posts, campaign | Join links with posts (via `link_id`) and campaigns (via `campaign_id`). |
| CAMP-03 | Calendar shows campaign colors on post cards | Post data must include campaign with color. This is prep work -- calendar is Phase 4. |
</phase_requirements>

## Standard Stack

### Core (already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.1.6 | App framework, API routes | Already in use |
| @tanstack/react-query | 5.90.21 | Server state management | Established pattern for all data fetching |
| zod | 4.3.6 | Request/form validation | Used in all existing API routes |
| date-fns | 4.1.0 | Date formatting and manipulation | Already installed, used for scheduling |
| zustand | 5.0.11 | Client-side UI state | Used for sidebar; extend for composer draft state |
| shadcn/ui | 4.0.6 | UI component library | Base for all UI components |
| sonner | 2.0.7 | Toast notifications | Established pattern |
| lucide-react | 0.577.0 | Icons | Established pattern |

### Supporting (no new installs needed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| date-fns | 4.1.0 | Schedule date/time formatting, timezone display | Scheduling picker, date display |
| clsx + tailwind-merge | existing | Conditional class names | All components |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Zustand for composer state | React useState | Zustand is better -- composer state is complex (multiple sections, draft persistence) and Zustand persist middleware can save drafts to localStorage |
| Custom date-time picker | react-datepicker or react-day-picker | Not needed -- shadcn Calendar + native time input is simpler and already fits the design system |
| nanoid for short codes | DB trigger (generate_short_code) | DB trigger already handles this -- no client-side generation needed |

**Installation:**
```bash
# No new packages needed -- everything is already in package.json
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── (auth)/
│   │   ├── composer/
│   │   │   └── page.tsx              # Post composer page
│   │   └── links/
│   │       └── page.tsx              # Link library page
│   └── api/
│       ├── posts/
│       │   ├── route.ts              # GET (list), POST (create)
│       │   └── [id]/
│       │       └── route.ts          # GET, PATCH, DELETE
│       ├── links/
│       │   ├── route.ts              # GET (list), POST (create)
│       │   └── [id]/
│       │       └── route.ts          # GET, PATCH, DELETE
│       └── utm-templates/
│           ├── route.ts              # GET (list), POST (create)
│           └── [id]/
│               └── route.ts          # GET, PATCH, DELETE
├── components/
│   ├── composer/
│   │   ├── composer-form.tsx          # Main composer form container
│   │   ├── caption-editor.tsx         # Caption textarea with char count
│   │   ├── platform-override.tsx      # Per-platform caption override tabs
│   │   ├── channel-selector.tsx       # Multi-select for target channels
│   │   ├── media-picker.tsx           # Media selection from library
│   │   ├── schedule-picker.tsx        # Date/time scheduling
│   │   ├── campaign-picker.tsx        # Campaign select dropdown
│   │   ├── hashtag-inserter.tsx       # Hashtag set quick-insert
│   │   ├── first-comment-input.tsx    # Instagram first comment
│   │   └── platform-preview.tsx       # Live preview panel
│   ├── links/
│   │   ├── link-table.tsx             # Link library table
│   │   ├── link-dialog.tsx            # Create/edit link dialog
│   │   ├── utm-builder.tsx            # UTM parameter builder form
│   │   └── utm-template-select.tsx    # UTM template dropdown
│   └── previews/
│       ├── instagram-preview.tsx      # Instagram feed post mockup
│       └── tiktok-preview.tsx         # TikTok feed post mockup
├── hooks/
│   ├── use-posts.ts                   # CRUD hooks for posts
│   ├── use-links.ts                   # CRUD hooks for links
│   └── use-utm-templates.ts           # CRUD hooks for UTM templates
├── lib/
│   └── validations/
│       ├── post.ts                    # Post Zod schemas
│       ├── link.ts                    # Link Zod schemas
│       └── utm-template.ts            # UTM template Zod schemas
└── stores/
    └── composer-store.ts              # Zustand store for composer draft state
```

### Pattern 1: Composer Form with Zustand Draft State
**What:** Use Zustand with persist middleware to maintain composer state across page navigations and browser refreshes. The composer is a single page with sections, not a multi-step wizard.
**When to use:** Complex forms with many interdependent fields that benefit from local persistence.
**Example:**
```typescript
// src/stores/composer-store.ts
import { create } from "zustand"
import { persist } from "zustand/middleware"

type ComposerState = {
  caption: string
  captionOverrides: Record<string, string>  // { instagram?: string, tiktok?: string }
  selectedChannelIds: string[]
  selectedMediaIds: string[]
  campaignId: string | null
  hashtags: string[]
  firstComment: string
  scheduledAt: string | null
  postType: "image" | "video" | "carousel" | "text" | "story" | "reel"
  linkId: string | null
}

type ComposerActions = {
  setCaption: (caption: string) => void
  setCaptionOverride: (platform: string, caption: string) => void
  toggleChannel: (channelId: string) => void
  // ... more actions
  reset: () => void
}

const initialState: ComposerState = {
  caption: "",
  captionOverrides: {},
  selectedChannelIds: [],
  selectedMediaIds: [],
  campaignId: null,
  hashtags: [],
  firstComment: "",
  scheduledAt: null,
  postType: "image",
  linkId: null,
}

export const useComposerStore = create<ComposerState & ComposerActions>()(
  persist(
    (set) => ({
      ...initialState,
      setCaption: (caption) => set({ caption }),
      setCaptionOverride: (platform, caption) =>
        set((state) => ({
          captionOverrides: { ...state.captionOverrides, [platform]: caption },
        })),
      toggleChannel: (channelId) =>
        set((state) => ({
          selectedChannelIds: state.selectedChannelIds.includes(channelId)
            ? state.selectedChannelIds.filter((id) => id !== channelId)
            : [...state.selectedChannelIds, channelId],
        })),
      reset: () => set(initialState),
    }),
    { name: "hitschies-composer" }
  )
)
```

### Pattern 2: API Route with Multi-Table Insert (Post Creation)
**What:** Post creation requires inserting into `posts`, `post_channels`, and `post_media` in a single transaction-like flow.
**When to use:** When creating an entity with junction table relationships.
**Example:**
```typescript
// In API route: Create post then insert junction records
const { data: post, error: postError } = await supabase
  .from("posts")
  .insert({
    caption: parsed.data.caption,
    caption_overrides: parsed.data.captionOverrides,
    post_type: parsed.data.postType,
    hashtags: parsed.data.hashtags,
    first_comment: parsed.data.firstComment,
    scheduled_at: parsed.data.scheduledAt,
    campaign_id: parsed.data.campaignId,
    link_id: parsed.data.linkId,
    status: parsed.data.scheduledAt ? "scheduled" : "draft",
    created_by: user.id,
  })
  .select()
  .single()

// Insert channel associations
if (parsed.data.channelIds.length > 0) {
  await supabase.from("post_channels").insert(
    parsed.data.channelIds.map((channelId) => ({
      post_id: post.id,
      channel_id: channelId,
    }))
  )
}

// Insert media associations with position
if (parsed.data.mediaIds.length > 0) {
  await supabase.from("post_media").insert(
    parsed.data.mediaIds.map((mediaId, index) => ({
      post_id: post.id,
      media_id: mediaId,
      position: index,
    }))
  )
}
```

### Pattern 3: Platform Preview Component
**What:** CSS-only mockup of platform feed cards (no iframe, no API). Updates reactively from composer state.
**When to use:** Live preview that mirrors what the post will look like.
**Example:**
```typescript
// Instagram preview: 375px wide container mimicking phone screen
// - Profile header (avatar, name, "...")
// - Image area (4:5 aspect ratio, max 1080x1350)
// - Action row (heart, comment, share, bookmark icons)
// - Caption area with "more" truncation at 125 chars
// - Hashtags below caption

// TikTok preview: 375px wide, 9:16 aspect ratio
// - Video/image fills screen
// - Caption overlay at bottom with @ username
// - Right sidebar with profile, heart, comment, share icons
```

### Anti-Patterns to Avoid
- **Putting all composer logic in a single component:** Split into focused sub-components (caption, media, channels, schedule, preview). The composer-form.tsx orchestrates, sub-components read from Zustand store.
- **Fetching related data inside the API route handler:** Do NOT fetch channels/campaigns in the post GET endpoint. Let the client compose data from separate query hooks (usePosts + useCampaigns + useChannels).
- **Building UTM URL on the client:** The DB trigger `build_full_url()` handles this. Just pass the UTM params and original URL; the trigger computes `full_url`.
- **Custom short code generation in JS:** The DB trigger `generate_short_code()` handles this. Just insert into `links` without a short_code and the trigger fills it in.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Short code generation | Custom JS nanoid | DB trigger `generate_short_code()` | Already exists, handles uniqueness at DB level |
| Full URL with UTM params | URL builder utility | DB trigger `build_full_url()` | Already exists, auto-runs on insert/update |
| Click count increment | Manual count update | DB trigger `increment_link_clicks()` | Already exists, atomic increment via trigger |
| Date/time formatting | Custom formatters | date-fns `format()`, `formatDistanceToNow()` | Already installed, handles i18n |
| Form state persistence | Custom localStorage logic | Zustand persist middleware | Already in use for sidebar state |
| Multi-select UI | Custom checkbox list | shadcn Checkbox + controlled state | Simpler, accessible |

**Key insight:** The database schema was designed with automation in mind -- three triggers handle the most error-prone link operations (short codes, UTM URLs, click counts). The application layer should insert raw data and let the DB do the work.

## Common Pitfalls

### Pitfall 1: TypeScript Types Out of Sync with DB Schema
**What goes wrong:** The current `src/lib/supabase/types.ts` has a simplified `posts` table (with `title`, `body`, `status` as string) that does not match the actual schema (which has `caption`, `caption_overrides`, `post_type` enum, `hashtags`, `first_comment`, `link_id`, etc.). Tables `post_channels`, `post_media`, `link_clicks`, `utm_templates` are entirely missing.
**Why it happens:** Types were manually defined as placeholders in Phase 1.
**How to avoid:** Update the types file to match the actual schema BEFORE writing any composer or link code. This is a Wave 0 prerequisite.
**Warning signs:** TypeScript errors on fields that exist in the DB but not in types.

### Pitfall 2: caption_overrides JSONB Structure
**What goes wrong:** No Zod schema validates the JSONB structure, leading to inconsistent data.
**Why it happens:** JSONB columns are loosely typed by default.
**How to avoid:** Define a strict Zod schema: `z.record(z.enum(["instagram", "tiktok"]), z.string().max(4000))`. Validate both on insert and when reading.
**Warning signs:** Platform-specific captions silently lost or malformed.

### Pitfall 3: Character Count with Hashtags
**What goes wrong:** Character count shows caption length but doesn't account for appended hashtags, causing posts to exceed platform limits.
**Why it happens:** Hashtags are stored separately in `hashtags TEXT[]` but get appended to the caption when published.
**How to avoid:** The preview and character counter must show `caption + "\n\n" + hashtags.join(" ")` as the true post length. Display both "caption only" and "total with hashtags" counts.
**Warning signs:** Published posts get truncated by the platform API.

### Pitfall 4: Scheduling Timezone Confusion
**What goes wrong:** User schedules for 14:00 CET but post publishes at 14:00 UTC (1 hour early).
**Why it happens:** `scheduled_at` is TIMESTAMPTZ but the UI picker may send a naive datetime.
**How to avoid:** Always send ISO 8601 with timezone offset from the client. Display times in the user's local timezone. The DB stores UTC internally.
**Warning signs:** Posts publishing at unexpected times.

### Pitfall 5: Generated Column short_url Cannot Be Inserted
**What goes wrong:** Supabase/Postgres rejects INSERT if you include `short_url` in the payload.
**Why it happens:** `short_url` is a `GENERATED ALWAYS AS` stored column -- it cannot be set manually.
**How to avoid:** Never include `short_url` in INSERT or UPDATE payloads. Only include `original_url` and optionally `short_code`; `short_url` and `full_url` are auto-computed.
**Warning signs:** "column short_url cannot be used in this context" error.

### Pitfall 6: Multi-Table Post Creation Without Transaction
**What goes wrong:** Post is created but post_channels or post_media insert fails, leaving orphaned data.
**Why it happens:** Supabase JS client doesn't have built-in transaction support across multiple table operations.
**How to avoid:** Use Supabase's `rpc()` to call a PostgreSQL function that wraps all inserts in a transaction, OR accept eventual consistency and handle partial failures gracefully (delete the post if junction inserts fail).
**Warning signs:** Posts without channels or media despite user having selected them.

## Code Examples

### Character Counter with Platform Limits
```typescript
// src/lib/constants/platform-limits.ts
export const PLATFORM_CHAR_LIMITS = {
  instagram: {
    caption: 2200,
    previewCutoff: 125,  // "...more" appears after this
    hashtags: 30,         // max number of hashtags
  },
  tiktok: {
    caption: 4000,
    previewCutoff: 150,
    hashtags: 100,
  },
} as const

export type Platform = keyof typeof PLATFORM_CHAR_LIMITS
```

### Caption Editor with Character Count
```typescript
// Pattern for the caption editor component
function CaptionEditor({ platform }: { platform: Platform }) {
  const caption = useComposerStore((s) => s.caption)
  const override = useComposerStore((s) => s.captionOverrides[platform])
  const hashtags = useComposerStore((s) => s.hashtags)
  const setCaption = useComposerStore((s) => s.setCaption)

  const effectiveCaption = override ?? caption
  const hashtagText = hashtags.length > 0 ? "\n\n" + hashtags.join(" ") : ""
  const totalLength = effectiveCaption.length + hashtagText.length
  const limit = PLATFORM_CHAR_LIMITS[platform].caption
  const isOver = totalLength > limit

  return (
    <div>
      <Textarea
        value={effectiveCaption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder="Caption schreiben..."
      />
      <div className={isOver ? "text-red-500" : "text-neutral-400"}>
        {totalLength} / {limit}
      </div>
    </div>
  )
}
```

### UTM Builder Auto-Fill from Context
```typescript
// When channel and campaign are selected, auto-fill UTM fields
function buildUtmDefaults(
  channel: { platform: string } | null,
  campaign: { slug: string } | null
): Partial<LinkInsert> {
  return {
    utm_source: channel?.platform ?? undefined,    // "instagram" or "tiktok"
    utm_medium: "social",                           // default
    utm_campaign: campaign?.slug ?? undefined,       // e.g., "karneval-2026"
  }
}
```

### Link Creation (let DB triggers handle short_code and full_url)
```typescript
// API route: POST /api/links
const { data: link, error } = await supabase
  .from("links")
  .insert({
    original_url: parsed.data.originalUrl,
    // short_code: omit -- trigger generates it
    // short_url: omit -- generated column
    // full_url: omit -- trigger builds it
    utm_source: parsed.data.utmSource,
    utm_medium: parsed.data.utmMedium ?? "social",
    utm_campaign: parsed.data.utmCampaign,
    utm_content: parsed.data.utmContent,
    campaign_id: parsed.data.campaignId,
    title: parsed.data.title,
    created_by: user.id,
  })
  .select()
  .single()
// link.short_url is auto-populated: "https://link.hitschies.de/abc123"
// link.full_url is auto-populated: "https://hitschies.de?utm_source=instagram&utm_medium=social&..."
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Instagram 1:1 square grid | 3:4 portrait grid (1015x1350) | Early 2025 | Preview component should use 4:5 aspect ratio, not square |
| TikTok 2,200 char limit | TikTok 4,000 char limit | 2024 | Higher character limit for TikTok descriptions |
| Manual short code (nanoid) | DB trigger auto-generation | Schema design | No client-side short code generation needed |

**Deprecated/outdated:**
- Instagram square (1:1) as primary format -- 4:5 portrait is now recommended
- The existing `posts` TypeScript type with `title`/`body` fields -- must be replaced with actual schema fields

## Open Questions

1. **link.hitschies.de DNS Configuration**
   - What we know: The short link domain is `link.hitschies.de` (generated column in DB). STATE.md flags this as a blocker.
   - What's unclear: Whether DNS is configured yet. Phase 3 creates the link records; Phase 5 (05-03) deploys the redirect service.
   - Recommendation: Phase 3 can proceed without DNS being ready. Links are created in the DB with the correct short_url. The redirect service (separate Vercel project) is Phase 5 scope.

2. **LINK-06 and LINK-07 Scope Boundary**
   - What we know: LINK-06 (302 redirect) and LINK-07 (click tracking) require a running redirect service.
   - What's unclear: Whether any redirect/tracking functionality should be built in Phase 3.
   - Recommendation: Phase 3 creates all link records and the link library UI. The actual redirect service and click tracking endpoint are Phase 5 (05-03). Phase 3 should create the `link_clicks` table type and show existing click_count data, but the tracking API is not in scope.

3. **Post Save vs. Post Publish Flow**
   - What we know: Posts start as `draft`. Phase 5 handles the full workflow (review, approve, publish).
   - What's unclear: Should Phase 3 support "Save as Draft" + "Schedule" only, or also "Publish Now"?
   - Recommendation: Phase 3 supports "Save as Draft" and "Schedule" (sets `scheduled_at`, status becomes `scheduled`). "Publish Now" requires the Late.dev publishing pipeline from Phase 5.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 + Testing Library |
| Config file | `vitest.config.ts` |
| Quick run command | `npm test -- --reporter=verbose` |
| Full suite command | `npm test -- --coverage` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| COMP-01 | Caption char count displays correctly per platform | unit | `npx vitest run src/__tests__/components/composer/caption-editor.test.tsx -t "char count"` | No - Wave 0 |
| COMP-02 | Caption override stored per platform | unit | `npx vitest run src/__tests__/components/composer/platform-override.test.tsx` | No - Wave 0 |
| COMP-03 | Media picker returns selected media IDs | unit | `npx vitest run src/__tests__/components/composer/media-picker.test.tsx` | No - Wave 0 |
| COMP-04 | Channel selector toggles channels | unit | `npx vitest run src/__tests__/components/composer/channel-selector.test.tsx` | No - Wave 0 |
| COMP-05 | Preview updates on caption change | unit | `npx vitest run src/__tests__/components/previews/instagram-preview.test.tsx` | No - Wave 0 |
| COMP-06 | Schedule picker sets date/time | unit | `npx vitest run src/__tests__/components/composer/schedule-picker.test.tsx` | No - Wave 0 |
| COMP-07 | Campaign picker sets campaign_id | unit | `npx vitest run src/__tests__/components/composer/campaign-picker.test.tsx` | No - Wave 0 |
| COMP-08 | Hashtag set inserts hashtags | unit | `npx vitest run src/__tests__/components/composer/hashtag-inserter.test.tsx` | No - Wave 0 |
| COMP-09 | First comment input stored | unit | `npx vitest run src/__tests__/components/composer/first-comment-input.test.tsx` | No - Wave 0 |
| LINK-01 | Link created with UTM params | integration | `npx vitest run src/__tests__/api/links.test.ts` | No - Wave 0 |
| LINK-02 | UTM source auto-fills from channel | unit | `npx vitest run src/__tests__/components/links/utm-builder.test.tsx -t "auto-fill source"` | No - Wave 0 |
| LINK-03 | UTM campaign auto-fills from campaign | unit | `npx vitest run src/__tests__/components/links/utm-builder.test.tsx -t "auto-fill campaign"` | No - Wave 0 |
| LINK-04 | UTM template populates fields | unit | `npx vitest run src/__tests__/components/links/utm-template-select.test.tsx` | No - Wave 0 |
| LINK-05 | Short link auto-generated | integration | `npx vitest run src/__tests__/api/links.test.ts -t "short link"` | No - Wave 0 |
| LINK-08 | Link library displays links | unit | `npx vitest run src/__tests__/components/links/link-table.test.tsx` | No - Wave 0 |
| LINK-09 | Link library shows click count and campaign | unit | `npx vitest run src/__tests__/components/links/link-table.test.tsx -t "click count"` | No - Wave 0 |
| CAMP-03 | Post data includes campaign color | integration | `npx vitest run src/__tests__/api/posts.test.ts -t "campaign"` | No - Wave 0 |

### Sampling Rate
- **Per task commit:** `npm test -- --reporter=verbose`
- **Per wave merge:** `npm test -- --coverage`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] Update `src/lib/supabase/types.ts` with full `posts`, `post_channels`, `post_media`, `links`, `link_clicks`, `utm_templates` table types
- [ ] `src/__tests__/api/posts.test.ts` -- covers post CRUD API
- [ ] `src/__tests__/api/links.test.ts` -- covers link CRUD API
- [ ] `src/__tests__/components/composer/` directory -- composer component tests
- [ ] `src/__tests__/components/links/` directory -- link component tests
- [ ] `src/__tests__/components/previews/` directory -- preview component tests
- [ ] `src/lib/validations/post.ts` -- Zod schemas for post creation/update
- [ ] `src/lib/validations/link.ts` -- Zod schemas for link creation/update
- [ ] `src/lib/validations/utm-template.ts` -- Zod schemas for UTM templates

## Sources

### Primary (HIGH confidence)
- `supabase/migrations/001_initial_schema.sql` -- actual DB schema with posts, links, post_channels, post_media, link_clicks, utm_templates tables and triggers
- `supabase/migrations/002_rls_policies.sql` -- RLS policies for all tables
- `src/lib/supabase/types.ts` -- current TypeScript types (out of sync with schema)
- Existing codebase patterns: `src/hooks/use-campaigns.ts`, `src/app/api/campaigns/route.ts` -- established TanStack Query + API route patterns

### Secondary (MEDIUM confidence)
- [Outfy - Instagram Character Limit 2026](https://www.outfy.com/blog/instagram-character-limit/) -- Instagram 2,200 char limit confirmed
- [Buffer - Instagram Image Size Guide 2025](https://buffer.com/resources/instagram-image-size/) -- 4:5 aspect ratio, 1080x1350 dimensions
- [TikTok Character Limit](https://www.wordtracker.com/blog/seo/tiktok-increases-video-description-limit-to-2200-characters/) -- TikTok caption expanded to 4,000 chars
- [shadcn Date Picker](https://ui.shadcn.com/docs/components/radix/date-picker) -- Date picker component pattern
- [nanoid GitHub](https://github.com/ai/nanoid) -- Short code generation reference (not needed since DB trigger handles it)

### Tertiary (LOW confidence)
- None -- all findings verified against codebase or official sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new libraries, extending established patterns
- Architecture: HIGH -- DB schema pre-exists, component patterns match Phase 2
- Pitfalls: HIGH -- identified from direct codebase analysis (types mismatch is concrete, not speculative)

**Research date:** 2026-03-13
**Valid until:** 2026-04-13 (stable -- no fast-moving dependencies)
