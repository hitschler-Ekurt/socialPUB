import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SetPasswordForm } from "@/components/auth/set-password-form"

export default function SetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-4">
      <Card className="w-full max-w-sm border-t-4 border-t-primary-500">
        <CardHeader className="space-y-1 text-center">
          <div className="mb-2">
            <span className="font-display text-3xl font-bold text-primary-500">
              hitschies
            </span>
          </div>
          <CardTitle className="text-xl">Passwort festlegen</CardTitle>
          <CardDescription>
            Legen Sie Ihr Passwort fest, um Ihr Konto zu aktivieren.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SetPasswordForm />
        </CardContent>
      </Card>
    </div>
  )
}
