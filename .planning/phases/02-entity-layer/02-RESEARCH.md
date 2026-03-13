# Phase 2: Entity Layer - Research

**Researched:** 2026-03-13
**Domain:** CRUD entity management (channels, campaigns, hashtags, media) with OAuth integration and file uploads
**Confidence:** HIGH

## Summary

Phase 2 builds four entity management domains on top of an already-solid foundation. The database schema, RLS policies, Supabase clients, and UI component library (shadcn/ui) are all in place from Phase 1. The primary work is creating CRUD API routes, TanStack Query hooks for data fetching/mutation, and page-level UI components for each entity type.

The channel connection flow depends on Late.dev's unified OAuth API (`@getlatedev/node` SDK). Late.dev handles the platform-specific OAuth complexity -- the app redirects users to Late's auth URL, handles the callback, and stores the resulting account references. Token health monitoring uses Late.dev's health-check endpoint rather than manual token inspection.

The media library is the most complex domain: it requires Supabase Storage uploads (via signed URLs to bypass Next.js 1MB body limit), client-side video thumbnail generation using HTML5 Canvas, and a searchable/filterable grid with tags. TanStack Query (not yet installed) must be added as the server-state management layer, following patterns consistent with the existing Zustand client-state approach.

**Primary recommendation:** Install `@tanstack/react-query` and `@getlatedev/node`, build a thin data-access layer per entity using custom hooks, and use Next.js Route Handlers (not Server Actions) for mutations to maintain consistency with Phase 1 patterns.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Channel connection via modal wizard: pick platform > OAuth redirect to Late.dev > return showing success/error
- Channel list as card grid with platform icon, account name, avatar, status badge, last synced date
- Token health as colored status badge: green "Verbunden", yellow "Laeuft bald ab" (<7 days), red "Getrennt"
- Card actions via dropdown menu: "Neu verbinden" and "Trennen" -- admin-only
- Campaign color-coded cards with left border accent, name, date range, post count
- Campaign creation via inline modal dialog: name, color picker (8-10 preset colors), start/end date, optional description
- Campaigns and Hashtag-Sets on combined "Kampagnen" page with two tabs
- Hashtag sets as categorized list grouped by category (Brand, Produkt, Kampagne)
- Media library as thumbnail grid (Pinterest/Google Photos style) with filter bar
- Upload via full-width drag-drop zone + "Hochladen" button, multi-file, inline progress
- Tagging happens after upload in detail view -- no friction during upload
- Bulk operations: checkbox on hover, toolbar for "Tags hinzufuegen", "Loeschen"
- All entity pages share consistent shell: page title + description, action button top-right, filter bar
- Empty states: branded with hitschies-themed icon, friendly German message, primary CTA
- All CRUD via Dialog modals, confirmation dialogs for delete
- Role-based: Viewers see data but action buttons hidden; RLS enforces server-side

### Claude's Discretion
- Exact color palette choices for campaign color picker
- Media detail panel layout (side panel vs full modal)
- Filter component design and interaction patterns
- Loading states and skeleton patterns for grids/lists
- Exact empty state illustration/icon choices
- Pagination vs infinite scroll for media grid (likely pagination given Supabase)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CHAN-01 | Admin can connect Instagram account via Late.dev | Late.dev OAuth flow via `GET /v1/connect/instagram`, callback handler, `@getlatedev/node` SDK |
| CHAN-02 | Admin can connect TikTok account via Late.dev | Same Late.dev flow with `GET /v1/connect/tiktok` |
| CHAN-03 | User can see connection status and token health per channel | Late.dev `GET /v1/accounts/get-all-accounts-health` endpoint, status badge mapping |
| CHAN-04 | System monitors token expiration and alerts | Cron-based or on-load health check, Sonner toast for expiring tokens |
| CAMP-01 | User can create campaigns with name, color, start/end date | Standard CRUD against `campaigns` table, Zod validation, slug generation |
| CAMP-02 | User can assign campaigns to posts | Campaign selector component (used in Phase 3), campaigns query hook |
| HASH-01 | User can create named hashtag sets | CRUD against `hashtag_sets` table, text[] array for hashtags |
| HASH-02 | User can insert hashtag set into post caption with one click | Hashtag set list with copy/insert action (UI built here, wired in Phase 3) |
| HASH-03 | Hashtag sets can be categorized | Category field on `hashtag_sets`, grouped list UI |
| MEDIA-01 | User can upload images/videos via drag-and-drop | Supabase Storage signed URLs, drag-drop zone component, multi-file upload |
| MEDIA-02 | User can tag media assets | Tags array on `media` table, tag editor in detail panel |
| MEDIA-03 | User can search/filter media by type, tags, campaign | GIN index on tags[], filter bar with type/tag/search inputs |
| MEDIA-04 | Media shows usage count | `usage_count` column on media table, displayed in grid/detail |
| MEDIA-05 | System generates thumbnails for uploaded videos | Client-side Canvas thumbnail extraction, stored in Supabase Storage |
</phase_requirements>

