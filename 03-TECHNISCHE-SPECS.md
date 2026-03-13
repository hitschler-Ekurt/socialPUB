# hitschies Content Planner — Technische Spezifikation

> **Implementierungsreferenz für Claude Code**
> Tech Stack: Next.js + Supabase + Tailwind CSS

---

## 1. Projektstruktur

```
hitschies-publisher/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/               # Auth-geschützte Routes
│   │   │   ├── calendar/         # Redaktionskalender
│   │   │   ├── composer/         # Post Composer
│   │   │   │   └── [id]/         # Post bearbeiten
│   │   │   ├── media/            # Media Library
│   │   │   ├── links/            # Link Manager
│   │   │   ├── ideas/            # Ideen-Board (Kanban)
│   │   │   ├── campaigns/        # Kampagnen-Management
│   │   │   ├── analytics/        # Analytics Dashboard
│   │   │   └── settings/         # Einstellungen
│   │   ├── api/                  # API Routes
│   │   │   ├── links/            # Short-Link Redirect & Tracking
│   │   │   ├── publish/          # Social Media Publishing
│   │   │   ├── webhooks/         # Webhook Handler
│   │   │   └── ai/              # Claude API Proxy
│   │   ├── login/                # Auth Pages
│   │   └── layout.tsx            # Root Layout mit Sidebar
│   │
│   ├── components/
│   │   ├── ui/                   # Basis-Komponenten (shadcn/ui basiert)
│   │   │   ├── button.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── calendar.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── toast.tsx
│   │   │   └── tooltip.tsx
│   │   ├── calendar/             # Kalender-Komponenten
│   │   │   ├── CalendarGrid.tsx
│   │   │   ├── CalendarHeader.tsx
│   │   │   ├── DayCell.tsx
│   │   │   ├── PostCard.tsx
│   │   │   ├── WeekView.tsx
│   │   │   └── MonthView.tsx
│   │   ├── composer/             # Composer-Komponenten
│   │   │   ├── PostEditor.tsx
│   │   │   ├── PostPreview.tsx
│   │   │   ├── ChannelSelector.tsx
│   │   │   ├── MediaUploader.tsx
│   │   │   ├── HashtagPicker.tsx
│   │   │   ├── SchedulePicker.tsx
│   │   │   └── UTMBuilder.tsx
│   │   ├── links/                # Link-Management
│   │   │   ├── LinkTable.tsx
│   │   │   ├── LinkInBioEditor.tsx
│   │   │   ├── UTMTemplateManager.tsx
│   │   │   └── LinkAnalytics.tsx
│   │   ├── ideas/                # Kanban-Board
│   │   │   ├── KanbanBoard.tsx
│   │   │   ├── KanbanColumn.tsx
│   │   │   └── IdeaCard.tsx
│   │   ├── media/                # Media Library
│   │   │   ├── MediaGrid.tsx
│   │   │   ├── MediaUploadZone.tsx
│   │   │   └── MediaDetail.tsx
│   │   └── layout/               # App Shell
│   │       ├── Sidebar.tsx
│   │       ├── Header.tsx
│   │       ├── MobileNav.tsx
│   │       └── BrandLogo.tsx
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts         # Browser Supabase Client
│   │   │   ├── server.ts         # Server Supabase Client
│   │   │   ├── middleware.ts     # Auth Middleware
│   │   │   └── types.ts         # Generated DB Types
│   │   ├── social/
│   │   │   ├── instagram.ts      # Meta Graph API
│   │   │   ├── facebook.ts       # Facebook Publishing
│   │   │   ├── tiktok.ts         # TikTok API
│   │   │   ├── linkedin.ts       # LinkedIn API
│   │   │   └── publisher.ts      # Unified Publishing Layer
│   │   ├── links/
│   │   │   ├── shortener.ts      # URL-Shortening Logic
│   │   │   ├── utm.ts            # UTM Builder Utilities
│   │   │   └── tracker.ts        # Click Tracking
│   │   ├── ai/
│   │   │   └── claude.ts         # Claude API Integration
│   │   └── utils/
│   │       ├── dates.ts          # Date/Time Helpers
│   │       ├── platforms.ts      # Platform Constants & Limits
│   │       └── validation.ts     # Zod Schemas
│   │
│   ├── hooks/                    # Custom React Hooks
│   │   ├── usePosts.ts
│   │   ├── useCalendar.ts
│   │   ├── useLinks.ts
│   │   ├── useMedia.ts
│   │   └── useKeyboardShortcuts.ts
│   │
│   ├── stores/                   # Zustand Stores (Client State)
│   │   ├── calendarStore.ts
│   │   ├── composerStore.ts
│   │   └── uiStore.ts
│   │
│   └── styles/
│       ├── globals.css           # Design Tokens + Tailwind Base
│       └── calendar.css          # Kalender-spezifische Styles
│
├── supabase/
│   ├── migrations/               # SQL Migrations
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_link_engine.sql
│   │   └── 003_rls_policies.sql
│   ├── functions/                # Supabase Edge Functions
│   │   ├── publish-post/         # Scheduled Post Publisher
│   │   ├── redirect-link/        # Short-Link Redirect
│   │   └── track-click/          # Click Tracking
│   └── seed.sql                  # Demo-Daten
│
├── public/
│   ├── brand/                    # hitschies Brand Assets
│   │   ├── logo.svg
│   │   ├── logo-icon.svg
│   │   └── favicon.ico
│   └── platform-icons/           # Social Platform SVGs
│
├── .env.local.example
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

---

## 2. Datenbank-Schema

### 2.1 Core Tables

```sql
-- ============================================
-- hitschies Publisher — Database Schema
-- Supabase PostgreSQL
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- Für Volltext-Suche

