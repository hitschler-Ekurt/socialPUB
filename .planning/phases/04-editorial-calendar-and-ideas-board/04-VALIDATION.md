---
phase: 4
slug: editorial-calendar-and-ideas-board
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-13
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.0 + @testing-library/react 16.3.2 |
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
| 04-01-01 | 01 | 1 | CAL-01 | unit | `npx vitest run src/__tests__/calendar/month-grid.test.ts -x` | ❌ W0 | ⬜ pending |
| 04-01-02 | 01 | 1 | CAL-02 | unit | `npx vitest run src/__tests__/calendar/view-switcher.test.ts -x` | ❌ W0 | ⬜ pending |
| 04-01-03 | 01 | 1 | CAL-05 | unit | `npx vitest run src/__tests__/calendar/post-card.test.ts -x` | ❌ W0 | ⬜ pending |
| 04-02-01 | 02 | 2 | CAL-03 | unit | `npx vitest run src/__tests__/calendar/drag-reschedule.test.ts -x` | ❌ W0 | ⬜ pending |
| 04-02-02 | 02 | 2 | CAL-04 | unit | `npx vitest run src/__tests__/calendar/filters.test.ts -x` | ❌ W0 | ⬜ pending |
| 04-02-03 | 02 | 2 | CAL-06 | unit | `npx vitest run src/__tests__/calendar/quick-add.test.ts -x` | ❌ W0 | ⬜ pending |
| 04-03-01 | 03 | 2 | IDEA-01 | unit | `npx vitest run src/__tests__/ideas/create-idea.test.ts -x` | ❌ W0 | ⬜ pending |
| 04-03-02 | 03 | 2 | IDEA-02 | unit | `npx vitest run src/__tests__/ideas/kanban-board.test.ts -x` | ❌ W0 | ⬜ pending |
| 04-03-03 | 03 | 2 | IDEA-03 | unit | `npx vitest run src/__tests__/ideas/drag-between-columns.test.ts -x` | ❌ W0 | ⬜ pending |
| 04-03-04 | 03 | 2 | IDEA-04 | unit | `npx vitest run src/__tests__/ideas/promote-to-post.test.ts -x` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/__tests__/calendar/month-grid.test.ts` — stubs for CAL-01
- [ ] `src/__tests__/calendar/view-switcher.test.ts` — stubs for CAL-02
- [ ] `src/__tests__/calendar/post-card.test.ts` — stubs for CAL-05
- [ ] `src/__tests__/calendar/drag-reschedule.test.ts` — stubs for CAL-03
- [ ] `src/__tests__/calendar/filters.test.ts` — stubs for CAL-04
- [ ] `src/__tests__/calendar/quick-add.test.ts` — stubs for CAL-06
- [ ] `src/__tests__/ideas/create-idea.test.ts` — stubs for IDEA-01
- [ ] `src/__tests__/ideas/kanban-board.test.ts` — stubs for IDEA-02
- [ ] `src/__tests__/ideas/drag-between-columns.test.ts` — stubs for IDEA-03
- [ ] `src/__tests__/ideas/promote-to-post.test.ts` — stubs for IDEA-04
- [ ] `src/lib/supabase/types.ts` — add drafts table types (prerequisite)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Drag overlay renders smoothly | CAL-03, IDEA-03 | Visual rendering quality | Drag a post/idea, verify ghost element follows cursor without flicker |
| Calendar today highlight visible | CAL-01 | Visual styling | Open calendar, verify today's cell has magenta accent border |
| Post card shows correct channel icon | CAL-05 | Visual correctness | View calendar with multi-channel posts, verify icons match |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