## Standard Stack

### Core (to install)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @tanstack/react-query | ^5 | Server state management | Mentioned as established pattern in CONTEXT.md; caching, mutations, optimistic updates |
| @getlatedev/node | latest | Late.dev API SDK | Official SDK for channel OAuth and health checks |

### Already Installed
| Library | Version | Purpose |
|---------|---------|---------|
| @supabase/supabase-js | ^2.99.1 | Database and storage client |
| @supabase/ssr | ^0.9.0 | Server-side Supabase client |
| zod | ^4.3.6 | Request validation |
| zustand | ^5.0.11 | Client state (UI state only) |
| sonner | ^2.0.7 | Toast notifications |
| date-fns | ^4.1.0 | Date formatting/manipulation |
| lucide-react | ^0.577.0 | Icons |
| shadcn components | -- | Card, Dialog, Badge, Button, Input, Select, Tabs, Skeleton, Sheet, DropdownMenu, Tooltip |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| TanStack Query | SWR | TanStack has richer mutation/optimistic update support; SWR is simpler but less capable for CRUD-heavy pages |
| Signed URL uploads | Server Action uploads | Server Actions have 1MB default body limit; signed URLs support up to 5GB directly to Supabase Storage |
| Client-side video thumbnails | Server-side ffmpeg | Client-side avoids server compute costs and works for 3-5 user internal tool; ffmpeg would be overkill |

**Installation:**
```bash
npm install @tanstack/react-query @getlatedev/node
```

## Architecture Patterns

### Recommended Project Structure (Phase 2 additions)
```
src/
├── app/
│   ├── (auth)/
│   │   ├── campaigns/page.tsx          # Replace coming-soon with real page (tabs: Kampagnen | Hashtag-Sets)
│   │   ├── media/page.tsx              # Replace coming-soon with media library
│   │   └── channels/page.tsx           # NEW page for channel management
│   └── api/
│       ├── channels/
│       │   ├── route.ts                # GET list, POST create (via Late.dev)
│       │   ├── [id]/route.ts           # PATCH, DELETE
│       │   ├── connect/route.ts        # GET auth URL from Late.dev
│       │   ├── callback/route.ts       # POST handle OAuth callback
│       │   └── health/route.ts         # GET token health check
│       ├── campaigns/
│       │   ├── route.ts                # GET list, POST create
│       │   └── [id]/route.ts           # PATCH, DELETE
│       ├── hashtag-sets/
│       │   ├── route.ts                # GET list, POST create
│       │   └── [id]/route.ts           # PATCH, DELETE
│       └── media/
│           ├── route.ts                # GET list (with filters), POST metadata
│           ├── [id]/route.ts           # PATCH tags, DELETE
│           └── upload-url/route.ts     # POST get signed upload URL
├── components/
│   ├── channels/
│   │   ├── channel-card.tsx            # Single channel card with status badge
│   │   ├── channel-grid.tsx            # Grid of channel cards
│   │   ├── connect-channel-dialog.tsx  # Modal wizard for OAuth connection
│   │   └── channel-actions.tsx         # Dropdown menu (reconnect, disconnect)
│   ├── campaigns/
│   │   ├── campaign-card.tsx           # Color-coded campaign card
│   │   ├── campaign-grid.tsx           # Grid of campaign cards
│   │   └── campaign-dialog.tsx         # Create/edit modal
│   ├── hashtags/
│   │   ├── hashtag-set-item.tsx        # Single set row (expandable)
│   │   ├── hashtag-set-list.tsx        # Categorized grouped list
│   │   └── hashtag-set-dialog.tsx      # Create/edit modal
│   ├── media/
│   │   ├── media-grid.tsx              # Thumbnail grid
│   │   ├── media-card.tsx              # Single thumbnail with hover info
│   │   ├── media-upload-zone.tsx       # Drag-drop upload area
│   │   ├── media-detail-panel.tsx      # Detail view with tagging
│   │   ├── media-filter-bar.tsx        # Type/tag/search filters
│   │   └── media-bulk-toolbar.tsx      # Bulk actions toolbar
│   └── shared/
│       ├── entity-page-header.tsx      # Shared page title + description + action button
│       ├── empty-state.tsx             # Branded empty state (replaces coming-soon)
│       ├── confirm-dialog.tsx          # Reusable confirmation dialog
│       └── filter-bar.tsx              # Reusable filter bar pattern
├── hooks/
│   ├── use-channels.ts                 # TanStack Query hooks for channels
│   ├── use-campaigns.ts               # TanStack Query hooks for campaigns
│   ├── use-hashtag-sets.ts            # TanStack Query hooks for hashtag sets
│   └── use-media.ts                   # TanStack Query hooks for media
├── lib/
│   ├── late-dev/
│   │   └── client.ts                  # Late.dev SDK initialization
│   ├── queries/
│   │   └── query-client.ts            # TanStack QueryClient provider setup
│   └── validations/
│       ├── campaign.ts                # Zod schemas for campaigns
│       ├── hashtag-set.ts             # Zod schemas for hashtag sets
│       └── media.ts                   # Zod schemas for media
└── providers/
    └── query-provider.tsx             # TanStack QueryClientProvider wrapper
```

