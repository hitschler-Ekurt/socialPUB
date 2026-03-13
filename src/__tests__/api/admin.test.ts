import { describe, it } from "vitest"

describe("Admin API routes (AUTH-03)", () => {
  it.todo("POST /api/admin/invite creates user with role")
  it.todo("POST /api/admin/invite rejects non-admin callers")
  it.todo("GET /api/admin/users returns all profiles")
  it.todo("PATCH /api/admin/users updates user role")
  it.todo("PATCH /api/admin/users prevents demoting last admin")
  it.todo("PATCH /api/admin/users deactivates user via is_active flag")
})
