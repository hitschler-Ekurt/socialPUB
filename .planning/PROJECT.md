# hitschies Publisher

## What This Is

Ein internes Social-Media-Content-Planungstool fuer hitschies, das swat.io als Planungsloesung abloest. Der Publisher ermoeglicht dem Marketing-Team (3-5 Personen) die zentrale Planung, Erstellung und Veroeffentlichung von Social-Media-Content fuer Instagram und TikTok, mit einer einzigartigen URL-Link-Automation-Engine (UTM-Builder, Short-Links, Link-in-Bio-Management).

## Core Value

Das Marketing-Team kann Posts fuer Instagram und TikTok in einem einzigen Tool planen, erstellen und automatisch veroeffentlichen — mit integrierter URL-Link-Automation, die manuelle UTM-/Shortlink-/Bio-Link-Prozesse eliminiert.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

(None yet — ship to validate)

### Active

<!-- Current scope. Building toward these. -->

- [ ] Redaktionskalender mit Monats-, Wochen- und Tagesansicht inkl. Drag & Drop
- [ ] Post Composer mit plattformspezifischen Anpassungen (Instagram, TikTok)
- [ ] URL-Link-Automation: UTM-Builder mit Templates und Auto-Fill
- [ ] URL-Link-Automation: Smart Short-Links mit eigener Domain (link.hitschies.de)
- [ ] URL-Link-Automation: Link-in-Bio Manager mit Auto-Update bei Veroeffentlichung
- [ ] URL-Link-Automation: Zentrale Link-Bibliothek mit Click-Tracking
- [ ] Media Library mit Upload, Tagging und Wiederverwendung
- [ ] Kanal-Management fuer Instagram und TikTok (via Late.dev Unified API)
- [ ] Post-Status-Workflow: Entwurf > In Review > Freigegeben > Geplant > Veroeffentlicht
- [ ] Entwuerfe & Ideen-Board (Kanban)
- [ ] Kampagnen-Tagging (saisonale Zuordnung: Karneval, Halloween, Weihnachten etc.)
- [ ] Hashtag-Sets (vordefinierte Gruppen pro Kampagne/Kategorie)
- [ ] Live-Vorschau im Composer (plattformspezifisch)
- [ ] User-Authentifizierung via Email + Passwort (Supabase Auth)
- [ ] Rollen-System (Admin, Editor, Viewer)

### Out of Scope

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->

- Inbox/Community Management — Meta Business Suite nutzen
- Social Listening/Monitoring — n8n Trend Scout uebernimmt das
- Competitor-Analyse — nicht core fuer Content-Planung
- Influencer Management — separates Tool
- Werbeanzeigen-Management — Meta Ads Manager nutzen
- Native Mobile App — Responsive Web App reicht fuer v1
- Facebook-Publishing in v1 — Fokus auf Instagram + TikTok, spaeter erweitern
- LinkedIn/YouTube in v1 — Phase 2 Erweiterung
- AI Content Assistant — Phase 2
- Best-Time-to-Post Heatmap — Phase 2
- Mehrstufige Approval Workflows mit Email — Phase 2
- Analytics Dashboard (Fabric-Anbindung) — Phase 2
- Content Recycling — Phase 2
- Team-Inbox (Kommentare/DMs) — Phase 3
- Dark Mode — Phase 2
- Microsoft SSO — Email + Passwort reicht fuer v1

## Context

- **Marke**: hitschies ist eine bunte, junge, verspielte Suesswarenmarke — "Playful Professional" Design-Philosophie
- **Aktuelles Problem**: swat.io kostet 200-500+ EUR/Monat und bietet keine URL-Link-Automation. UTM-Parameter, Short-Links und Link-in-Bio muessen manuell gepflegt werden
- **Team**: 3-5 Personen im Marketing-Team nutzen das Tool aktiv
- **Bestehende Infrastruktur**: Microsoft Fabric (Analytics), n8n (Automation), Meta Graph API und TikTok API bereits im Einsatz (aber fuer v1 Late.dev als Unified API bevorzugt)
- **Design-Referenzen**: Notion (flexible Views), Linear (Minimalismus, Keyboard-Shortcuts), Planable (Kalender-UX)
- **Brand Design**: hitschies Magenta (#E6007E) als Primary, hitschies Blau (#0073CF) als Secondary, Plus Jakarta Sans + Inter Typography, Lucide Icons
- **Detaillierte Specs vorhanden**: UX-Wireframes, DB-Schema, Komponenten-Bibliothek und technische Architektur sind in den Konzeptdokumenten (01-03) definiert
- **Short-Link-Domain**: link.hitschies.de muss noch konfiguriert werden (DNS)

## Constraints

- **Tech Stack**: Next.js + TypeScript + Tailwind CSS + Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Social API**: Late.dev als Unified Social API fuer Instagram + TikTok Publishing
- **Deployment**: Vercel
- **Auth**: Supabase Auth mit Email + Passwort
- **Budget**: Zielkosten ~56-96 EUR/Monat (Supabase Pro ~25, Vercel ~20, Late.dev ~10-50)
- **Design System**: shadcn/ui als Basis-Komponentenbibliothek, hitschies Brand Tokens
- **Accessibility**: WCAG 2.1 AA Mindeststandard
- **Responsive**: Desktop-first, aber Tablet + Mobile unterstuetzt (768px Breakpoint)

## Key Decisions

<!-- Decisions that constrain future work. Add throughout project lifecycle. -->

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Late.dev statt Direct APIs fuer v1 | Schnellere Entwicklung, weniger API-Wartung, ~$10-50/Monat vs. wochen Entwicklungszeit | -- Pending |
| Instagram + TikTok only fuer v1 | Wichtigste Kanaele fuer hitschies, FB/LinkedIn/YouTube in Phase 2 | -- Pending |
| Supabase als Backend | Auth + DB + Storage + Edge Functions + Realtime in einem, schnelle Entwicklung | -- Pending |
| Vercel als Hosting | Bestes Next.js-Deployment, kostenloser Tier verfuegbar | -- Pending |
| Email + Passwort Auth fuer v1 | Einfachste Loesung, Microsoft SSO spaeter | -- Pending |
| shadcn/ui als Component Library | Tailwind-basiert, anpassbar, gute DX | -- Pending |

---
*Last updated: 2026-03-13 after initialization*