### Pattern 1: TanStack Query + Supabase CRUD Hook
**What:** Each entity gets a custom hook wrapping TanStack Query for list/create/update/delete
**When to use:** Every entity page

```typescript
// src/hooks/use-campaigns.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

const CAMPAIGNS_KEY = ["campaigns"] as const

export function useCampaigns() {
  return useQuery({
    queryKey: CAMPAIGNS_KEY,
    queryFn: async () => {
      const res = await fetch("/api/campaigns")
      if (!res.ok) throw new Error("Fehler beim Laden der Kampagnen")
      const json = await res.json()
      return json.data
    },
  })
}

export function useCreateCampaign() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateCampaignInput) => {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error ?? "Fehler beim Erstellen")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CAMPAIGNS_KEY })
    },
  })
}
```

### Pattern 2: API Route Handler with Zod + Role Check
**What:** Consistent API route structure following Phase 1 patterns
**When to use:** Every API endpoint

```typescript
// src/app/api/campaigns/route.ts
import { NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"

const createCampaignSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich"),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Ungueltige Farbe"),
  start_date: z.string().nullable().optional(),
  end_date: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
})

export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("campaigns")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  // Auth check via RLS -- insert will fail for viewers
  const body = await request.json()
  const parsed = createCampaignSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Ungueltige Eingabe", details: parsed.error.issues }, { status: 400 })
  }
  // Generate slug from name
  const slug = parsed.data.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from("campaigns")
    .insert({ ...parsed.data, slug, created_by: user?.id })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
```

### Pattern 3: Late.dev Channel OAuth Flow
**What:** Three-step OAuth: get auth URL, redirect user, handle callback
**When to use:** Channel connection wizard

```typescript
// Step 1: API route to get auth URL
// src/app/api/channels/connect/route.ts
import Late from "@getlatedev/node"

const late = new Late({ apiKey: process.env.LATE_API_KEY! })

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const platform = searchParams.get("platform") // "instagram" | "tiktok"
  // Late.dev returns an authUrl for the specified platform
  const result = await late.connect.getAuthUrl({ platform, profileId: "default" })
  return NextResponse.json({ authUrl: result.authUrl })
}

// Step 2: Frontend redirects user to authUrl
// Step 3: Late.dev redirects back with code, handle callback
// src/app/api/channels/callback/route.ts
export async function POST(request: Request) {
  const body = await request.json()
  // Exchange code via Late.dev SDK
  const result = await late.connect.handleOAuthCallback(body)
  // Store channel reference in Supabase channels table
  // ...
}
```

### Pattern 4: Signed URL Upload for Media
**What:** Generate signed upload URL server-side, upload directly from browser to Supabase Storage
**When to use:** Media library uploads