-- ============================================
-- USERS & AUTH
-- ============================================
-- Nutzt Supabase Auth (auth.users)
-- Zusätzliches Profil-Table:

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('admin', 'editor', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CHANNELS (Social Media Kanäle)
-- ============================================
CREATE TABLE public.channels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform TEXT NOT NULL CHECK (platform IN (
    'instagram', 'facebook', 'tiktok', 'linkedin', 
    'youtube', 'threads', 'pinterest'
  )),
  name TEXT NOT NULL,                    -- z.B. "hitschies.official"
  account_id TEXT,                       -- Plattform-spezifische Account-ID
  access_token TEXT,                     -- Encrypted via Supabase Vault
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',           -- Plattform-spezifische Daten
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CAMPAIGNS (Kampagnen)
-- ============================================
CREATE TABLE public.campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,                    -- z.B. "Karneval 2026"
  slug TEXT UNIQUE NOT NULL,             -- z.B. "karneval-2026"
  color TEXT NOT NULL DEFAULT '#7C4DFF', -- Kampagnen-Farbe
  description TEXT,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- POSTS (Geplante & veröffentlichte Posts)
-- ============================================
CREATE TYPE post_status AS ENUM (
  'draft', 'review', 'approved', 'scheduled', 'published', 'failed'
);

CREATE TYPE post_type AS ENUM (
  'image', 'video', 'carousel', 'text', 'story', 'reel'
);

CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Content
  caption TEXT,                          -- Haupt-Caption
  caption_overrides JSONB DEFAULT '{}',  -- Plattform-spezifische Overrides
                                         -- {"instagram": "...", "tiktok": "..."}
  post_type post_type NOT NULL DEFAULT 'image',
  hashtags TEXT[] DEFAULT '{}',
  first_comment TEXT,                    -- Erster Kommentar (Instagram-Strategie)
  
  -- Scheduling
  status post_status NOT NULL DEFAULT 'draft',
  scheduled_at TIMESTAMPTZ,              -- Geplanter Zeitpunkt
  published_at TIMESTAMPTZ,              -- Tatsächlicher Zeitpunkt
  
  -- Relations
  campaign_id UUID REFERENCES public.campaigns(id),
  created_by UUID REFERENCES public.profiles(id),
  assigned_to UUID REFERENCES public.profiles(id),
  
  -- Link
  link_id UUID REFERENCES public.links(id),  -- Verknüpfter Link
  update_linkinbio BOOLEAN DEFAULT false,     -- Bio-Link aktualisieren?
  
  -- Publishing Results
  platform_post_ids JSONB DEFAULT '{}',  -- {"instagram": "17895695...", "tiktok": "72834..."}
  publish_errors JSONB DEFAULT '{}',     -- Fehler pro Plattform
  
  -- Meta
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Many-to-Many: Posts ↔ Channels
CREATE TABLE public.post_channels (
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  channel_id UUID REFERENCES public.channels(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, channel_id)
);

-- ============================================
-- POST MEDIA (Medien pro Post)
-- ============================================
CREATE TABLE public.post_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  media_id UUID REFERENCES public.media(id),
  position INTEGER NOT NULL DEFAULT 0,   -- Reihenfolge (für Carousels)
  alt_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MEDIA LIBRARY
-- ============================================
CREATE TYPE media_type AS ENUM ('image', 'video', 'gif');

CREATE TABLE public.media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,               -- Supabase Storage Path
  file_size BIGINT,
  mime_type TEXT,
  media_type media_type NOT NULL,
  width INTEGER,
  height INTEGER,
  duration_seconds NUMERIC,              -- Für Videos
  thumbnail_path TEXT,
  tags TEXT[] DEFAULT '{}',
  uploaded_by UUID REFERENCES public.profiles(id),
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- LINK ENGINE
-- ============================================
CREATE TABLE public.links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  original_url TEXT NOT NULL,
  short_code TEXT UNIQUE NOT NULL,       -- z.B. "dra26"
  short_url TEXT GENERATED ALWAYS AS (
    'https://link.hitschies.de/' || short_code
  ) STORED,
  
  -- UTM Parameters
  utm_source TEXT,
  utm_medium TEXT DEFAULT 'social',
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  
  -- Full URL with UTM
  full_url TEXT,                          -- Computed: original_url + UTM params
  
  -- Metadata
  title TEXT,                            -- Link-Titel für Anzeige
  campaign_id UUID REFERENCES public.campaigns(id),
  expires_at TIMESTAMPTZ,                -- Ablaufdatum (für Gewinnspiele)
  is_active BOOLEAN DEFAULT true,
  
  -- Stats (denormalized for quick access)
  click_count INTEGER DEFAULT 0,
  
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_links_short_code ON public.links(short_code);

-- ============================================
-- LINK CLICK TRACKING
-- ============================================
CREATE TABLE public.link_clicks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  link_id UUID REFERENCES public.links(id) ON DELETE CASCADE,
  clicked_at TIMESTAMPTZ DEFAULT NOW(),
  referrer TEXT,
  user_agent TEXT,
  country TEXT,
  city TEXT,
  device_type TEXT,                      -- mobile, desktop, tablet
  ip_hash TEXT                           -- Anonymized IP für Unique-Counting
);

