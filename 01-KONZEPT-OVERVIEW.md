# hitschies Content Planner — Produktkonzept

> **Internes Tool zur Ablösung von swat.io**
> Codename: **hitschies Publisher**
> Version: 1.0 | Stand: März 2026

---

## 1. Executive Summary

hitschies nutzt aktuell **swat.io** (ab €35/Monat, realistische Kosten bei mehreren Kanälen + Usern: €200–500+/Monat) für die Social-Media-Content-Planung. Ein eigenes, maßgeschneidertes Tool soll:

- **Lizenzkosten eliminieren** (ROI nach ~3–6 Monaten Entwicklung)
- **URL-Link-Automatisierung** einführen (aktuell manueller Prozess)
- **hitschies-Branding** durchgängig abbilden
- **Genau die Features** bereitstellen, die hitschies tatsächlich nutzt — ohne Overhead
- **Nahtlos in bestehende Infrastruktur** integrieren (Microsoft Fabric, n8n, Meta Graph API, TikTok API)

---

## 2. Problemanalyse: Was fehlt bei swat.io?

### 2.1 Manuelle URL-Link-Prozesse
Der größte Pain Point: Wenn Posts URL-Links enthalten sollen (z.B. Link-in-Bio, Kampagnen-URLs, UTM-Parameter), müssen diese **manuell** hinzugefügt und gepflegt werden. Das betrifft:

- **UTM-Parameter-Generierung**: Jeder Link braucht campaign, source, medium Tags
- **Link-in-Bio-Updates**: Bei Instagram muss der Bio-Link manuell aktualisiert werden, wenn ein neuer Post mit Link-Referenz live geht
- **Short-Link-Erstellung**: Keine integrierte URL-Verkürzung mit Tracking
- **Link-Konsistenz**: Kein zentrales Link-Management über Posts hinweg
- **Kampagnen-Zuordnung**: Links werden nicht automatisch Kampagnen zugewiesen

### 2.2 Weitere swat.io-Limitierungen (aus Reviews)
- Eingeschränkte Analytics-Visualisierung
- Interaktionsrate wird auf Follower statt Reichweite berechnet
- Nicht alle Content-Formate planbar (z.B. Stories eingeschränkt)
- Keine Carousel-Vorschau
- API-Token-Probleme (Meta Business Suite)
- Mobile App eingeschränkt
- Pricing-Modell starr (nach Community-Größe)

---

## 3. Feature-Scope: Was wird gebaut?

### 3.1 Core Features (MVP — Phase 1)

| Feature | Beschreibung | Priorität |
|---------|-------------|-----------|
| **Redaktionskalender** | Monats-, Wochen-, Tagesansicht mit Drag & Drop | P0 |
| **Post Composer** | Multi-Channel-Post-Erstellung mit plattformspezifischen Anpassungen | P0 |
| **URL-Link-Automation** | UTM-Builder, Auto-Shortlinks, Link-in-Bio-Management | P0 |
| **Media Library** | Upload, Tagging, Wiederverwendung von Assets | P0 |
| **Kanal-Management** | Instagram, Facebook, TikTok, LinkedIn, YouTube | P0 |
| **Post-Status-Workflow** | Entwurf → In Review → Freigegeben → Geplant → Veröffentlicht | P0 |
| **Entwürfe & Ideen-Board** | Kanban-Board für Content-Ideen | P1 |
| **Kampagnen-Tagging** | Posts Kampagnen zuordnen (Karneval, Halloween, Weihnachten, etc.) | P1 |

### 3.2 URL-Link-Automation im Detail (Killer Feature)

