---
phase: 1
slug: foundation-and-authentication
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-03-13
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.x + @testing-library/react |
| **Config file** | vitest.config.ts (Wave 0 creation in Plan 01-01 Task 2) |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run --coverage` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run --coverage`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Created By | Status |
|---------|------|------|-------------|-----------|-------------------|-----------------|--------|
| 01-01-01 | 01 | 0 | AUTH-01 | unit + integration | `npx vitest run src/__tests__/auth/login.test.ts` | Plan 01-01 Task 2 | ⬜ pending |
| 01-01-02 | 01 | 0 | AUTH-02 | unit | `npx vitest run src/__tests__/middleware.test.ts` | Plan 01-01 Task 2 | ⬜ pending |
| 01-02-01 | 02 | 0 | AUTH-03 | integration | `npx vitest run src/__tests__/api/admin.test.ts` | Plan 01-01 Task 2 | ⬜ pending |
| 01-02-02 | 02 | 0 | AUTH-04 | integration | `npx vitest run src/__tests__/db/rls.test.ts` | Plan 01-01 Task 2 | ⬜ pending |
| 01-03-01 | 03 | 0 | UX-01 | unit | `npx vitest run src/__tests__/components/sidebar.test.tsx` | Plan 01-01 Task 2 | ⬜ pending |
| 01-03-02 | 03 | 0 | UX-04 | unit | `npx vitest run src/__tests__/components/theme.test.tsx` | Plan 01-01 Task 2 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

All Wave 0 test stubs are created by **Plan 01-01, Task 2**:

- [x] `vitest.config.ts` — Vitest configuration with React plugin
- [x] `src/__tests__/setup.ts` — Test setup with jsdom, testing-library
- [x] `src/__tests__/auth/login.test.ts` — Login form tests (AUTH-01) — `it.todo()` stubs
- [x] `src/__tests__/middleware.test.ts` — Middleware auth redirect tests (AUTH-02) — `it.todo()` stubs
- [x] `src/__tests__/api/admin.test.ts` — Admin API route tests (AUTH-03) — `it.todo()` stubs
- [x] `src/__tests__/db/rls.test.ts` — RLS policy verification (AUTH-04) — `it.todo()` stubs
- [x] `src/__tests__/components/sidebar.test.tsx` — Sidebar rendering and collapse (UX-01) — `it.todo()` stubs
- [x] `src/__tests__/components/theme.test.tsx` — Design token verification (UX-04) — `it.todo()` stubs
- [x] Framework install: `npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom vite-tsconfig-paths @vitest/coverage-v8`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| hitschies branding visual fidelity | UX-04 | Visual design cannot be fully automated | Compare rendered app against design tokens: Magenta #E6007E primary, brand typography, sidebar collapse animation |
| Session persistence after refresh | AUTH-02 | Requires real browser session | Log in, close tab, reopen — should remain authenticated |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references (all 6 stubs created in Plan 01-01 Task 2)
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
