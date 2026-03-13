---
phase: 05
slug: publishing-pipeline-and-link-in-bio
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-13
---

# Phase 05 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.0 |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm test -- --coverage` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test`
- **After every plan wave:** Run `npm test -- --coverage`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | WRKF-01, WRKF-04 | unit | `npx vitest run src/lib/__tests__/workflow-transitions.test.ts -x` | ❌ W0 | ⬜ pending |
| 05-01-02 | 01 | 1 | WRKF-02, WRKF-03 | unit | `npx vitest run src/hooks/__tests__/use-workflow.test.ts -x` | ❌ W0 | ⬜ pending |
| 05-01-03 | 01 | 1 | WRKF-06 | unit | `npx vitest run src/components/__tests__/workflow-actions.test.tsx -x` | ❌ W0 | ⬜ pending |
| 05-02-01 | 02 | 2 | WRKF-05 | manual | Manual — Edge Function runs in Deno | N/A | ⬜ pending |
| 05-03-01 | 03 | 2 | BIO-01 | unit | `npx vitest run src/hooks/__tests__/use-bio-pages.test.ts -x` | ❌ W0 | ⬜ pending |
| 05-03-02 | 03 | 2 | BIO-02 | unit | `npx vitest run src/components/__tests__/bio-item-list.test.tsx -x` | ❌ W0 | ⬜ pending |
| 05-03-03 | 03 | 2 | BIO-04 | unit | `npx vitest run src/lib/__tests__/bio-utils.test.ts -x` | ❌ W0 | ⬜ pending |
| 05-03-04 | 03 | 2 | BIO-05 | unit | `npx vitest run src/app/bio/__tests__/bio-page.test.tsx -x` | ❌ W0 | ⬜ pending |
| 05-03-05 | 03 | 2 | BIO-03 | manual | Manual — requires Edge Function + publish | N/A | ⬜ pending |
| 05-04-01 | 04 | 3 | LINK-06 | manual | Manual — separate Vercel project | N/A | ⬜ pending |
| 05-04-02 | 04 | 3 | LINK-07 | manual | Manual — separate Vercel project | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/lib/__tests__/workflow-transitions.test.ts` — stubs for WRKF-01, WRKF-04
- [ ] `src/hooks/__tests__/use-workflow.test.ts` — stubs for WRKF-02, WRKF-03
- [ ] `src/components/__tests__/workflow-actions.test.tsx` — stubs for WRKF-06
- [ ] `src/hooks/__tests__/use-bio-pages.test.ts` — stubs for BIO-01
- [ ] `src/components/__tests__/bio-item-list.test.tsx` — stubs for BIO-02
- [ ] `src/lib/__tests__/bio-utils.test.ts` — stubs for BIO-04
- [ ] `src/app/bio/__tests__/bio-page.test.tsx` — stubs for BIO-05

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Auto-publish scheduled posts via Late.dev | WRKF-05 | Edge Function runs in Deno runtime, not testable in jsdom/vitest | Create post, schedule, verify publish via Late.dev dashboard |
| Auto-move link on publish | BIO-03 | Requires Edge Function + publish chain | Publish post with update_linkinbio=true, verify link position on bio page |
| Short link 302 redirect | LINK-06 | Separate Vercel project | Visit link.hitschies.de/[code], verify redirect + UTM params |
| Click tracking analytics | LINK-07 | Separate Vercel project | Click short link, verify click record in Supabase link_clicks table |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
