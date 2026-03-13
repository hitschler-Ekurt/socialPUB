# Phase 1: Foundation and Authentication - Research

**Researched:** 2026-03-13
**Domain:** Next.js + Supabase Auth + Database Schema + Design System
**Confidence:** HIGH

## Summary

Phase 1 is a greenfield scaffold covering four domains: (1) Next.js App Router project with Tailwind CSS v4 and shadcn/ui, (2) Supabase Auth with invite-only email/password flow and role-based access, (3) complete PostgreSQL schema with RLS policies, and (4) a branded app shell with hitschies design tokens. The tech stack is well-documented and mature -- Next.js 15.x (stable), Supabase JS v2, @supabase/ssr for cookie-based auth, shadcn/ui CLI v4, and Tailwind CSS v4.

The most complex area is the invite-only auth flow: admin creates users via `supabase.auth.admin.inviteUserByEmail()` on the server side (requires service role key), which sends a "set your password" email. A database trigger on `auth.users` INSERT automatically creates the `profiles` row with the assigned role. RLS policies reference this profile role for authorization. The middleware pattern refreshes tokens via `updateSession()` and protects routes.

**Primary recommendation:** Use the official Supabase SSR pattern (middleware + browser/server clients), deploy all tables in a single migration with gen_random_uuid(), seed the first admin via a migration script, and build the app shell with shadcn/ui sidebar component + hitschies design tokens in Tailwind CSS v4 theme configuration.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Invite-only registration: no public signup, admin creates accounts directly
- Admin enters email, name, and role in a settings page; system creates the account and sends a "set your password" email via Supabase
- First admin (Ersin) seeded via migration script with known email
- Login page: centered card with hitschies logo, Magenta accents, email + password fields
- Deploy ALL tables from the tech spec in Phase 1 (profiles, channels, posts, media, links, drafts, campaigns, hashtag_sets, etc.)
- Use gen_random_uuid() instead of uuid-ossp extension (built into Postgres, simpler)
- Full RLS policies from day one: viewers read-only, editors create/edit, admins full access
- Seed realistic hitschies demo data: sample campaigns (Karneval 2026, Sommer), hashtag sets (hitschies Standard), test links
- All sidebar nav items visible from Phase 1 (Kalender, Composer, Media, Links, Ideen, Kampagnen, Settings)
- Unbuilt sections show branded "coming soon" empty states with hitschies personality ("Hier entsteht gerade etwas Susses!")
- Sidebar fully collapsible from day one (240px to 64px icon-only)
- Default landing page after login: dashboard with onboarding checklist
- Full header: logo + app name, notification bell (placeholder), user avatar + name, settings gear
- Settings page with "Mein Profil" and "Team" (admin-only) sections
- Team section: user list with name, email, role dropdown, status; "+ Neues Mitglied einladen" button
- Role changes take effect immediately (next page load / API call)
- Last-admin safeguard: system blocks demoting or deactivating the last remaining admin
- User removal: deactivate only (soft-delete), no permanent deletion in UI