CREATE INDEX idx_link_clicks_link_id ON public.link_clicks(link_id);
CREATE INDEX idx_link_clicks_clicked_at ON public.link_clicks(clicked_at);

-- ============================================
-- LINK-IN-BIO
-- ============================================
CREATE TABLE public.linkinbio_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id UUID REFERENCES public.channels(id),
  slug TEXT UNIQUE NOT NULL,             -- z.B. "hitschies"
  title TEXT DEFAULT 'hitschies',
  description TEXT,
  avatar_url TEXT,
  background_color TEXT DEFAULT '#E6007E',
  is_active BOOLEAN DEFAULT true,
  auto_update BOOLEAN DEFAULT true,      -- Automatisch bei neuem Post updaten
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.linkinbio_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_id UUID REFERENCES public.linkinbio_pages(id) ON DELETE CASCADE,
  link_id UUID REFERENCES public.links(id),
  title TEXT NOT NULL,
  emoji TEXT,                            -- z.B. "🔥"
  position INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  clicks INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- UTM TEMPLATES
-- ============================================
CREATE TABLE public.utm_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,                    -- z.B. "Standard Kampagnen-Post"
  utm_source TEXT,                       -- NULL = Auto aus Channel
  utm_medium TEXT DEFAULT 'social',
  utm_campaign TEXT,                     -- NULL = Auto aus Kampagne
  utm_content TEXT,                      -- NULL = Auto generiert
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- DRAFTS / IDEAS (Kanban Board)
-- ============================================
CREATE TYPE draft_status AS ENUM ('idea', 'in_progress', 'ready', 'scheduled');

