-- ============================================
-- hitschies Publisher -- Row Level Security Policies
-- ============================================

-- Helper function: get current user's role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT role FROM public.profiles WHERE id = (SELECT auth.uid())
$$;

-- ============================================
-- PROFILES
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read all profiles (internal tool)
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Users can update their own profile (name, avatar)
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can update any profile (role changes)
CREATE POLICY "profiles_admin_update" ON public.profiles
  FOR UPDATE USING (public.get_user_role() = 'admin');

-- ============================================
-- CHANNELS
-- ============================================
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "channels_select" ON public.channels
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "channels_insert" ON public.channels
  FOR INSERT WITH CHECK (public.get_user_role() IN ('admin', 'editor'));

CREATE POLICY "channels_update" ON public.channels
  FOR UPDATE USING (
    public.get_user_role() = 'admin'
  );

CREATE POLICY "channels_delete" ON public.channels
  FOR DELETE USING (public.get_user_role() = 'admin');

-- ============================================
-- CAMPAIGNS
-- ============================================
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "campaigns_select" ON public.campaigns
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "campaigns_insert" ON public.campaigns
  FOR INSERT WITH CHECK (public.get_user_role() IN ('admin', 'editor'));

CREATE POLICY "campaigns_update" ON public.campaigns
  FOR UPDATE USING (
    public.get_user_role() = 'admin'
    OR (public.get_user_role() = 'editor' AND created_by = (SELECT auth.uid()))
  );

CREATE POLICY "campaigns_delete" ON public.campaigns
  FOR DELETE USING (public.get_user_role() = 'admin');

-- ============================================
-- POSTS
-- ============================================
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "posts_select" ON public.posts
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "posts_insert" ON public.posts
  FOR INSERT WITH CHECK (public.get_user_role() IN ('admin', 'editor'));

CREATE POLICY "posts_update" ON public.posts
  FOR UPDATE USING (
    public.get_user_role() = 'admin'
    OR (public.get_user_role() = 'editor' AND created_by = (SELECT auth.uid()))
  );

CREATE POLICY "posts_delete" ON public.posts
  FOR DELETE USING (public.get_user_role() = 'admin');

-- ============================================
-- POST CHANNELS
-- ============================================
ALTER TABLE public.post_channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "post_channels_select" ON public.post_channels
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "post_channels_insert" ON public.post_channels
  FOR INSERT WITH CHECK (public.get_user_role() IN ('admin', 'editor'));

CREATE POLICY "post_channels_update" ON public.post_channels
  FOR UPDATE USING (public.get_user_role() IN ('admin', 'editor'));

CREATE POLICY "post_channels_delete" ON public.post_channels
  FOR DELETE USING (public.get_user_role() = 'admin');

-- ============================================
-- POST MEDIA
-- ============================================
ALTER TABLE public.post_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "post_media_select" ON public.post_media
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "post_media_insert" ON public.post_media
  FOR INSERT WITH CHECK (public.get_user_role() IN ('admin', 'editor'));

CREATE POLICY "post_media_update" ON public.post_media
  FOR UPDATE USING (public.get_user_role() IN ('admin', 'editor'));

CREATE POLICY "post_media_delete" ON public.post_media
  FOR DELETE USING (public.get_user_role() = 'admin');

-- ============================================
-- MEDIA
-- ============================================
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "media_select" ON public.media
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "media_insert" ON public.media
  FOR INSERT WITH CHECK (public.get_user_role() IN ('admin', 'editor'));

CREATE POLICY "media_update" ON public.media
  FOR UPDATE USING (
    public.get_user_role() = 'admin'
    OR (public.get_user_role() = 'editor' AND uploaded_by = (SELECT auth.uid()))
  );

CREATE POLICY "media_delete" ON public.media
  FOR DELETE USING (public.get_user_role() = 'admin');

-- ============================================
-- LINKS
-- ============================================
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "links_select" ON public.links
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "links_insert" ON public.links
  FOR INSERT WITH CHECK (public.get_user_role() IN ('admin', 'editor'));

CREATE POLICY "links_update" ON public.links
  FOR UPDATE USING (
    public.get_user_role() = 'admin'
    OR (public.get_user_role() = 'editor' AND created_by = (SELECT auth.uid()))
  );

