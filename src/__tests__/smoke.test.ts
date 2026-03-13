import { describe, it, expect } from "vitest"
import { cn } from "@/lib/utils/cn"

describe("Smoke test", () => {
  it("cn() merges Tailwind classes correctly", () => {
    expect(cn("px-2 px-4")).toBe("px-4")
  })

  it("cn() handles conditional classes", () => {
    expect(cn("text-red-500", false && "hidden", "font-bold")).toBe(
      "text-red-500 font-bold"
    )
  })

  it("cn() resolves conflicting classes", () => {
    expect(cn("bg-red-500", "bg-blue-500")).toBe("bg-blue-500")
  })
})