CREATE TABLE public.drafts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  status draft_status NOT NULL DEFAULT 'idea',
  position INTEGER NOT NULL DEFAULT 0,
  channel_hints TEXT[] DEFAULT '{}',     -- Vorgeschlagene Kanäle
  campaign_id UUID REFERENCES public.campaigns(id),
  due_date DATE,
  assigned_to UUID REFERENCES public.profiles(id),
  post_id UUID REFERENCES public.posts(id),  -- Wenn zu Post konvertiert
  tags TEXT[] DEFAULT '{}',
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- HASHTAG SETS
-- ============================================
CREATE TABLE public.hashtag_sets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,                    -- z.B. "hitschies Standard"
  hashtags TEXT[] NOT NULL,
  category TEXT,                         -- z.B. "brand", "product", "campaign"
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- APPROVAL LOG
-- ============================================
CREATE TABLE public.approval_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('submitted', 'approved', 'rejected', 'comment')),
  comment TEXT,
  performed_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES & OPTIMIZATIONS
-- ============================================
CREATE INDEX idx_posts_scheduled_at ON public.posts(scheduled_at) WHERE status = 'scheduled';
CREATE INDEX idx_posts_status ON public.posts(status);
CREATE INDEX idx_posts_campaign_id ON public.posts(campaign_id);
CREATE INDEX idx_drafts_status ON public.drafts(status);
CREATE INDEX idx_media_tags ON public.media USING GIN(tags);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Auto-increment click count
CREATE OR REPLACE FUNCTION increment_link_clicks()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.links SET click_count = click_count + 1 WHERE id = NEW.link_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_link_click
  AFTER INSERT ON public.link_clicks
  FOR EACH ROW EXECUTE FUNCTION increment_link_clicks();

-- Auto-generate short code
CREATE OR REPLACE FUNCTION generate_short_code()
RETURNS TRIGGER AS $$
DECLARE
  chars TEXT := 'abcdefghijklmnopqrstuvwxyz0123456789';
  result TEXT := '';
  i INT;
BEGIN
  IF NEW.short_code IS NULL OR NEW.short_code = '' THEN
    FOR i IN 1..6 LOOP
      result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    NEW.short_code := result;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_link_insert
  BEFORE INSERT ON public.links
  FOR EACH ROW EXECUTE FUNCTION generate_short_code();

-- Build full URL with UTM
CREATE OR REPLACE FUNCTION build_full_url()
RETURNS TRIGGER AS $$
DECLARE
  params TEXT := '';
BEGIN
  IF NEW.utm_source IS NOT NULL THEN
    params := params || 'utm_source=' || NEW.utm_source;
  END IF;
  IF NEW.utm_medium IS NOT NULL THEN
    params := params || '&utm_medium=' || NEW.utm_medium;
  END IF;
  IF NEW.utm_campaign IS NOT NULL THEN
    params := params || '&utm_campaign=' || NEW.utm_campaign;
  END IF;
  IF NEW.utm_content IS NOT NULL THEN
    params := params || '&utm_content=' || NEW.utm_content;
  END IF;
  IF NEW.utm_term IS NOT NULL THEN
    params := params || '&utm_term=' || NEW.utm_term;
  END IF;
  
  IF params != '' THEN
    -- Remove leading &
    params := ltrim(params, '&');
    IF position('?' in NEW.original_url) > 0 THEN
      NEW.full_url := NEW.original_url || '&' || params;
    ELSE
      NEW.full_url := NEW.original_url || '?' || params;
    END IF;
  ELSE
    NEW.full_url := NEW.original_url;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_link_upsert
  BEFORE INSERT OR UPDATE ON public.links
  FOR EACH ROW EXECUTE FUNCTION build_full_url();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- Alle authentifizierten User können lesen (internes Tool)