### Claude's Discretion
- Viewer role implementation: "see everything, edit nothing" vs. limited navigation (recommendation: see everything, actions hidden/disabled -- simplest with RLS)
- Loading states and transition animations
- Exact toast notification behavior
- Mobile bottom navigation details (responsive breakpoints defined in design doc)
- Password requirements beyond Supabase defaults

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| AUTH-01 | User can sign up and log in with email and password | Supabase Auth invite flow + @supabase/ssr cookie-based sessions; inviteUserByEmail() for registration, signInWithPassword() for login |
| AUTH-02 | User session persists across browser refresh | @supabase/ssr stores session in cookies; middleware refreshes tokens automatically via updateSession() |
| AUTH-03 | Admin can assign roles (Admin, Editor, Viewer) to users | profiles.role column + admin API route using service role key; role dropdown in Team settings page |
| AUTH-04 | Editor can create and edit posts, Viewer has read-only access | RLS policies on all tables referencing profiles.role; viewer sees UI with actions hidden/disabled |
| UX-01 | App shell with collapsible sidebar navigation (hitschies branding) | shadcn/ui sidebar component + Lucide icons; CSS transition for collapse (240px to 64px) |
| UX-04 | hitschies design tokens applied (Magenta primary, brand typography) | Tailwind CSS v4 @theme configuration with CSS variables; Plus Jakarta Sans + Inter via next/font |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | ^15.5 | React framework with App Router | Stable release, full Turbopack support, React 19 compatible. Use 15.x not 16.x for production stability |
| react / react-dom | ^19.0 | UI library | Required by Next.js 15, stable release |
| @supabase/supabase-js | ^2.49 | Supabase client SDK | Current stable v2 line |
| @supabase/ssr | ^0.5 | Server-side auth with cookies | Official replacement for deprecated auth-helpers |
| tailwindcss | ^4.0 | Utility-first CSS | CSS-first config, 70% smaller output, automatic content detection |
| typescript | ^5.6 | Type safety | Required for generated Supabase types |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| shadcn/ui | CLI v4 | Component library (not an npm package) | Initialize with `npx shadcn@latest init`; add components with `npx shadcn@latest add` |
| lucide-react | ^0.460 | Icon library | All UI icons, consistent with shadcn/ui |
| zustand | ^5.0 | Client state (sidebar collapsed, UI prefs) | Lightweight, no boilerplate. Only for client-side UI state |
| zod | ^3.24 | Schema validation | Form validation, API input validation |
| date-fns | ^4.1 | Date formatting | Display timestamps, relative dates |
| next/font | built-in | Font optimization | Self-host Plus Jakarta Sans + Inter, zero layout shift |
| clsx + tailwind-merge | ^2.1 / ^3.0 | Class merging | cn() utility for conditional Tailwind classes |
| sonner | ^2.0 | Toast notifications | shadcn/ui's recommended toast library |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Tailwind v4 | Tailwind v3 | v3 is more documented but v4 is stable and shadcn CLI v4 supports it; use v4 |
| zustand | jotai | Both fine for small state; zustand has simpler API for stores |
| sonner | react-hot-toast | sonner integrates with shadcn/ui out of the box |
| Next.js 15 | Next.js 16 | 16 is available but 15.5 is battle-tested; use 15.x for production stability |

**Installation:**
```bash
npx create-next-app@latest hitschies-publisher --typescript --tailwind --eslint --app --src-dir
cd hitschies-publisher
npm install @supabase/supabase-js @supabase/ssr zustand zod date-fns clsx tailwind-merge sonner lucide-react
npm install -D supabase @types/react
npx shadcn@latest init
npx shadcn@latest add button card input label select dropdown-menu avatar badge dialog sheet sidebar toast tabs separator
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── (auth)/                  # Route group for authenticated pages
│   │   ├── layout.tsx           # App shell (sidebar + header + main)
│   │   ├── dashboard/
│   │   │   └── page.tsx         # Default landing: onboarding checklist
│   │   ├── calendar/
│   │   │   └── page.tsx         # Coming soon placeholder
│   │   ├── composer/
│   │   │   └── page.tsx         # Coming soon placeholder
│   │   ├── media/
│   │   │   └── page.tsx         # Coming soon placeholder
│   │   ├── links/
│   │   │   └── page.tsx         # Coming soon placeholder
│   │   ├── ideas/
│   │   │   └── page.tsx         # Coming soon placeholder
│   │   ├── campaigns/
│   │   │   └── page.tsx         # Coming soon placeholder
│   │   └── settings/
│   │       ├── page.tsx         # Settings layout with tabs
│   │       ├── profile/
│   │       │   └── page.tsx     # "Mein Profil" - name, avatar, password
│   │       └── team/
│   │           └── page.tsx     # "Team" - admin-only user management
│   ├── login/
│   │   └── page.tsx             # Login page (public)
│   ├── auth/
│   │   ├── confirm/
│   │   │   └── route.ts        # Email confirmation callback
│   │   └── set-password/
│   │       └── page.tsx         # Set password after invite
│   ├── api/
│   │   └── admin/
│   │       ├── invite/
│   │       │   └── route.ts    # POST: invite user (service role)
│   │       └── users/
│   │           └── route.ts    # PATCH: update role, deactivate
│   ├── layout.tsx               # Root layout (fonts, providers)
│   └── globals.css              # Tailwind + design tokens
├── components/
│   ├── ui/                      # shadcn/ui components (auto-generated)
│   ├── layout/
│   │   ├── app-sidebar.tsx      # Sidebar with nav items
│   │   ├── app-header.tsx       # Header bar
│   │   ├── mobile-nav.tsx       # Bottom nav for mobile
│   │   └── brand-logo.tsx       # hitschies logo component
│   ├── auth/
│   │   ├── login-form.tsx       # Email + password form
│   │   └── set-password-form.tsx
│   ├── settings/
│   │   ├── profile-form.tsx     # Profile edit form
│   │   ├── team-list.tsx        # User list with role management
│   │   └── invite-dialog.tsx    # Invite new member dialog
│   └── shared/
│       ├── coming-soon.tsx      # Branded placeholder page
│       └── onboarding-checklist.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts            # Browser client (createBrowserClient)
│   │   ├── server.ts            # Server client (createServerClient)
│   │   ├── middleware.ts        # updateSession helper
│   │   ├── admin.ts             # Service role client (for admin API routes)
│   │   └── types.ts             # Generated DB types (supabase gen types)
│   └── utils/
│       ├── cn.ts                # clsx + tailwind-merge utility
│       └── constants.ts         # Nav items, role definitions, brand values
├── hooks/
│   ├── use-user.ts              # Current user + profile hook
│   └── use-require-role.ts      # Role guard hook
├── stores/
│   └── ui-store.ts              # Sidebar state, UI preferences
├── middleware.ts                 # Next.js middleware (auth token refresh)
└── styles/
    └── globals.css              # Design tokens + Tailwind base
```