```typescript
// Server: generate signed upload URL
// src/app/api/media/upload-url/route.ts
export async function POST(request: Request) {
  const supabase = await createClient()
  const { fileName, contentType } = await request.json()
  const filePath = `uploads/${crypto.randomUUID()}/${fileName}`
  const { data, error } = await supabase.storage
    .from("media")
    .createSignedUploadUrl(filePath)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ uploadUrl: data.signedUrl, filePath, token: data.token })
}

// Client: upload file directly to storage
async function uploadFile(file: File) {
  // 1. Get signed URL
  const { uploadUrl, filePath, token } = await fetch("/api/media/upload-url", {
    method: "POST",
    body: JSON.stringify({ fileName: file.name, contentType: file.type }),
  }).then(r => r.json())
  // 2. Upload directly to Supabase Storage
  await fetch(uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } })
  // 3. Create media record in database
  await fetch("/api/media", {
    method: "POST",
    body: JSON.stringify({ file_name: file.name, file_path: filePath, file_size: file.size, mime_type: file.type }),
  })
}
```

### Pattern 5: Client-Side Video Thumbnail
**What:** Extract a frame from uploaded video using Canvas before/after upload
**When to use:** MEDIA-05 (video thumbnail generation)

```typescript
function generateVideoThumbnail(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video")
    video.preload = "metadata"
    video.muted = true
    video.src = URL.createObjectURL(file)
    video.onloadeddata = () => {
      video.currentTime = Math.min(1, video.duration * 0.25)
    }
    video.onseeked = () => {
      const canvas = document.createElement("canvas")
      canvas.width = 320 // thumbnail width
      canvas.height = Math.round((320 / video.videoWidth) * video.videoHeight)
      const ctx = canvas.getContext("2d")!
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      canvas.toBlob((blob) => {
        URL.revokeObjectURL(video.src)
        if (blob) resolve(blob)
        else reject(new Error("Thumbnail generation failed"))
      }, "image/jpeg", 0.8)
    }
    video.onerror = () => reject(new Error("Video load failed"))
  })
}
```

### Anti-Patterns to Avoid
- **Direct Supabase queries from client components:** Always go through API routes for mutations to maintain the Phase 1 pattern and centralize validation
- **Server Actions for file uploads:** Next.js body limit (1MB default) makes this impractical for media; use signed URLs instead
- **Storing Late.dev tokens in the client:** Keep `LATE_API_KEY` server-side only; channel tokens are stored in the `channels` table, never exposed to the browser
- **Skipping `.throwOnError()` in Supabase queries:** Without it, Supabase returns errors in the response instead of throwing, making TanStack Query error handling ineffective

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Social OAuth flows | Custom Instagram/TikTok OAuth | Late.dev SDK (`@getlatedev/node`) | Platform-specific OAuth is complex, token refresh varies, TikTok audit required |
| Token health monitoring | Manual token expiration tracking | Late.dev `get-all-accounts-health` endpoint | Late.dev tracks token status across platforms uniformly |
| File upload to cloud | Custom upload handlers | Supabase Storage `createSignedUploadUrl` | Handles resumable uploads, CDN, access control |
| Server state cache | Custom caching layer | TanStack Query | Stale-while-revalidate, cache invalidation, optimistic updates |
| Slug generation | Custom slug logic | Simple regex replace (2 lines) | Only campaigns need slugs; a library like `slugify` is overkill for one use |
| Color picker UI | Custom color input | Preset palette of 8-10 buttons | Users select from brand colors, not arbitrary hex values |
| Drag-and-drop file | Custom DnD file handler | Native HTML5 drag events + `onDrop` | No library needed for simple drop zone; `react-dropzone` adds unnecessary dependency for basic use case |

**Key insight:** Late.dev exists specifically to abstract away the Instagram/TikTok API complexity. Channels should store a Late.dev account reference (not raw platform tokens) and delegate all platform operations to Late.dev's API.

## Common Pitfalls

### Pitfall 1: Next.js Server Action Body Size Limit
**What goes wrong:** Using Server Actions for media upload silently fails or errors for files >1MB
**Why it happens:** Next.js defaults `serverActions.bodySizeLimit` to 1MB
**How to avoid:** Use signed upload URLs -- browser uploads directly to Supabase Storage, bypassing Next.js entirely
**Warning signs:** Upload works for small images but fails for larger photos or any video