CREATE POLICY "Authenticated users can read all" ON public.posts
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert" ON public.posts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Editors can update own or assigned posts" ON public.posts
  FOR UPDATE USING (
    auth.uid() = created_by OR auth.uid() = assigned_to
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Analog für alle anderen Tables...
```

---

## 3. API-Endpunkte

### 3.1 Short-Link Redirect (Edge Function)

```typescript
// supabase/functions/redirect-link/index.ts
// GET link.hitschies.de/:shortCode → 302 Redirect + Track Click

import { serve } from 'https://deno.land/std/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js'

serve(async (req) => {
  const url = new URL(req.url)
  const shortCode = url.pathname.slice(1) // Remove leading /
  
  if (!shortCode) {
    return new Response('Not found', { status: 404 })
  }
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )
  
  // Lookup link
  const { data: link } = await supabase
    .from('links')
    .select('id, full_url, is_active, expires_at')
    .eq('short_code', shortCode)
    .single()
  
  if (!link || !link.is_active) {
    return new Response('Link not found', { status: 404 })
  }
  
  // Check expiry
  if (link.expires_at && new Date(link.expires_at) < new Date()) {
    return new Response('Link expired', { status: 410 })
  }
  
  // Track click (fire and forget)
  const userAgent = req.headers.get('user-agent') || ''
  const referrer = req.headers.get('referer') || ''
  
  supabase.from('link_clicks').insert({
    link_id: link.id,
    user_agent: userAgent,
    referrer: referrer,
    device_type: detectDevice(userAgent),
  })
  
  // 302 Redirect
  return new Response(null, {
    status: 302,
    headers: { 'Location': link.full_url }
  })
})
```

### 3.2 Scheduled Publisher (Cron Edge Function)

```typescript
// supabase/functions/publish-post/index.ts
// Runs every minute via Supabase Cron
// Finds scheduled posts due for publishing → calls Social APIs

// Pseudocode:
// 1. SELECT * FROM posts WHERE status='scheduled' AND scheduled_at <= NOW()
// 2. Für jeden Post:
//    a. Lade verknüpfte channels (post_channels JOIN channels)
//    b. Lade media (post_media JOIN media)
//    c. Für jeden Channel: Rufe die jeweilige Social API auf
//    d. Bei Erfolg: status='published', published_at=NOW()
//    e. Bei Fehler: status='failed', publish_errors={"platform": "error msg"}
//    f. Wenn update_linkinbio=true: Update Link-in-Bio
```

---

## 4. Plattform-Limits (Referenz)

```typescript
// src/lib/utils/platforms.ts

export const PLATFORM_LIMITS = {
  instagram: {
    caption: 2200,
    hashtags: 30,
    imageFormats: ['jpg', 'png'],
    videoFormats: ['mp4', 'mov'],
    maxVideoLength: 90, // seconds (Reels)
    aspectRatios: ['1:1', '4:5', '9:16', '16:9'],
    carouselMax: 20,
  },
  facebook: {
    caption: 63206,
    imageFormats: ['jpg', 'png', 'gif'],
    videoFormats: ['mp4', 'mov'],
    maxVideoLength: 240 * 60, // 4 hours
  },
  tiktok: {
    caption: 2200,
    hashtags: 100, // technically no hard limit
    videoFormats: ['mp4', 'mov', 'webm'],
    maxVideoLength: 600, // 10 minutes
    aspectRatios: ['9:16'],
  },
  linkedin: {
    caption: 3000,
    imageFormats: ['jpg', 'png', 'gif'],
    videoFormats: ['mp4'],
    maxVideoLength: 600,
  },
  youtube: {
    title: 100,
    description: 5000,
    videoFormats: ['mp4', 'mov', 'avi', 'wmv', 'flv', 'webm'],
    maxVideoLength: 43200, // 12 hours
  },
} as const
```

---

## 5. Environment Variables

```bash
# .env.local.example

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Social Media APIs
META_APP_ID=123456789
META_APP_SECRET=abc123...
INSTAGRAM_ACCESS_TOKEN=IGQ...
FACEBOOK_PAGE_ACCESS_TOKEN=EAA...