CREATE POLICY "links_delete" ON public.links
  FOR DELETE USING (public.get_user_role() = 'admin');

-- ============================================
-- LINK CLICKS (special: all authenticated can insert for tracking)
-- ============================================
ALTER TABLE public.link_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "link_clicks_select" ON public.link_clicks
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "link_clicks_insert" ON public.link_clicks
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "link_clicks_delete" ON public.link_clicks
  FOR DELETE USING (public.get_user_role() = 'admin');

-- ============================================
-- LINKINBIO PAGES
-- ============================================
ALTER TABLE public.linkinbio_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "linkinbio_pages_select" ON public.linkinbio_pages
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "linkinbio_pages_insert" ON public.linkinbio_pages
  FOR INSERT WITH CHECK (public.get_user_role() IN ('admin', 'editor'));

CREATE POLICY "linkinbio_pages_update" ON public.linkinbio_pages
  FOR UPDATE USING (public.get_user_role() IN ('admin', 'editor'));

CREATE POLICY "linkinbio_pages_delete" ON public.linkinbio_pages
  FOR DELETE USING (public.get_user_role() = 'admin');

-- ============================================
-- LINKINBIO ITEMS
-- ============================================
ALTER TABLE public.linkinbio_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "linkinbio_items_select" ON public.linkinbio_items
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "linkinbio_items_insert" ON public.linkinbio_items
  FOR INSERT WITH CHECK (public.get_user_role() IN ('admin', 'editor'));

CREATE POLICY "linkinbio_items_update" ON public.linkinbio_items
  FOR UPDATE USING (public.get_user_role() IN ('admin', 'editor'));

CREATE POLICY "linkinbio_items_delete" ON public.linkinbio_items
  FOR DELETE USING (public.get_user_role() = 'admin');

-- ============================================
-- UTM TEMPLATES
-- ============================================
ALTER TABLE public.utm_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "utm_templates_select" ON public.utm_templates
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "utm_templates_insert" ON public.utm_templates
  FOR INSERT WITH CHECK (public.get_user_role() IN ('admin', 'editor'));

CREATE POLICY "utm_templates_update" ON public.utm_templates
  FOR UPDATE USING (public.get_user_role() IN ('admin', 'editor'));

CREATE POLICY "utm_templates_delete" ON public.utm_templates
  FOR DELETE USING (public.get_user_role() = 'admin');

-- ============================================
-- DRAFTS
-- ============================================
ALTER TABLE public.drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "drafts_select" ON public.drafts
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "drafts_insert" ON public.drafts
  FOR INSERT WITH CHECK (public.get_user_role() IN ('admin', 'editor'));

CREATE POLICY "drafts_update" ON public.drafts
  FOR UPDATE USING (
    public.get_user_role() = 'admin'
    OR (public.get_user_role() = 'editor' AND created_by = (SELECT auth.uid()))
  );

CREATE POLICY "drafts_delete" ON public.drafts
  FOR DELETE USING (public.get_user_role() = 'admin');

-- ============================================
-- HASHTAG SETS
-- ============================================
ALTER TABLE public.hashtag_sets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hashtag_sets_select" ON public.hashtag_sets
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "hashtag_sets_insert" ON public.hashtag_sets
  FOR INSERT WITH CHECK (public.get_user_role() IN ('admin', 'editor'));

CREATE POLICY "hashtag_sets_update" ON public.hashtag_sets
  FOR UPDATE USING (public.get_user_role() IN ('admin', 'editor'));

CREATE POLICY "hashtag_sets_delete" ON public.hashtag_sets
  FOR DELETE USING (public.get_user_role() = 'admin');

-- ============================================
-- APPROVAL LOGS
-- ============================================
ALTER TABLE public.approval_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "approval_logs_select" ON public.approval_logs
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "approval_logs_insert" ON public.approval_logs
  FOR INSERT WITH CHECK (public.get_user_role() IN ('admin', 'editor'));

CREATE POLICY "approval_logs_delete" ON public.approval_logs
  FOR DELETE USING (public.get_user_role() = 'admin');