### Pitfall 2: Supabase RLS Blocking Writes Silently
**What goes wrong:** Insert/update returns empty data with no error
**Why it happens:** RLS policies deny the operation but Supabase returns empty result instead of error
**How to avoid:** Always check `data` is not null after mutations; consider using `.throwOnError()` on Supabase queries
**Warning signs:** Operations "succeed" but no data appears in the table

### Pitfall 3: TanStack Query Not Catching Supabase Errors
**What goes wrong:** Error state never triggers despite database errors
**Why it happens:** Supabase returns `{ data: null, error: {...} }` instead of throwing
**How to avoid:** In queryFn, check for error and throw explicitly; or append `.throwOnError()` to Supabase calls
**Warning signs:** Loading spinner disappears, no data shows, no error message appears

### Pitfall 4: Missing `created_by` on Entity Creation
**What goes wrong:** RLS update/delete policies fail because `created_by` is null
**Why it happens:** Forgetting to set `created_by` field when inserting campaigns, hashtag sets, or media
**How to avoid:** Always call `supabase.auth.getUser()` and pass `user.id` as `created_by` in API routes
**Warning signs:** Admin can edit but editor cannot edit their own records

### Pitfall 5: Video Thumbnail Canvas CORS
**What goes wrong:** `canvas.toBlob()` returns null or throws security error
**Why it happens:** Video source from a different origin taints the canvas
**How to avoid:** Generate thumbnails from the local File object (`URL.createObjectURL`) BEFORE uploading, not from the Supabase Storage URL
**Warning signs:** Thumbnails work in development but fail in production

### Pitfall 6: Late.dev OAuth Callback URL Mismatch
**What goes wrong:** OAuth redirect fails or returns to wrong URL
**Why it happens:** Callback URL not configured in Late.dev dashboard, or environment differs between dev/prod
**How to avoid:** Configure callback URL in Late.dev dashboard; use environment variable for the callback URL
**Warning signs:** OAuth flow starts but never completes

### Pitfall 7: TypeScript Types Out of Sync with Database
**What goes wrong:** Type errors or runtime mismatches between TypeScript types and actual DB columns
**Why it happens:** The `types.ts` file was manually written in Phase 1 and is missing columns (e.g., `media` table lacks `media_type`, `tags`, `thumbnail_path`, `duration_seconds`, `usage_count`)
**How to avoid:** Update `src/lib/supabase/types.ts` to match the actual schema before building entity features. The `media` table type is incomplete.
**Warning signs:** TypeScript autocompletion missing fields that exist in the database

## Code Examples

### TanStack Query Provider Setup
```typescript
// src/providers/query-provider.tsx
"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState, type ReactNode } from "react"

export function QueryProvider({ children }: { readonly children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        retry: 1,
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
```

### Entity Page Header (Shared Layout)
```typescript
// src/components/shared/entity-page-header.tsx
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useRequireRole } from "@/hooks/use-require-role"

type EntityPageHeaderProps = {
  readonly title: string
  readonly description: string
  readonly actionLabel?: string
  readonly onAction?: () => void
}

export function EntityPageHeader({ title, description, actionLabel, onAction }: EntityPageHeaderProps) {
  const { allowed: canCreate } = useRequireRole(["admin", "editor"])
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="font-display text-2xl font-bold text-neutral-800">{title}</h1>
        <p className="text-sm text-neutral-500">{description}</p>
      </div>
      {canCreate && actionLabel && onAction && (
        <Button onClick={onAction}>
          <Plus className="mr-2 h-4 w-4" />
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
```

### Empty State (Replaces ComingSoon)
```typescript
// src/components/shared/empty-state.tsx
import type { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

type EmptyStateProps = {
  readonly icon: LucideIcon
  readonly title: string
  readonly description: string
  readonly actionLabel?: string
  readonly onAction?: () => void
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary-50">
        <Icon className="h-10 w-10 text-primary-500" />
      </div>
      <h2 className="mb-2 font-display text-xl font-bold text-neutral-800">{title}</h2>
      <p className="mb-6 max-w-md text-sm text-neutral-500">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  )
}
```

