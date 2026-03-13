---
phase: 3
slug: post-composer-and-link-engine
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-13
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest (if installed) or manual build verification |
| **Config file** | vitest.config.ts or none — Wave 0 installs |
| **Quick run command** | `npx next build --no-lint 2>&1 | tail -5` |
| **Full suite command** | `npx next build` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx next build --no-lint 2>&1 | tail -5`
- **After every plan wave:** Run `npx next build`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | COMP-01,02,03 | build | `npx next build` | ✅ | ⬜ pending |
| 03-01-02 | 01 | 1 | COMP-04,05,06,07,08,09 | build | `npx next build` | ✅ | ⬜ pending |
| 03-02-01 | 02 | 1 | COMP-03 | build | `npx next build` | ✅ | ⬜ pending |
| 03-02-02 | 02 | 1 | CAMP-03 | build | `npx next build` | ✅ | ⬜ pending |
| 03-03-01 | 03 | 2 | LINK-01,02,03,04,05 | build | `npx next build` | ✅ | ⬜ pending |
| 03-03-02 | 03 | 2 | LINK-06,07,08,09 | build | `npx next build` | ✅ | ⬜ pending |
| 03-04-01 | 04 | 2 | LINK-08 | build | `npx next build` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Fix `src/lib/supabase/types.ts` — expand posts, post_channels, post_media, links, link_clicks, utm_templates tables
- [ ] Verify DB triggers (generate_short_code, build_full_url, increment_link_clicks) exist in Supabase

*Types fix is critical — all Phase 3 code depends on accurate TypeScript types.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Platform preview renders correctly | COMP-03 | Visual accuracy | Create post, toggle Instagram/TikTok preview, verify layout matches platform |
| Drag-drop media attachment | COMP-04 | Browser interaction | Drag image from media library into composer |
| Short link redirect (302) | LINK-06 | Requires DNS + redirect service | Phase 5 scope — verify link record created only |
| Click tracking | LINK-07 | Requires live redirect | Phase 5 scope — verify click_count column exists |

*If none: "All phase behaviors have automated verification."*

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
