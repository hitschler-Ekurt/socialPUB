---
phase: 2
slug: entity-layer
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-13
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.0 + Testing Library |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npm test -- --reporter=verbose` |
| **Full suite command** | `npm test -- --coverage` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --reporter=verbose`
- **After every plan wave:** Run `npm test -- --coverage`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | CHAN-01 | integration | `npx vitest run src/__tests__/api/channels.test.ts -t "connect instagram"` | No - W0 | ⬜ pending |
| 02-01-02 | 01 | 1 | CHAN-02 | integration | `npx vitest run src/__tests__/api/channels.test.ts -t "connect tiktok"` | No - W0 | ⬜ pending |
| 02-01-03 | 01 | 1 | CHAN-03 | unit | `npx vitest run src/__tests__/components/channel-card.test.tsx` | No - W0 | ⬜ pending |
| 02-01-04 | 01 | 1 | CHAN-04 | unit | `npx vitest run src/__tests__/api/channels-health.test.ts` | No - W0 | ⬜ pending |
| 02-02-01 | 02 | 1 | CAMP-01 | integration | `npx vitest run src/__tests__/api/campaigns.test.ts` | No - W0 | ⬜ pending |
| 02-02-02 | 02 | 1 | CAMP-02 | unit | `npx vitest run src/__tests__/hooks/use-campaigns.test.ts` | No - W0 | ⬜ pending |
| 02-02-03 | 02 | 1 | HASH-01 | integration | `npx vitest run src/__tests__/api/hashtag-sets.test.ts` | No - W0 | ⬜ pending |
| 02-02-04 | 02 | 1 | HASH-02 | unit | `npx vitest run src/__tests__/components/hashtag-set-list.test.tsx` | No - W0 | ⬜ pending |
| 02-02-05 | 02 | 1 | HASH-03 | unit | `npx vitest run src/__tests__/components/hashtag-set-list.test.tsx -t "categorized"` | No - W0 | ⬜ pending |
| 02-03-01 | 03 | 2 | MEDIA-01 | integration | `npx vitest run src/__tests__/components/media-upload.test.tsx` | No - W0 | ⬜ pending |
| 02-03-02 | 03 | 2 | MEDIA-02 | integration | `npx vitest run src/__tests__/api/media.test.ts -t "tags"` | No - W0 | ⬜ pending |
| 02-03-03 | 03 | 2 | MEDIA-03 | unit | `npx vitest run src/__tests__/hooks/use-media.test.ts -t "filter"` | No - W0 | ⬜ pending |
| 02-03-04 | 03 | 2 | MEDIA-04 | unit | `npx vitest run src/__tests__/components/media-card.test.tsx -t "usage"` | No - W0 | ⬜ pending |
| 02-03-05 | 03 | 2 | MEDIA-05 | unit | `npx vitest run src/__tests__/lib/video-thumbnail.test.ts` | No - W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/__tests__/api/channels.test.ts` — stubs for CHAN-01, CHAN-02 (mock Late.dev SDK)
- [ ] `src/__tests__/api/channels-health.test.ts` — stubs for CHAN-04
- [ ] `src/__tests__/api/campaigns.test.ts` — stubs for CAMP-01
- [ ] `src/__tests__/api/hashtag-sets.test.ts` — stubs for HASH-01
- [ ] `src/__tests__/api/media.test.ts` — stubs for MEDIA-01, MEDIA-02
- [ ] `src/__tests__/components/channel-card.test.tsx` — stubs for CHAN-03
- [ ] `src/__tests__/components/hashtag-set-list.test.tsx` — stubs for HASH-02, HASH-03
- [ ] `src/__tests__/components/media-upload.test.tsx` — stubs for MEDIA-01
- [ ] `src/__tests__/components/media-card.test.tsx` — stubs for MEDIA-04
- [ ] `src/__tests__/hooks/use-campaigns.test.ts` — stubs for CAMP-02
- [ ] `src/__tests__/hooks/use-media.test.ts` — stubs for MEDIA-03
- [ ] `src/__tests__/lib/video-thumbnail.test.ts` — stubs for MEDIA-05
- [ ] TanStack Query test wrapper utility for hook tests

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Late.dev OAuth redirect flow | CHAN-01, CHAN-02 | Requires real OAuth handshake with external service | 1. Click "+ Kanal verbinden" 2. Select Instagram 3. Complete OAuth in Late.dev popup 4. Verify channel appears with "Verbunden" badge |
| Drag-and-drop upload UX | MEDIA-01 | Browser drag events not fully testable in jsdom | 1. Drag image file onto upload zone 2. Verify progress indicator 3. Verify thumbnail appears in grid |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
