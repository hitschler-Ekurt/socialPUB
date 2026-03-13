import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { LoginForm } from "@/components/auth/login-form"
import { BRAND } from "@/lib/utils/constants"

export default async function LoginPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-4">
      <Card className="w-full max-w-sm border-t-4 border-t-primary-500">
        <CardHeader className="space-y-1 text-center">
          <div className="mb-2">
            <span className="font-display text-3xl font-bold text-primary-500">
              hitschies
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{BRAND.name}</p>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  )
}
