# hitschies Content Planner — Design & UX Konzept

> **Design System & Interaction Patterns**
> Referenz-Dokument für Claude Code

---

## 1. Design-Philosophie

### Leitprinzip: "Playful Professional"

hitschies ist eine **bunte, junge, verspielte** Marke — aber das interne Tool muss trotzdem **effizient und übersichtlich** sein. Die Balance:

- **80% Clean & Functional**: Klare Typografie, viel Whitespace, intuitive Navigation
- **20% hitschies Personality**: Farbakzente, Micro-Interactions, Brand-Elemente
- Inspiration: Notion-artige Klarheit trifft Linear-artige Ästhetik trifft hitschies-Farben

### Referenz-Tools (UX-Inspiration)
- **Planable**: Kalender-UX, Post-Vorschau, Approval-Flow
- **Linear**: Minimalistische Navigation, Keyboard-Shortcuts, Speed
- **Notion**: Flexible Views (Kalender, Kanban, Liste), Drag & Drop
- **Metricool**: Best-Time-to-Post Heatmap im Kalender
- **Figma**: Sidebar-Navigation, Multi-Panel-Layout

---

## 2. Brand Design Tokens

### 2.1 Farbpalette

```css
/* ============================================
   hitschies CONTENT PLANNER — Design Tokens
   ============================================ */

:root {
  /* --- Primary: hitschies Magenta/Pink --- */
  --color-primary-50:  #FFF0F6;   /* Hintergrund-Tint */
  --color-primary-100: #FFD6E8;   /* Hover-States */
  --color-primary-200: #FFB3D4;   /* Light Accent */
  --color-primary-300: #FF80BA;   /* Secondary Buttons */
  --color-primary-400: #FF4D9F;   /* Active States */
  --color-primary-500: #E6007E;   /* ★ Primary Brand Color (hitschies Magenta) */
  --color-primary-600: #CC006F;   /* Hover auf Primary */
  --color-primary-700: #A30059;   /* Pressed State */
  --color-primary-800: #7A0043;   /* Dark Accent */
  --color-primary-900: #52002D;   /* Sehr dunkler Akzent */

  /* --- Secondary: hitschies Blau (historische "blaue Welle") --- */
  --color-secondary-50:  #EBF5FF;
  --color-secondary-100: #CCE5FF;
  --color-secondary-200: #99CCFF;
  --color-secondary-300: #66B2FF;
  --color-secondary-400: #3399FF;
  --color-secondary-500: #0073CF;   /* ★ Secondary Brand Color */
  --color-secondary-600: #005FA8;
  --color-secondary-700: #004C87;

  /* --- Kanal-Farben (Social Media Platforms) --- */
  --color-instagram:   #E4405F;
  --color-facebook:    #1877F2;
  --color-tiktok:      #000000;
  --color-linkedin:    #0A66C2;
  --color-youtube:     #FF0000;
  --color-threads:     #000000;
  --color-pinterest:   #E60023;

  /* --- Kampagnen-Farben (Saisonale Marker) --- */
  --color-campaign-karneval:    #FF6B35;   /* Orange */
  --color-campaign-ostern:      #7CB342;   /* Grün */
  --color-campaign-sommer:      #FFD600;   /* Gelb */
  --color-campaign-halloween:   #FF8F00;   /* Dunkelorange */
  --color-campaign-weihnachten: #C62828;   /* Rot */
  --color-campaign-default:     #7C4DFF;   /* Lila */

  /* --- Post-Status-Farben --- */
  --color-status-draft:     #94A3B8;   /* Grau — Entwurf */
  --color-status-review:    #F59E0B;   /* Amber — In Review */
  --color-status-approved:  #10B981;   /* Grün — Freigegeben */
  --color-status-scheduled: #3B82F6;   /* Blau — Geplant */
  --color-status-published: #8B5CF6;   /* Lila — Veröffentlicht */
  --color-status-failed:    #EF4444;   /* Rot — Fehler */

  /* --- Neutral (UI Chrome) --- */
  --color-neutral-0:   #FFFFFF;
  --color-neutral-50:  #F8FAFC;
  --color-neutral-100: #F1F5F9;
  --color-neutral-200: #E2E8F0;
  --color-neutral-300: #CBD5E1;
  --color-neutral-400: #94A3B8;
  --color-neutral-500: #64748B;
  --color-neutral-600: #475569;
  --color-neutral-700: #334155;
  --color-neutral-800: #1E293B;
  --color-neutral-900: #0F172A;

  /* --- Typografie --- */
  --font-display: 'Plus Jakarta Sans', 'Inter', sans-serif;
  --font-body:    'Inter', 'Plus Jakarta Sans', sans-serif;
  --font-mono:    'JetBrains Mono', 'Fira Code', monospace;

  /* --- Spacing (4px Base Grid) --- */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;

  /* --- Border Radius --- */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;

  /* --- Shadows --- */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);

  /* --- Dark Mode Overrides --- */
  /* TODO: Phase 2 — Dark Mode Support */
}
```