### Pattern 1: Supabase Auth Middleware (Token Refresh)
**What:** Middleware intercepts every request, refreshes expired auth tokens, and writes updated cookies
**When to use:** Always -- required for Supabase SSR auth to work correctly

```typescript
// src/middleware.ts
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

```typescript
// src/lib/supabase/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options))
        },
      },
    }
  )

  // IMPORTANT: use getUser(), not getSession()
  const { data: { user } } = await supabase.auth.getUser()

  // Redirect unauthenticated users to login
  if (!user && !request.nextUrl.pathname.startsWith('/login')
      && !request.nextUrl.pathname.startsWith('/auth')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
```

### Pattern 2: Admin API Route with Service Role Key
**What:** Server-side API routes use service_role key for admin operations (invite users, change roles)
**When to use:** Any admin action that requires elevated privileges

```typescript
// src/lib/supabase/admin.ts
import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
```

```typescript
// src/app/api/admin/invite/route.ts
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  // Verify caller is admin
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { email, full_name, role } = await request.json()

  // Use admin client to invite
  const admin = createAdminClient()
  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { full_name, role }, // stored in user_metadata, picked up by trigger
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/set-password`,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}
```

### Pattern 3: Database Trigger for Profile Creation
**What:** Automatically creates a profiles row when a new user signs up or is invited
**When to use:** Always -- ensures profiles table stays in sync with auth.users

```sql
-- In migration file
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'editor')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Pattern 4: RLS Policies with Role Checks
**What:** Row-level security policies that check the user's role from the profiles table
**When to use:** Every table that needs role-based access control

```sql
-- Helper function to get current user's role (cache-friendly)
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT role FROM public.profiles WHERE id = (SELECT auth.uid())
$$;

-- Example: profiles table policies
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

-- General pattern for content tables (posts, campaigns, etc.)
-- SELECT: all authenticated users can read
CREATE POLICY "table_select" ON public.posts
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- INSERT: editors and admins can create
CREATE POLICY "table_insert" ON public.posts
  FOR INSERT WITH CHECK (public.get_user_role() IN ('admin', 'editor'));

-- UPDATE: editors can update own, admins can update all
CREATE POLICY "table_update" ON public.posts
  FOR UPDATE USING (
    public.get_user_role() = 'admin'
    OR (public.get_user_role() = 'editor' AND created_by = (SELECT auth.uid()))
  );

-- DELETE: admins only
CREATE POLICY "table_delete" ON public.posts
  FOR DELETE USING (public.get_user_role() = 'admin');
```

### Pattern 5: Tailwind CSS v4 Design Tokens
**What:** Brand design tokens configured via CSS-first Tailwind v4 @theme
**When to use:** globals.css -- defines all hitschies brand values

```css
/* src/app/globals.css */
@import "tailwindcss";

@theme {
  /* hitschies Magenta Primary */
  --color-primary-50: #FFF0F6;
  --color-primary-100: #FFD6E8;
  --color-primary-200: #FFB3D4;
  --color-primary-300: #FF80BA;
  --color-primary-400: #FF4D9F;
  --color-primary-500: #E6007E;
  --color-primary-600: #CC006F;
  --color-primary-700: #A30059;
  --color-primary-800: #7A0043;
  --color-primary-900: #52002D;

  /* hitschies Blue Secondary */
  --color-secondary-500: #0073CF;

  /* Neutral palette */
  --color-neutral-50: #F8FAFC;
  --color-neutral-100: #F1F5F9;
  --color-neutral-200: #E2E8F0;
  --color-neutral-300: #CBD5E1;
  --color-neutral-400: #94A3B8;
  --color-neutral-500: #64748B;
  --color-neutral-600: #475569;
  --color-neutral-700: #334155;
  --color-neutral-800: #1E293B;
  --color-neutral-900: #0F172A;

  /* Radius */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;

  /* Fonts */
  --font-display: var(--font-jakarta), var(--font-inter), sans-serif;
  --font-body: var(--font-inter), var(--font-jakarta), sans-serif;
}
```

### Anti-Patterns to Avoid
- **Using getSession() in server code:** Always use getUser() -- getSession() does not revalidate the JWT
- **Exposing service_role key to the browser:** Admin operations MUST happen in API routes, never in client components
- **Storing role in JWT claims:** User metadata in JWT can be stale; always query profiles table for current role
- **Mixing RLS with client-side role checks only:** RLS is the real security layer; client-side checks are UX convenience only
- **Creating custom auth flows without @supabase/ssr:** The cookie-based approach in @supabase/ssr handles all the edge cases (token refresh, SSR hydration, etc.)

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Auth session management | Custom JWT/cookie logic | @supabase/ssr middleware pattern | Token refresh, cookie sync, SSR hydration are surprisingly complex |
| Component library | Custom buttons, inputs, modals | shadcn/ui + Tailwind | Accessible, theme-able, copy-paste ownership |
| UUID generation | Custom ID schemes | gen_random_uuid() in Postgres | Built-in, no extension needed, v4 by default |
| Form validation | Manual if/else checks | zod schemas + shadcn/ui form | Type-safe, composable, reusable |
| Role-based routing | Custom middleware role checks | RLS policies + UI-level guards | Database is the source of truth; UI just hides/shows |
| Toast notifications | Custom notification system | sonner (via shadcn/ui) | Accessible, animated, zero config |
| Font loading | Manual @font-face | next/font/google | Self-hosting, zero layout shift, automatic subsetting |
| CSS utility merging | Manual className concatenation | cn() with clsx + tailwind-merge | Handles Tailwind class conflicts correctly |

**Key insight:** Supabase provides auth, database, storage, and RLS as integrated services. Hand-rolling any of these loses the tight integration and creates maintenance burden.

## Common Pitfalls

### Pitfall 1: Forgot to Call getUser() in Middleware
**What goes wrong:** Using getSession() in middleware means the auth token might be stale/invalid, allowing unauthorized access
**Why it happens:** getSession() reads from local storage/cookie without server validation; older tutorials show getSession()
**How to avoid:** Always use supabase.auth.getUser() in server-side code -- it validates the JWT against the Supabase Auth server
**Warning signs:** Users remaining logged in after their session should have expired; inconsistent auth state between tabs

### Pitfall 2: Profile Trigger Blocks Signups
**What goes wrong:** If the handle_new_user() trigger throws an error, the entire signup/invite transaction rolls back -- user cannot be created
**Why it happens:** COALESCE missing for required fields, constraint violations, or trigger function has a bug
**How to avoid:** Test trigger thoroughly; use COALESCE with sensible defaults; handle edge cases (null metadata); test with invite flow specifically
**Warning signs:** "Unable to create user" errors in Supabase logs

### Pitfall 3: RLS Policies Returning No Data
**What goes wrong:** Queries return empty results even though data exists in the table
**Why it happens:** RLS is enabled but policies are missing or too restrictive; forgot to add SELECT policy
**How to avoid:** Always add at minimum a SELECT policy for authenticated users on every table; test with each role
**Warning signs:** Dashboard shows data but app shows empty; switching to service_role key "fixes" the issue

### Pitfall 4: ANON_KEY vs PUBLISHABLE_KEY Naming
**What goes wrong:** Environment variable named wrong, Supabase client fails silently
**Why it happens:** Supabase recently renamed ANON_KEY to PUBLISHABLE_KEY in docs; older tutorials use the old name
**How to avoid:** Use NEXT_PUBLIC_SUPABASE_ANON_KEY (still works) but be aware both names refer to the same key; pick one and be consistent
**Warning signs:** 401 errors or "No API key found" errors

### Pitfall 5: Last-Admin Safeguard Missing
**What goes wrong:** Admin demotes themselves or last admin, locking everyone out of admin functions
**Why it happens:** No server-side check before role change
**How to avoid:** In the role-update API route, count admins before allowing demotion: `SELECT count(*) FROM profiles WHERE role = 'admin' AND id != target_user_id`
**Warning signs:** Zero admins in the system; no one can invite new users or change roles

### Pitfall 6: Tailwind v4 Config Confusion
**What goes wrong:** Trying to use tailwind.config.ts with Tailwind v4, or v3 class syntax that changed
**Why it happens:** Most online examples still show v3 config file approach
**How to avoid:** Use @theme in CSS for all customization; no tailwind.config.ts file needed in v4. shadcn CLI v4 handles this correctly.
**Warning signs:** Custom colors not applying; build warnings about unknown config

## Code Examples

### Browser Supabase Client
```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### Server Supabase Client
```typescript
// src/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './types'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options))
          } catch {
            // Called from Server Component -- ignore
          }
        },
      },
    }
  )
}
```

### Next.js Font Setup
```typescript
// src/app/layout.tsx
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${inter.variable} ${jakarta.variable}`}>
      <body className="font-body antialiased">{children}</body>
    </html>
  )
}
```

### cn() Utility
```typescript
// src/lib/utils/cn.ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### Admin Seed Migration
```sql
-- supabase/seed.sql (runs after migrations)
-- Seed first admin user (Ersin)
-- Note: This creates the auth.users entry; the trigger creates the profile
INSERT INTO auth.users (
  id, email, encrypted_password, email_confirmed_at,
  raw_user_meta_data, role, aud, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'ersin@hitschies.de',
  crypt('CHANGE_ME_ON_FIRST_LOGIN', gen_salt('bf')),
  NOW(),
  '{"full_name": "Ersin Kurt", "role": "admin"}'::jsonb,
  'authenticated',
  'authenticated',
  NOW(),
  NOW()
);

-- Seed demo data
INSERT INTO public.campaigns (name, slug, color, description, start_date, end_date) VALUES
  ('Karneval 2026', 'karneval-2026', '#FF6B35', 'Karnevalskampagne', '2026-02-01', '2026-02-28'),
  ('Sommer 2026', 'sommer-2026', '#FFD600', 'Sommerkampagne', '2026-06-01', '2026-08-31');

INSERT INTO public.hashtag_sets (name, hashtags, category) VALUES
  ('hitschies Standard', ARRAY['#hitschies', '#hitschiescandy', '#suessigkeiten'], 'brand'),
  ('Karneval', ARRAY['#karneval', '#karneval2026', '#alaaf', '#helau', '#hitschies'], 'campaign');
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| @supabase/auth-helpers | @supabase/ssr | 2024 | Must use SSR package; auth-helpers is deprecated |
| tailwind.config.ts | @theme in CSS (Tailwind v4) | Jan 2025 | No config file needed; CSS-first approach |
| uuid-ossp extension | gen_random_uuid() built-in | Always existed, now recommended | Simpler, no extension dependency |
| getSession() for auth checks | getUser() for server-side | 2024 | Security fix: getUser() validates JWT server-side |
| shadcn init (v3) | shadcn@latest init (CLI v4) | Mar 2026 | New CLI with Tailwind v4 support, design presets |
| Next.js 14 | Next.js 15.5 | 2025 | React 19, Turbopack stable, improved TypeScript |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY | 2025 | Both work; publishable_key is new naming |

**Deprecated/outdated:**
- `@supabase/auth-helpers-nextjs`: Replaced by `@supabase/ssr`, do not use
- `tailwind.config.ts` (for Tailwind v4): Use CSS @theme instead
- `supabase.auth.getSession()` in server code: Use `getUser()` instead
- `uuid_generate_v4()`: Works but `gen_random_uuid()` is preferred (no extension)

## Open Questions

1. **Supabase Project Setup**
   - What we know: Need a Supabase project with auth, database, and storage enabled
   - What's unclear: Whether the team already has a Supabase project or needs to create one; which Supabase plan (Free vs Pro)
   - Recommendation: Assume Pro plan (~$25/month) as stated in PROJECT.md; create fresh project

2. **Email Template Customization**
   - What we know: Supabase sends invite emails; the template must be customized for the server-side auth flow (token_hash parameter)
   - What's unclear: Exact hitschies branding for emails (logo URL, colors)
   - Recommendation: Configure basic template with hitschies name; can be refined later. Critical: change confirmation URL to use `/auth/confirm?token_hash={{ .TokenHash }}&type=email` format

3. **Brand Assets (Logo, Favicon)**
   - What we know: hitschies logo needed for login page, sidebar, and favicon
   - What's unclear: Whether SVG logo files are available or need to be created
   - Recommendation: Create placeholder SVG logo with hitschies text in Magenta; replace with actual assets when provided

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 3.x + @testing-library/react |
| Config file | vitest.config.ts (Wave 0 creation) |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run --coverage` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AUTH-01 | Login form submits credentials and redirects on success | unit + integration | `npx vitest run src/__tests__/auth/login.test.ts -t "login"` | Wave 0 |
| AUTH-02 | Middleware refreshes session and redirects unauthenticated | unit | `npx vitest run src/__tests__/middleware.test.ts` | Wave 0 |
| AUTH-03 | Admin can invite user and change roles via API | integration | `npx vitest run src/__tests__/api/admin.test.ts` | Wave 0 |
| AUTH-04 | RLS policies enforce role-based access | integration | `npx vitest run src/__tests__/db/rls.test.ts` | Wave 0 |
| UX-01 | Sidebar renders all nav items and collapses | unit | `npx vitest run src/__tests__/components/sidebar.test.tsx` | Wave 0 |
| UX-04 | Design tokens applied (colors, fonts) | unit | `npx vitest run src/__tests__/components/theme.test.tsx` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npx vitest run --coverage`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `vitest.config.ts` -- Vitest configuration with Next.js plugin
- [ ] `src/__tests__/setup.ts` -- Test setup with jsdom, testing-library
- [ ] `src/__tests__/auth/login.test.ts` -- Login form tests
- [ ] `src/__tests__/middleware.test.ts` -- Middleware auth redirect tests
- [ ] `src/__tests__/api/admin.test.ts` -- Admin API route tests
- [ ] `src/__tests__/db/rls.test.ts` -- RLS policy verification (may need Supabase local dev)
- [ ] `src/__tests__/components/sidebar.test.tsx` -- Sidebar rendering and collapse
- [ ] `src/__tests__/components/theme.test.tsx` -- Design token verification
- [ ] Framework install: `npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom vite-tsconfig-paths @vitest/coverage-v8`

## Sources

### Primary (HIGH confidence)
- [Supabase Server-Side Auth for Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs) -- complete middleware + client setup
- [Supabase inviteUserByEmail API](https://supabase.com/docs/reference/javascript/auth-admin-inviteuserbyemail) -- admin invite flow
- [Supabase RLS docs](https://supabase.com/docs/guides/database/postgres/row-level-security) -- policy patterns
- [Supabase User Management (triggers)](https://supabase.com/docs/guides/auth/managing-user-data) -- profile trigger pattern
- [Next.js Vitest guide](https://nextjs.org/docs/app/guides/testing/vitest) -- test setup
- [Next.js Font Optimization](https://nextjs.org/docs/app/getting-started/fonts) -- next/font/google
- [Tailwind CSS v4 docs](https://tailwindcss.com/docs/guides/nextjs) -- CSS-first configuration
- [shadcn/ui Next.js install](https://ui.shadcn.com/docs/installation/next) -- CLI v4 setup

### Secondary (MEDIUM confidence)
- [shadcn CLI v4 changelog (Mar 2026)](https://ui.shadcn.com/docs/changelog/2026-03-cli-v4) -- latest CLI features
- [Supabase Storage Access Control](https://supabase.com/docs/guides/storage/security/access-control) -- bucket RLS patterns

### Tertiary (LOW confidence)
- Supabase seed.sql approach for first admin user -- common pattern but direct auth.users INSERT may need adjustment depending on Supabase version; alternative is using Dashboard to create first user manually

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries are well-documented with official docs verified
- Architecture: HIGH -- follows official Supabase + Next.js patterns from current documentation
- Pitfalls: HIGH -- drawn from official docs warnings and community patterns
- Auth flow (invite): MEDIUM -- inviteUserByEmail is documented but the "set password" redirect flow requires custom implementation
- Database seed: MEDIUM -- direct INSERT into auth.users works in local dev but production seeding may differ

**Research date:** 2026-03-13
**Valid until:** 2026-04-13 (stable ecosystem, 30-day validity)
