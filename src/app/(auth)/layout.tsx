import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AuthShell } from "@/components/layout/auth-shell"

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/login")
  }

  return <AuthShell>{children}</AuthShell>
}