### 2.2 Typografie-Skala

```
Display:    Plus Jakarta Sans, 32px / 40px, Bold (700)
Heading 1:  Plus Jakarta Sans, 24px / 32px, SemiBold (600)
Heading 2:  Plus Jakarta Sans, 20px / 28px, SemiBold (600)
Heading 3:  Inter, 16px / 24px, SemiBold (600)
Body:       Inter, 14px / 20px, Regular (400)
Body Small: Inter, 13px / 18px, Regular (400)
Caption:    Inter, 12px / 16px, Medium (500)
Label:      Inter, 11px / 14px, SemiBold (600), UPPERCASE, letter-spacing: 0.5px
Mono:       JetBrains Mono, 13px / 18px, Regular (400)
```

### 2.3 Ikonografie

- **Primär**: Lucide Icons (Open Source, konsistent, React-ready)
- **Plattform-Logos**: Offizielle Brand-Logos (SVG)
- **Custom**: hitschies-spezifische Icons für Kampagnen (z.B. Drachenzunge für Halloween)

---

## 3. Layout & Navigation

### 3.1 App-Shell

```
┌──────────────────────────────────────────────────────────────────────┐
│  ┌──────┐  hitschies Publisher               🔔  👤 Ersin  ⚙️     │
│  │ LOGO │  ─────────────────────────────────────────────────────     │
├──┴──────┴──┬─────────────────────────────────────────────────────────┤
│            │                                                         │
│  📅 Kalender│  ┌─────────────────────────────────────────────────┐   │
│            │  │          MAIN CONTENT AREA                       │   │
│  ✏️ Composer│  │                                                 │   │
│            │  │  (Kalender / Composer / Media / Links / etc.)    │   │
│  📁 Media  │  │                                                 │   │
│            │  │                                                 │   │
│  🔗 Links  │  │                                                 │   │
│            │  │                                                 │   │
│  💡 Ideen  │  │                                                 │   │
│            │  │                                                 │   │
│  📊 Analytics│ │                                                 │   │
│            │  │                                                 │   │
│  🏷️ Kampagnen│ │                                                │   │
│            │  │                                                 │   │
│  ──────── │  └─────────────────────────────────────────────────┘   │
│  ⚙️ Settings│                                                       │
│            │                                                         │
└────────────┴─────────────────────────────────────────────────────────┘

Sidebar: 240px breit (collapsible auf 64px Icon-only)
Main Area: Flex, min 800px
```

### 3.2 Responsive Breakpoints

```
Desktop:  ≥1280px — Vollansicht mit Sidebar + Main
Tablet:   768–1279px — Sidebar collapsed (Icon-only), Main voll
Mobile:   <768px — Bottom-Navigation, Single-Column
```

---

## 4. Kernscreens — Detailed UX Specs

### 4.1 Redaktionskalender (Hauptansicht)

```
┌─────────────────────────────────────────────────────────────────┐
│  📅 Kalender                                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ ◀ März 2026 ▶     [Tag] [Woche] [Monat]    [+ Neuer Post]│   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │ Filter: [Alle Kanäle ▾] [Alle Status ▾] [Kampagne ▾]    │   │
│  ├───────┬───────┬───────┬───────┬───────┬───────┬───────  │   │
│  │  Mo   │  Di   │  Mi   │  Do   │  Fr   │  Sa   │  So     │   │
│  │       │       │       │       │       │       │         │   │
│  │       │ ┌───┐ │       │ ┌───┐ │       │       │         │   │
│  │       │ │📸 │ │       │ │🎬 │ │       │       │         │   │
│  │       │ │IG │ │       │ │TT │ │       │       │         │   │
│  │       │ │●● │ │       │ │●  │ │       │       │         │   │
│  │       │ └───┘ │       │ └───┘ │       │       │         │   │
│  │       │ ┌───┐ │       │       │       │       │         │   │
│  │       │ │📝 │ │       │       │       │       │         │   │
│  │       │ │LI │ │       │       │       │       │         │   │
│  │       │ │●  │ │       │       │       │       │         │   │
│  │       │ └───┘ │       │       │       │       │         │   │
│  ├───────┴───────┴───────┴───────┴───────┴───────┴───────  │   │
│  │ ... weitere Wochen                                       │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘

Legende (unter dem Kalender):
● Entwurf  ● Review  ● Freigegeben  ● Geplant  ● Live  ● Fehler
```