```
┌─────────────────────────────────────────────────────────┐
│                   URL LINK ENGINE                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. UTM-PARAMETER-BUILDER                               │
│     ├─ Vordefinierte Kampagnen-Templates                │
│     ├─ Auto-Fill: source=instagram, medium=social       │
│     ├─ Kampagnen-Name aus Post-Kampagne übernehmen      │
│     └─ Custom Parameters pro Plattform                  │
│                                                         │
│  2. SMART SHORT-LINKS                                   │
│     ├─ Eigene Domain (z.B. link.hitschies.de)           │
│     ├─ Auto-Generierung beim Speichern eines Posts      │
│     ├─ Click-Tracking & Analytics                       │
│     └─ QR-Code-Generierung                              │
│                                                         │
│  3. LINK-IN-BIO MANAGER                                 │
│     ├─ Automatisches Update bei Post-Veröffentlichung   │
│     ├─ Eigene hitschies Landing Page                    │
│     ├─ Drag & Drop Link-Reihenfolge                     │
│     └─ Link-Ablaufdaten (z.B. für Gewinnspiele)         │
│                                                         │
│  4. LINK-BIBLIOTHEK                                     │
│     ├─ Zentrale Verwaltung aller Links                  │
│     ├─ Wiederverwendbare Link-Vorlagen                  │
│     ├─ Broken-Link-Detection                            │
│     └─ Performance-Übersicht pro Link                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Workflow-Beispiel "URL-Automatisierung":**

1. User erstellt einen Post für Instagram mit Produktlink
2. System erkennt die URL → bietet UTM-Template an
3. UTM-Parameter werden automatisch befüllt (Kampagne, Quelle, Medium)
4. Short-Link wird automatisch generiert (link.hitschies.de/abc123)
5. Wenn "Link in Bio aktualisieren" aktiviert → Bio-Link wird bei Veröffentlichung automatisch gesetzt
6. Click-Tracking beginnt sofort nach Veröffentlichung
7. Alle Daten fließen in die Link-Analytics-Übersicht

### 3.3 Extended Features (Phase 2)

| Feature | Beschreibung |
|---------|-------------|
| **AI Content Assistant** | Text-Vorschläge via Claude API, Hashtag-Generierung |
| **Best-Time-to-Post** | Heatmap basierend auf historischen Engagement-Daten |
| **Approval Workflow** | Mehrstufige Freigabeprozesse mit E-Mail-Benachrichtigung |
| **Analytics Dashboard** | Post-Performance, Reichweite, Engagement (Daten aus Fabric) |
| **Competitor Monitoring** | Trend-Erkennung (Integration mit n8n Trend Scout) |
| **Content Recycling** | Evergreen-Posts automatisch erneut einplanen |
| **Team-Inbox** | Kommentare & DMs zentral verwalten (Phase 3) |

### 3.4 Integrationen

| System | Zweck |
|--------|-------|
| **Meta Graph API** | Instagram & Facebook Publishing, Analytics |
| **TikTok Content Posting API** | TikTok Video-Upload & Scheduling |
| **LinkedIn API** | Company Page Publishing |
| **YouTube Data API** | Video-Upload-Planung |
| **Microsoft Fabric** | Analytics-Daten (Bronze/Silver/Gold) |
| **n8n** | Workflow-Automatisierung, Webhooks |
| **Supabase** | Backend, Auth, Realtime, Storage |
| **Unified Social API (Late/Ayrshare)** | Optional: Vereinfachte Multi-Plattform-API |

---

## 4. Technologie-Empfehlung

### 4.1 Tech Stack

```
Frontend:    React (Next.js) + TypeScript + Tailwind CSS
Backend:     Supabase (PostgreSQL, Auth, Storage, Edge Functions)
Deployment:  Vercel oder Azure Static Web Apps
APIs:        Meta Graph API, TikTok API, LinkedIn API
             Optional: Late.dev / Ayrshare als Unified Social API
