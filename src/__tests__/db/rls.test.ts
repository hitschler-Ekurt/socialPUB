import { describe, it } from "vitest"

describe("RLS policies (AUTH-04)", () => {
  it.todo("viewer can SELECT but not INSERT")
  it.todo("editor can INSERT and UPDATE own records")
  it.todo("admin can DELETE records")
  it.todo("get_user_role() returns correct role for authenticated user")
})