**Interaktionen:**
- **Klick auf Tag**: Quick-Add Post Popover
- **Klick auf Post-Card**: Slide-Over Panel mit Post-Details
- **Drag & Drop**: Post auf anderen Tag verschieben (Datum ändern)
- **Hover auf Post-Card**: Vorschau-Tooltip mit Bild + Caption-Snippet
- **Farbige Linke Bordüre**: Kanal-Farbe (IG=Rosa, TT=Schwarz, FB=Blau)
- **Status-Dots**: Kleine Punkte unter der Card zeigen Status

**Wochenansicht zusätzlich:**
- Zeitachse (08:00 – 22:00) vertikal
- Posts als Blöcke auf der Zeitachse
- Heatmap-Overlay: Best-Time-to-Post (Phase 2)

### 4.2 Post Composer

```
┌──────────────────────────────────────────────────────────────────────┐
│  ✏️ Neuer Post                                           [Speichern]│
│  ────────────────────────────────────────────────────────────────── │
│                                                                      │
│  ┌──────────────────────────┐  ┌──────────────────────────────────┐ │
│  │   EDITOR PANEL            │  │   VORSCHAU PANEL                │ │
│  │                           │  │                                  │ │
│  │  Kanäle: [IG] [FB] [TT]  │  │  ┌──────────────────────────┐  │ │
│  │                           │  │  │  📱 Instagram Preview     │  │ │
│  │  ┌─────────────────────┐  │  │  │  ┌────────────────────┐  │  │ │
│  │  │ Caption:            │  │  │  │  │                    │  │  │ │
│  │  │                     │  │  │  │  │   [Bild/Video]     │  │  │ │
│  │  │ Neuer hitschies     │  │  │  │  │                    │  │  │ │
│  │  │ Drop! 🔥 Sour       │  │  │  │  └────────────────────┘  │  │ │
│  │  │ Dragon Tongues jetzt│  │  │  │  hitschies.official      │  │ │
│  │  │ in allen Supermärkt.│  │  │  │  Neuer hitschies Drop!   │  │ │
│  │  │                     │  │  │  │  🔥 Sour Dragon...       │  │ │
│  │  │ 🔗 Link einfügen    │  │  │  │  #hitschies #sour       │  │ │
│  │  └─────────────────────┘  │  │  └──────────────────────────┘  │ │
│  │                           │  │                                  │ │
│  │  📎 Medien hinzufügen     │  │  [IG] [FB] [TT] ← Tab-Switch   │ │
│  │  🔗 Link mit UTM          │  │                                  │ │
│  │  #️⃣  Hashtags              │  │                                  │ │
│  │  📅 Planen: 15.03 · 14:00 │  │                                  │ │
│  │  🏷️ Kampagne: Frühling     │  │                                  │ │
│  │  👤 Zuweisen: @Marketing   │  │                                  │ │
│  │                           │  │                                  │ │
│  │  ┌─ URL-Link-Automation ─┐│  │                                  │ │
│  │  │ URL: hitschies.de/... ││  │                                  │ │
│  │  │ UTM: ✅ auto-generated ││  │                                  │ │
│  │  │ Short: link.h.de/x3f ││  │                                  │ │
│  │  │ Bio: ☐ Update Bio-Link││  │                                  │ │
│  │  └───────────────────────┘│  │                                  │ │
│  └──────────────────────────┘  └──────────────────────────────────┘ │
│                                                                      │
│  [Als Entwurf]  [Zur Freigabe]  [Planen & Veröffentlichen]         │
└──────────────────────────────────────────────────────────────────────┘
```

**Interaktionen:**
- **Kanal-Tabs**: Plattform-spezifische Caption-Anpassung (TikTok kürzer, LinkedIn professioneller)
- **AI-Button** (🤖): Claude API generiert Caption-Vorschläge basierend auf Medien + Kampagne
- **Link-Einfügen**: Automatische UTM-Erkennung, Short-Link-Generierung
- **Preview**: Live-Update bei jeder Textänderung, plattformspezifisches Rendering
- **Character Count**: Zeigt verbleibende Zeichen pro Plattform an
- **Hashtag-Vorschläge**: Basierend auf Kampagne + Content-Typ

