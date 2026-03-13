-- ============================================
-- hitschies Publisher -- Database Schema
-- Supabase PostgreSQL
-- ============================================

-- Enable necessary extensions (NOT uuid-ossp -- use gen_random_uuid() instead)
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================
-- USERS & AUTH
-- ============================================
-- Uses Supabase Auth (auth.users)
-- Additional profile table:

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('admin', 'editor', 'viewer')),
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CHANNELS (Social Media Channels)
-- ============================================
CREATE TABLE public.channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL CHECK (platform IN (
    'instagram', 'facebook', 'tiktok', 'linkedin',
    'youtube', 'threads', 'pinterest'
  )),
  name TEXT NOT NULL,
  account_id TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CAMPAIGNS
-- ============================================
CREATE TABLE public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  color TEXT NOT NULL DEFAULT '#7C4DFF',
  description TEXT,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MEDIA LIBRARY (must be before post_media)
-- ============================================
CREATE TYPE media_type AS ENUM ('image', 'video', 'gif');

CREATE TABLE public.media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  media_type media_type NOT NULL,
  width INTEGER,
  height INTEGER,
  duration_seconds NUMERIC,
  thumbnail_path TEXT,
  tags TEXT[] DEFAULT '{}',
  uploaded_by UUID REFERENCES public.profiles(id),
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- LINK ENGINE (must be before posts)
-- ============================================
CREATE TABLE public.links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_url TEXT NOT NULL,
  short_code TEXT UNIQUE NOT NULL,
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
  full_url TEXT,

  -- Metadata
  title TEXT,
  campaign_id UUID REFERENCES public.campaigns(id),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,

  -- Stats (denormalized for quick access)
  click_count INTEGER DEFAULT 0,

  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_links_short_code ON public.links(short_code);

-- ============================================
-- POSTS (Planned & Published Posts)
-- ============================================
CREATE TYPE post_status AS ENUM (
  'draft', 'review', 'approved', 'scheduled', 'published', 'failed'
);

CREATE TYPE post_type AS ENUM (
  'image', 'video', 'carousel', 'text', 'story', 'reel'
);

CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Content
  caption TEXT,
  caption_overrides JSONB DEFAULT '{}',
  post_type post_type NOT NULL DEFAULT 'image',
  hashtags TEXT[] DEFAULT '{}',
  first_comment TEXT,

  -- Scheduling
  status post_status NOT NULL DEFAULT 'draft',
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,

  -- Relations
  campaign_id UUID REFERENCES public.campaigns(id),
  created_by UUID REFERENCES public.profiles(id),
  assigned_to UUID REFERENCES public.profiles(id),

  -- Link
  link_id UUID REFERENCES public.links(id),
  update_linkinbio BOOLEAN DEFAULT false,

  -- Publishing Results
  platform_post_ids JSONB DEFAULT '{}',
  publish_errors JSONB DEFAULT '{}',

  -- Meta
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Many-to-Many: Posts <-> Channels
CREATE TABLE public.post_channels (
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  channel_id UUID REFERENCES public.channels(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, channel_id)
);

-- ============================================
-- POST MEDIA (Media per Post)
-- ============================================
CREATE TABLE public.post_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  media_id UUID REFERENCES public.media(id),
  position INTEGER NOT NULL DEFAULT 0,
  alt_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- LINK CLICK TRACKING
-- ============================================
CREATE TABLE public.link_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id UUID REFERENCES public.links(id) ON DELETE CASCADE,
  clicked_at TIMESTAMPTZ DEFAULT NOW(),
  referrer TEXT,
  user_agent TEXT,
  country TEXT,
  city TEXT,
  device_type TEXT,
  ip_hash TEXT
);

CREATE INDEX idx_link_clicks_link_id ON public.link_clicks(link_id);
CREATE INDEX idx_link_clicks_clicked_at ON public.link_clicks(clicked_at);

-- ============================================
-- LINK-IN-BIO
-- ============================================
CREATE TABLE public.linkinbio_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES public.channels(id),
  slug TEXT UNIQUE NOT NULL,
  title TEXT DEFAULT 'hitschies',
  description TEXT,
  avatar_url TEXT,
  background_color TEXT DEFAULT '#E6007E',
  is_active BOOLEAN DEFAULT true,
  auto_update BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.linkinbio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES public.linkinbio_pages(id) ON DELETE CASCADE,
  link_id UUID REFERENCES public.links(id),
  title TEXT NOT NULL,
  emoji TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  clicks INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- UTM TEMPLATES
-- ============================================
CREATE TABLE public.utm_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  utm_source TEXT,
  utm_medium TEXT DEFAULT 'social',
  utm_campaign TEXT,
  utm_content TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- DRAFTS / IDEAS (Kanban Board)
-- ============================================
CREATE TYPE draft_status AS ENUM ('idea', 'in_progress', 'ready', 'scheduled');

CREATE TABLE public.drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status draft_status NOT NULL DEFAULT 'idea',
  position INTEGER NOT NULL DEFAULT 0,
  channel_hints TEXT[] DEFAULT '{}',
  campaign_id UUID REFERENCES public.campaigns(id),
  due_date DATE,
  assigned_to UUID REFERENCES public.profiles(id),
  post_id UUID REFERENCES public.posts(id),
  tags TEXT[] DEFAULT '{}',
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- HASHTAG SETS
-- ============================================
CREATE TABLE public.hashtag_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  hashtags TEXT[] NOT NULL,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- APPROVAL LOG
-- ============================================
CREATE TABLE public.approval_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
-- PROFILE CREATION TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, is_active)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'editor'),
    true
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
