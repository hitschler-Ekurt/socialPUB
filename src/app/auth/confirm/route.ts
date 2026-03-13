import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const tokenHash = searchParams.get("token_hash")
  const type = searchParams.get("type")
  const redirectTo = request.nextUrl.clone()

  if (!tokenHash || !type) {
    redirectTo.pathname = "/login"
    redirectTo.searchParams.set("error", "missing_params")
    return NextResponse.redirect(redirectTo)
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: type as "email" | "signup" | "invite" | "magiclink" | "recovery" | "email_change",
  })

  if (error) {
    redirectTo.pathname = "/login"
    redirectTo.searchParams.set("error", "verification_failed")
    return NextResponse.redirect(redirectTo)
  }

  // For invite type, redirect to set-password page
  if (type === "invite" || type === "magiclink") {
    redirectTo.pathname = "/auth/set-password"
    redirectTo.search = ""
    return NextResponse.redirect(redirectTo)
  }

  // For email confirmation, redirect to dashboard
  redirectTo.pathname = "/dashboard"
  redirectTo.search = ""
  return NextResponse.redirect(redirectTo)
}