TIKTOK_CLIENT_KEY=xxx
TIKTOK_CLIENT_SECRET=xxx

LINKEDIN_CLIENT_ID=xxx
LINKEDIN_CLIENT_SECRET=xxx

# Link Engine
NEXT_PUBLIC_SHORT_LINK_DOMAIN=link.hitschies.de

# AI
ANTHROPIC_API_KEY=sk-ant-...

# Optional: Unified Social API
LATE_API_KEY=xxx
# ODER
AYRSHARE_API_KEY=xxx

# Analytics
FABRIC_WORKSPACE_ID=xxx
```

---

## 6. Key Dependencies

```json
{
  "dependencies": {
    "next": "^14.2",
    "@supabase/supabase-js": "^2.45",
    "@supabase/ssr": "^0.5",
    "zustand": "^4.5",
    "react-beautiful-dnd": "^13.1",
    "date-fns": "^3.6",
    "lucide-react": "^0.383",
    "tailwindcss": "^3.4",
    "tailwind-merge": "^2.3",
    "clsx": "^2.1",
    "zod": "^3.23",
    "@tanstack/react-query": "^5.50",
    "nanoid": "^5.0",
    "sharp": "^0.33",
    "qrcode": "^1.5"
  },
  "devDependencies": {
    "typescript": "^5.5",
    "supabase": "^1.180",
    "@types/react": "^18",
    "eslint": "^8",
    "prettier": "^3"
  }
}
```

---

## 7. Deployment-Architektur

```
┌─────────────────────────────────────────────────────┐
│                    INTERNET                          │
├─────────┬───────────────────────┬───────────────────┤
│         │                       │                   │
│   ┌─────▼─────┐          ┌─────▼─────┐            │
│   │  Vercel   │          │link.hitsc- │            │
│   │ (Next.js) │          │hies.de     │            │
│   │           │          │(Supabase   │            │
│   │ App Host  │          │Edge Func)  │            │
│   └─────┬─────┘          └─────┬─────┘            │
│         │                       │                   │
│   ┌─────▼───────────────────────▼─────┐            │
│   │         Supabase Cloud            │            │
│   │  ┌──────────┐  ┌──────────────┐  │            │
│   │  │PostgreSQL │  │ Storage      │  │            │
│   │  │(Database) │  │ (Media Files)│  │            │
│   │  └──────────┘  └──────────────┘  │            │
│   │  ┌──────────┐  ┌──────────────┐  │            │
│   │  │Auth      │  │ Edge         │  │            │
│   │  │          │  │ Functions    │  │            │
│   │  └──────────┘  └──────────────┘  │            │
│   │  ┌──────────────────────────────┐ │            │
│   │  │Realtime (Post-Status-Updates)│ │            │
│   │  └──────────────────────────────┘ │            │
│   └───────────────────────────────────┘            │
│         │                                           │
│   ┌─────▼──────────────────────────────┐           │
│   │  Social Media APIs                  │           │
│   │  Meta Graph · TikTok · LinkedIn     │           │
│   └─────────────────────────────────────┘           │
│         │                                           │
│   ┌─────▼──────────────────────────────┐           │
│   │  Microsoft Fabric (Analytics)       │           │
│   │  n8n (Automation Workflows)         │           │
│   └─────────────────────────────────────┘           │
└─────────────────────────────────────────────────────┘
```

---

*Alle drei Dokumente zusammen bilden die vollständige Spezifikation für Claude Code.*