### 4.3 URL-Link-Manager

```
┌──────────────────────────────────────────────────────────────────┐
│  🔗 Link Manager                                    [+ Neuer Link]│
│  ──────────────────────────────────────────────────────────────── │
│                                                                    │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  TAB: [Alle Links] [Link-in-Bio] [UTM Templates] [Analytics]│  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  🔍 Suche...                    [Kampagne ▾] [Zeitraum ▾]        │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │ Original URL          Short Link          Clicks  Status  │   │
│  ├────────────────────────────────────────────────────────────┤   │
│  │ hitschies.de/dragon    link.h.de/dra26     1.284   ✅ Aktiv │   │
│  │ ├─ UTM: karneval / instagram / social                      │   │
│  │ ├─ Kampagne: Karneval 2026                                 │   │
│  │ └─ Verwendet in: 3 Posts                                   │   │
│  ├────────────────────────────────────────────────────────────┤   │
│  │ hitschies.de/crunchies link.h.de/cru25     3.891   ✅ Aktiv │   │
│  │ ├─ UTM: crunchies_launch / tiktok / social                 │   │
│  │ ├─ Kampagne: Crunchies Launch                              │   │
│  │ └─ Verwendet in: 7 Posts                                   │   │
│  ├────────────────────────────────────────────────────────────┤   │
│  │ hitschies.de/gewinn    link.h.de/win26     892     ⏰ Läuft │   │
│  │ ├─ UTM: gewinnspiel_q1 / instagram / social                │   │
│  │ ├─ Kampagne: Gewinnspiel Q1                                │   │
│  │ ├─ Ablaufdatum: 31.03.2026                                 │   │
│  │ └─ Verwendet in: 2 Posts                                   │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                    │
│  ┌─ Link-in-Bio Editor ──────────────────────────────────────┐   │
│  │                                                            │   │
│  │  📱 Vorschau                  ↕️ Drag to Reorder           │   │
│  │  ┌──────────────────┐                                      │   │
│  │  │  hitschies.de     │        1. 🔥 Neue Crunchies         │   │
│  │  │  ──────────────── │        2. 🎉 Gewinnspiel            │   │
│  │  │  🔥 Crunchies     │        3. 🛒 Online Shop            │   │
│  │  │  🎉 Gewinnspiel   │        4. 📱 TikTok                 │   │
│  │  │  🛒 Shop          │        5. 💼 Karriere               │   │
│  │  │  📱 TikTok        │                                      │   │
│  │  │  💼 Karriere      │        [+ Link hinzufügen]          │   │
│  │  └──────────────────┘                                      │   │
│  │                                                            │   │
│  │  Auto-Update: ✅ Bei neuem Post mit Link → an Pos. 1      │   │
│  └────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### 4.4 UTM-Builder (Modal/Drawer)

```
┌──────────────────────────────────────────────────────────┐
│  🔗 UTM-Parameter konfigurieren                    [✕]  │
│  ──────────────────────────────────────────────────────  │
│                                                          │
│  Ziel-URL:                                               │
│  ┌────────────────────────────────────────────────────┐  │
│  │ https://hitschies.de/products/sour-dragon-tongues  │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  Template: [Kampagnen-Post ▾]  ← Vordefinierte Presets   │
│                                                          │
│  utm_source:    [instagram     ▾]  ← Auto aus Kanal      │
│  utm_medium:    [social        ▾]  ← Auto                │
│  utm_campaign:  [karneval_2026    ]  ← Aus Kampagne      │
│  utm_content:   [feed_post_0315  ]  ← Auto generiert     │
│  utm_term:      [                ]  ← Optional            │
│                                                          │
│  ──── Vorschau ────                                      │
│  hitschies.de/products/sour-dragon-tongues               │
│  ?utm_source=instagram&utm_medium=social                 │
│  &utm_campaign=karneval_2026&utm_content=feed_post_0315  │
│                                                          │
│  ──── Short Link ────                                    │
│  🔗 link.hitschies.de/dra26  [📋 Copy]  [QR ⬇️]         │
│                                                          │
│  ☐ Link-in-Bio automatisch aktualisieren                 │
│  ☐ Click-Tracking aktivieren                             │
│                                                          │
│            [Abbrechen]  [Link übernehmen]                │
└──────────────────────────────────────────────────────────┘
```

### 4.5 Ideen-Board (Kanban)

```
┌──────────────────────────────────────────────────────────────────┐
│  💡 Ideen-Board                                   [+ Neue Idee] │
│  ──────────────────────────────────────────────────────────────  │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ 💭 Idee   │  │ 📝 In     │  │ ✅ Bereit  │  │ 📅 Geplant│       │
│  │           │  │ Bearbeitung│ │           │  │           │       │
│  │ ┌──────┐ │  │ ┌──────┐ │  │ ┌──────┐ │  │ ┌──────┐ │       │
│  │ │Behind│ │  │ │Easter│ │  │ │Rezept│ │  │ │Karni-│ │       │
│  │ │Scenes│ │  │ │Egg   │ │  │ │Video │ │  │ │val   │ │       │
│  │ │Video │ │  │ │Hunt  │ │  │ │Reel  │ │  │ │Post  │ │       │
│  │ │🏷️ TikTok│ │ │🏷️ IG  │ │  │🏷️ IG  │ │  │🏷️ Alle│ │       │
│  │ └──────┘ │  │ └──────┘ │  │ └──────┘ │  │ └──────┘ │       │
│  │ ┌──────┐ │  │          │  │          │  │          │       │
│  │ │User  │ │  │          │  │          │  │          │       │
│  │ │Gene- │ │  │          │  │          │  │          │       │
│  │ │rated │ │  │          │  │          │  │          │       │
│  │ └──────┘ │  │          │  │          │  │          │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### 4.6 Media Library