Link-Engine: Custom Short-Link-Service (Supabase Edge Functions)
AI:          Claude API (Content-Vorschläge, Hashtags)
Analytics:   Microsoft Fabric (bestehende Pipelines nutzen)
Automation:  n8n (bestehende Instanz)
```

### 4.2 Warum dieser Stack?

- **Next.js + Supabase**: Schnelle Entwicklung, Realtime-Updates, Row-Level-Security
- **Supabase Auth**: SSO-fähig, Multi-User out of the box
- **Supabase Storage**: Media Library direkt integriert
- **Edge Functions**: Serverless Link-Shortener, Webhook-Handler
- **Late.dev als Option**: Unified API für Social Posting (ab $10/Monat) — spart enorme Entwicklungszeit vs. jede Plattform-API einzeln zu integrieren

### 4.3 Alternative: Self-Hosted Social APIs

Statt Late/Ayrshare kann hitschies die bestehenden API-Integrationen nutzen:
- **Meta Graph API**: Bereits im Einsatz (Instagram Analytics Pipeline)
- **TikTok API**: OAuth-Integration über Azure Function App vorhanden
- Vorteil: Keine zusätzlichen Kosten, volle Kontrolle
- Nachteil: Mehr Wartungsaufwand bei API-Changes

---

## 5. Datenmodell (High-Level)

```sql
-- Kernentitäten
channels          -- Social-Media-Kanäle (Instagram, TikTok, etc.)
posts             -- Geplante/veröffentlichte Posts
post_media        -- Medien-Assets pro Post
campaigns         -- Kampagnen (Karneval, Halloween, etc.)
links             -- Zentrale Link-Verwaltung
link_clicks       -- Click-Tracking für Short-Links
drafts            -- Ideen/Entwürfe (Kanban)
users             -- Team-Mitglieder
approval_logs     -- Freigabe-Historie
templates         -- Post-Vorlagen
hashtag_sets      -- Vordefinierte Hashtag-Gruppen

-- Link-Engine spezifisch
utm_templates     -- UTM-Parameter-Vorlagen
short_links       -- Generierte Kurzlinks
linkinbio_pages   -- Link-in-Bio Konfiguration
linkinbio_items   -- Einzelne Bio-Links
```

---

## 6. Abgrenzung: Was wird NICHT gebaut (Phase 1)?

- ❌ Vollständige Inbox/Community Management (→ Meta Business Suite nutzen)
- ❌ Social Listening / Monitoring (→ n8n Trend Scout)
- ❌ Umfassende Competitor-Analyse
- ❌ Influencer Management
- ❌ Social CRM
- ❌ Werbeanzeigen-Management (→ Meta Ads Manager)
- ❌ Native Mobile App (→ Responsive Web App reicht zunächst)

---

## 7. Roadmap

```
Phase 1 (MVP):     8–12 Wochen
├─ Redaktionskalender
├─ Post Composer (Instagram, Facebook, TikTok)
├─ URL-Link-Automation (UTM, Shortlinks)
├─ Media Library
├─ Basis-Workflow (Entwurf → Geplant → Veröffentlicht)
└─ Link-in-Bio Manager

Phase 2:           +4–6 Wochen
├─ AI Content Assistant
├─ Best-Time-to-Post
├─ Analytics Dashboard (Fabric-Anbindung)
├─ Kampagnen-Management erweitert
└─ LinkedIn & YouTube Integration

Phase 3:           +4–6 Wochen
├─ Team-Inbox (Kommentare/DMs)
├─ Approval Workflows (mehrstufig)
├─ Content Recycling
├─ WhatsApp Business Integration
└─ API für externe Tools
```

---

## 8. Kosten-Vergleich

| Position | swat.io (aktuell) | hitschies Publisher |
|----------|-------------------|---------------------|
| Lizenz/Monat | ~€200–500+ | €0 (self-hosted) |
| Supabase | — | ~€25/Monat (Pro) |
| Vercel/Hosting | — | ~€20/Monat |
| Late.dev (optional) | — | ~€10–50/Monat |
| Domain (Short-Links) | — | ~€1/Monat |
| **Gesamt/Monat** | **€200–500+** | **€56–96** |
| **Einsparung/Jahr** | — | **€1.200–4.800+** |

> **Break-Even**: Bei internem Entwicklungsaufwand (Claude Code + Ersin) amortisiert sich das Tool in 3–6 Monaten.

---

*Weiter in: `02-DESIGN-UX-KONZEPT.md`*