### Campaign Color Palette Constant
```typescript
// src/lib/utils/constants.ts (addition)
export const CAMPAIGN_COLORS = [
  { name: "Magenta", value: "#E6007E" },      // hitschies primary
  { name: "Lila", value: "#7C4DFF" },          // purple accent
  { name: "Orange", value: "#FF6D00" },        // warm accent
  { name: "Gruen", value: "#00C853" },         // fresh green
  { name: "Blau", value: "#2979FF" },          // cool blue
  { name: "Gelb", value: "#FFD600" },          // sunny yellow
  { name: "Rot", value: "#FF1744" },           // alert red
  { name: "Tuerkis", value: "#00BFA5" },       // teal
  { name: "Pink", value: "#FF4081" },          // soft pink
  { name: "Indigo", value: "#3D5AFE" },        // deep indigo
] as const
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Server Actions for uploads | Signed URL direct uploads | Next.js 14+ | Bypasses body size limits, better for large files |
| SWR for data fetching | TanStack Query v5 | 2024 | Better mutation/optimistic update support |
| Manual OAuth per platform | Late.dev unified API | 2024-2025 | One integration for 13+ platforms |
| Server-side ffmpeg thumbnails | Client-side Canvas extraction | Ongoing | No server compute needed for small teams |
| useEffect for data fetching | TanStack Query hooks | TanStack Query v4+ | Automatic caching, refetching, error handling |

**Notes on current types:**
- The `src/lib/supabase/types.ts` file needs updating -- the `media` table type is missing several columns from the actual schema: `media_type`, `tags`, `thumbnail_path`, `duration_seconds`, `usage_count`. The `alt_text` column exists in types but not in the DB schema (it's on `post_media` instead). This must be corrected early in Phase 2.
- The `hashtag_sets` table is missing `created_by` in the database schema (present in types). Need to verify and add migration if needed.

## Open Questions

1. **Late.dev Token Refresh**
   - What we know: Late.dev handles OAuth flow and provides health check endpoints
   - What's unclear: Whether Late.dev auto-refreshes platform tokens (especially Instagram's 60-day tokens) or whether the app must trigger refresh
   - Recommendation: Check Late.dev docs/support; if auto-refresh is not confirmed, build a `/api/channels/refresh` endpoint as fallback. The `channels` table already has `refresh_token` and `token_expires_at` fields.

2. **Late.dev Callback URL Configuration**
   - What we know: OAuth callback goes through Late.dev, which redirects back to the app
   - What's unclear: Exact callback URL format and whether Late.dev supports localhost for development
   - Recommendation: Configure `NEXT_PUBLIC_APP_URL/api/channels/callback` as the callback URL; test with ngrok if localhost is not supported

3. **Channels Navigation**
   - What we know: There's no `/channels` in the current NAV_ITEMS constant
   - What's unclear: Whether channels get their own nav item or live under Settings
   - Recommendation: Add a "Kanaele" nav item OR place channels management in Settings as a third tab (alongside Profile and Team). The latter is more consistent with the "admin-only" nature of channel management. Decision for planner.

4. **Supabase Storage Bucket Configuration**
   - What we know: CONTEXT.md says "Supabase Storage already configured for media uploads"
   - What's unclear: Whether the `media` bucket is actually created in Supabase, what RLS policies it has
   - Recommendation: Verify bucket exists; if not, create via Supabase dashboard or migration. Needs storage policies allowing authenticated uploads.

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
| CHAN-01 | Connect Instagram via Late.dev | integration | `npx vitest run src/__tests__/api/channels.test.ts -t "connect instagram"` | No - Wave 0 |
| CHAN-02 | Connect TikTok via Late.dev | integration | `npx vitest run src/__tests__/api/channels.test.ts -t "connect tiktok"` | No - Wave 0 |
| CHAN-03 | Connection status and health display | unit | `npx vitest run src/__tests__/components/channel-card.test.tsx` | No - Wave 0 |
| CHAN-04 | Token expiration monitoring | unit | `npx vitest run src/__tests__/api/channels-health.test.ts` | No - Wave 0 |
| CAMP-01 | Create campaign CRUD | integration | `npx vitest run src/__tests__/api/campaigns.test.ts` | No - Wave 0 |
| CAMP-02 | Campaign available for assignment | unit | `npx vitest run src/__tests__/hooks/use-campaigns.test.ts` | No - Wave 0 |
| HASH-01 | Create hashtag sets | integration | `npx vitest run src/__tests__/api/hashtag-sets.test.ts` | No - Wave 0 |
| HASH-02 | One-click insertion UI ready | unit | `npx vitest run src/__tests__/components/hashtag-set-list.test.tsx` | No - Wave 0 |
| HASH-03 | Categorized hashtag sets | unit | `npx vitest run src/__tests__/components/hashtag-set-list.test.tsx -t "categorized"` | No - Wave 0 |
| MEDIA-01 | Upload via drag-and-drop | integration | `npx vitest run src/__tests__/components/media-upload.test.tsx` | No - Wave 0 |
| MEDIA-02 | Tag media assets | integration | `npx vitest run src/__tests__/api/media.test.ts -t "tags"` | No - Wave 0 |
| MEDIA-03 | Search/filter media | unit | `npx vitest run src/__tests__/hooks/use-media.test.ts -t "filter"` | No - Wave 0 |
| MEDIA-04 | Usage count display | unit | `npx vitest run src/__tests__/components/media-card.test.tsx -t "usage"` | No - Wave 0 |
| MEDIA-05 | Video thumbnail generation | unit | `npx vitest run src/__tests__/lib/video-thumbnail.test.ts` | No - Wave 0 |

### Sampling Rate
- **Per task commit:** `npm test -- --reporter=verbose`
- **Per wave merge:** `npm test -- --coverage`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/__tests__/api/channels.test.ts` -- covers CHAN-01, CHAN-02 (mock Late.dev SDK)
- [ ] `src/__tests__/api/channels-health.test.ts` -- covers CHAN-04
- [ ] `src/__tests__/api/campaigns.test.ts` -- covers CAMP-01
- [ ] `src/__tests__/api/hashtag-sets.test.ts` -- covers HASH-01
- [ ] `src/__tests__/api/media.test.ts` -- covers MEDIA-01, MEDIA-02
- [ ] `src/__tests__/components/channel-card.test.tsx` -- covers CHAN-03
- [ ] `src/__tests__/components/hashtag-set-list.test.tsx` -- covers HASH-02, HASH-03
- [ ] `src/__tests__/components/media-upload.test.tsx` -- covers MEDIA-01
- [ ] `src/__tests__/components/media-card.test.tsx` -- covers MEDIA-04
- [ ] `src/__tests__/hooks/use-campaigns.test.ts` -- covers CAMP-02
- [ ] `src/__tests__/hooks/use-media.test.ts` -- covers MEDIA-03
- [ ] `src/__tests__/lib/video-thumbnail.test.ts` -- covers MEDIA-05
- [ ] TanStack Query test utilities: `@tanstack/react-query` test wrapper needed for hook tests