```
┌──────────────────────────────────────────────────────────────────┐
│  📁 Media Library                      [📤 Upload]  [🔍 Suche]  │
│  ──────────────────────────────────────────────────────────────  │
│                                                                  │
│  Filter: [Alle Typen ▾] [Tags ▾] [Kampagne ▾]  Ansicht: ▦ ☰   │
│                                                                  │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐       │
│  │        │ │        │ │        │ │        │ │        │       │
│  │  🖼️    │ │  🖼️    │ │  🎬    │ │  🖼️    │ │  🎬    │       │
│  │        │ │        │ │        │ │        │ │        │       │
│  ├────────┤ ├────────┤ ├────────┤ ├────────┤ ├────────┤       │
│  │Dragon  │ │Crunchie│ │BTS Vid │ │Pack    │ │Reel    │       │
│  │Tongues │ │s Hero  │ │Prod.   │ │shot    │ │Easter  │       │
│  │1080x10.│ │1080x10.│ │16:9    │ │1200x   │ │9:16    │       │
│  │🏷️ Prod.│ │🏷️ Prod.│ │🏷️ BTS  │ │🏷️ Pack.│ │🏷️ Seas.│       │
│  │Used: 3x│ │Used: 5x│ │Used: 1x│ │Used: 2x│ │Used: 0x│       │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘       │
│                                                                  │
│  Drag & Drop zum Hochladen oder [Aus Dropbox / Google Drive]    │
└──────────────────────────────────────────────────────────────────┘
```

---

## 5. Komponenten-Bibliothek

### 5.1 Post Card (Kalender-Ansicht)

```
┌─────────────────────────┐
│▌ [Thumbnail]  14:00     │  ← Linke Bordüre = Kanal-Farbe
│▌ Caption-Snippet...     │  ← Max 2 Zeilen
│▌ 📸 IG · ● Geplant      │  ← Kanal-Icon + Status
│▌ 🏷️ Karneval             │  ← Kampagnen-Tag (optional)
└─────────────────────────┘
Größe: ~180x100px
Border-left: 3px solid var(--color-instagram)
Background: var(--color-neutral-0)
Shadow: var(--shadow-sm)
Hover: var(--shadow-md) + leichter scale(1.02)
```

### 5.2 Button-Varianten

```
Primary:    bg: var(--color-primary-500), text: white, radius: var(--radius-md)
            hover: var(--color-primary-600)
            Beispiel: "Planen & Veröffentlichen"

Secondary:  bg: transparent, border: 1px var(--color-neutral-300), text: var(--color-neutral-700)
            hover: bg var(--color-neutral-50)
            Beispiel: "Als Entwurf"

Ghost:      bg: transparent, text: var(--color-primary-500)
            hover: bg var(--color-primary-50)
            Beispiel: "Abbrechen"

Danger:     bg: var(--color-status-failed), text: white
            Beispiel: "Löschen"

Alle Buttons: h: 36px, px: 16px, font: 14px SemiBold, transition: 150ms ease
```

### 5.3 Status Badge

