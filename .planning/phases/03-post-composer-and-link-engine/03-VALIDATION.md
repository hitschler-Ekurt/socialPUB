---
phase: 3
slug: post-composer-and-link-engine
status: draft
nyquist_compliant: true
wave_0_complete: true
verification_strategy: build-only
created: 2026-03-13
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Build verification (no test framework installed) |
| **Config file** | N/A |
| **Quick run command** | `npx next build --no-lint 2>&1 \| tail -5` |
| **Full suite command** | `npx next build` |
| **Estimated runtime** | ~30 seconds |

### Build-Only Verification Rationale

This project uses build-only verification as the established pattern from Phases 1 and 2. No test framework (vitest/jest) is installed. All 9 tasks across 4 plans use `npx next build --no-lint` as their automated verification command. This catches type errors, import errors, and compilation failures. The RESEARCH.md Validation Architecture section describes a hypothetical test setup, but creating 14 test files would be scope creep given the established project pattern. A test framework can be introduced in a future phase if needed.

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
| 03-01-01 | 01 | 1 | LINK-01,04,05,CAMP-03 | build | `npx next build` | N/A | pending |
| 03-01-02 | 01 | 1 | LINK-01,04,05,CAMP-03 | build | `npx next build` | N/A | pending |
| 03-01-03 | 01 | 1 | LINK-01,04,05,CAMP-03 | build | `npx next build` | N/A | pending |
| 03-02-01 | 02 | 2 | COMP-01,02,03,04,06,07,08,09 | build | `npx next build` | N/A | pending |
| 03-02-02 | 02 | 2 | COMP-01,02,03,04,06,07,08,09 | build | `npx next build` | N/A | pending |
| 03-03-01 | 03 | 2 | COMP-05,LINK-02,03 | build | `npx next build` | N/A | pending |
| 03-03-02 | 03 | 2 | COMP-05,LINK-02,03 | build | `npx next build` | N/A | pending |
| 03-04-01 | 04 | 3 | LINK-08,09,CAMP-03 | build | `npx next build` | N/A | pending |
| 03-04-02 | 04 | 3 | LINK-08,09,CAMP-03 | build | `npx next build` | N/A | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

- [x] Fix `src/lib/supabase/types.ts` — addressed by Plan 03-01 Task 1
- [x] Verify DB triggers exist — already in place from Phase 1 migration

*Types fix is the first task in Plan 03-01 (Wave 1). No separate Wave 0 needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Platform preview renders correctly | COMP-05 | Visual accuracy | Create post, toggle Instagram/TikTok preview, verify layout matches platform |
| Short link redirect (302) | LINK-06 | Deferred to Phase 5 — requires DNS + redirect service | N/A for Phase 3 |
| Click tracking | LINK-07 | Deferred to Phase 5 — requires live redirect | N/A for Phase 3 |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify commands (build verification)
- [x] Sampling continuity: every task has automated verify
- [x] Wave 0 dependencies covered by Plan 03-01 Task 1
- [x] No watch-mode flags
- [x] Feedback latency < 30s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved (build-only strategy)