## Sources

### Primary (HIGH confidence)
- Supabase Storage signed uploads -- verified from official docs and multiple tutorials
- Database schema -- read directly from `supabase/migrations/001_initial_schema.sql`
- RLS policies -- read directly from `supabase/migrations/002_rls_policies.sql`
- Existing TypeScript types -- read from `src/lib/supabase/types.ts`
- Phase 1 API patterns -- read from `src/app/api/admin/users/route.ts` and `invite/route.ts`

### Secondary (MEDIUM confidence)
- [Late.dev API docs](https://docs.getlate.dev) -- OAuth flow, account management, health endpoints
- [Late.dev main site](https://getlate.dev/) -- SDK availability (`@getlatedev/node`)
- [TanStack Query v5 optimistic updates](https://tanstack.com/query/v5/docs/react/guides/optimistic-updates)
- [Supabase + TanStack Query patterns](https://makerkit.dev/blog/saas/supabase-react-query) -- `.throwOnError()` critical tip

### Tertiary (LOW confidence)
- Late.dev token auto-refresh behavior -- not confirmed in docs, flagged as open question
- Exact `@getlatedev/node` SDK API surface -- docs were summarized, not fully enumerated

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries verified, installation straightforward
- Architecture: HIGH -- follows established Phase 1 patterns, schema already exists
- Late.dev integration: MEDIUM -- OAuth flow documented but token refresh unclear
- Media upload: HIGH -- signed URL pattern well-documented in Supabase docs
- Video thumbnails: HIGH -- Canvas API is well-established browser capability
- Pitfalls: HIGH -- based on direct code inspection and known framework behaviors

**Research date:** 2026-03-13
**Valid until:** 2026-04-13 (stable stack, 30 days)