```
┌──────────┐
│ ● Status │   Höhe: 24px, Radius: var(--radius-full)
└──────────┘   Font: 12px Medium, padding: 0 8px
               Dot: 6px circle, margin-right: 4px
               
Entwurf:     bg: neutral-100,  dot: neutral-400, text: neutral-600
In Review:   bg: amber-50,     dot: amber-500,   text: amber-700
Freigegeben: bg: green-50,     dot: green-500,    text: green-700
Geplant:     bg: blue-50,      dot: blue-500,     text: blue-700
Veröffentl.: bg: purple-50,    dot: purple-500,   text: purple-700
Fehler:      bg: red-50,       dot: red-500,      text: red-700
```

### 5.4 Kanal-Chip

```
┌──────────────┐
│ [Icon] Name  │   Höhe: 28px, Radius: var(--radius-sm)
└──────────────┘   Icon: 16x16px Platform Logo
                   Font: 13px Medium
                   Border: 1px solid platform-color (20% opacity)
                   Background: platform-color (5% opacity)
```

---

## 6. Micro-Interactions & Animations

### 6.1 Generelle Prinzipien
- **Transition-Duration**: 150ms für UI-States, 300ms für Panel-Transitions
- **Easing**: `cubic-bezier(0.4, 0, 0.2, 1)` (Material Design Standard)
- **Kein Overuse**: Animationen nur wo sie UX verbessern

### 6.2 Spezifische Animationen

| Element | Animation | Dauer |
|---------|-----------|-------|
| Post-Card Drag | Leichter Schatten + Rotation (2°) | 200ms |
| Kalender-Monatswechsel | Slide left/right | 300ms |
| Modal öffnen | Scale von 95% → 100% + Fade | 200ms |
| Toast-Notification | Slide-in von rechts + Auto-dismiss | 300ms in, 5s display |
| Status-Änderung | Color-Morph + Confetti (nur bei "Veröffentlicht") | 400ms |
| Link generiert | Short-Link pulsiert kurz grün | 600ms |
| Sidebar collapse | Width-Animation + Icon-Rotation | 200ms |

### 6.3 hitschies Personality-Moments

Ganz gezielte "Freude-Momente", die die Marke transportieren:

1. **Post veröffentlicht**: Kleine Konfetti-Animation (Candy-Farben: Pink, Blau, Gelb, Grün)
2. **1000 Clicks erreicht**: 🎉 Celebration Badge mit hitschies-Farben
3. **Leerer Kalender**: Illustration "Keine Posts geplant — Zeit für frische Ideen! 🍬"
4. **Loading States**: Statt Spinner eine kleine hitschies-Dragee-Animation (bouncing dots in Brand-Farben)

---

## 7. Empty States & Onboarding

### 7.1 Leerer Kalender
```
       ┌─────────────────────────────┐
       │                             │
       │     🍬  📅  ✨               │
       │                             │
       │   Dein Kalender ist noch    │
       │   leer — Zeit zum Naschen!  │
       │                             │
       │   [+ Ersten Post erstellen] │
       │                             │
       └─────────────────────────────┘
```

### 7.2 Erste Schritte (Onboarding-Checklist)
```
Willkommen im hitschies Publisher! 🎉

☐ Social-Media-Kanäle verbinden
☐ Ersten Post erstellen
☐ UTM-Template einrichten
☐ Link-in-Bio konfigurieren
☐ Kampagne anlegen

Fortschritt: ████░░░░░░ 40%
```

---

## 8. Keyboard Shortcuts

| Shortcut | Aktion |
|----------|--------|
| `N` | Neuer Post |
| `I` | Neue Idee |
| `K` | Kalender-Ansicht |
| `⌘/Ctrl + Enter` | Post speichern/planen |
| `⌘/Ctrl + Shift + P` | Vorschau Toggle |
| `←` `→` | Vorheriger/Nächster Monat |
| `/` | Suche fokussieren |
| `Esc` | Modal/Panel schließen |

---

## 9. Accessibility

- **WCAG 2.1 AA** als Mindeststandard
- Alle interaktiven Elemente mit `aria-label`
- Farbkontraste: Mindestens 4.5:1 für Text, 3:1 für Large Text
- Focus-States: Sichtbarer Ring (2px solid var(--color-primary-500), offset 2px)
- Screen-Reader-Support für Kalender-Navigation
- Reduced-Motion-Support: `@media (prefers-reduced-motion: reduce)`

---

*Weiter in: `03-TECHNISCHE-SPECS.md`*
