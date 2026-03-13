"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const setPasswordSchema = z
  .object({
    password: z.string().min(8, "Passwort muss mindestens 8 Zeichen lang sein"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwoerter stimmen nicht ueberein",
    path: ["confirmPassword"],
  })

type SetPasswordFormData = {
  password: string
  confirmPassword: string
}

export function SetPasswordForm() {
  const router = useRouter()
  const [formData, setFormData] = useState<SetPasswordFormData>({
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<Partial<Record<keyof SetPasswordFormData, string>>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function handleChange(field: keyof SetPasswordFormData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
    setSubmitError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitError(null)
    setErrors({})

    const result = setPasswordSchema.safeParse(formData)
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof SetPasswordFormData, string>> = {}
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof SetPasswordFormData
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message
        }
      }
      setErrors(fieldErrors)
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({
        password: result.data.password,
      })

      if (error) {
        setSubmitError(error.message)
        return
      }

      router.push("/dashboard")
      router.refresh()
    } catch {
      setSubmitError("Ein unerwarteter Fehler ist aufgetreten")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password">Neues Passwort</Label>
        <Input
          id="password"
          type="password"
          placeholder="Mindestens 8 Zeichen"
          value={formData.password}
          onChange={(e) => handleChange("password", e.target.value)}
          disabled={loading}
          autoComplete="new-password"
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Passwort bestaetigen</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Passwort wiederholen"
          value={formData.confirmPassword}
          onChange={(e) => handleChange("confirmPassword", e.target.value)}
          disabled={loading}
          autoComplete="new-password"
        />
        {errors.confirmPassword && (
          <p className="text-sm text-destructive">{errors.confirmPassword}</p>
        )}
      </div>

      {submitError && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {submitError}
        </div>
      )}

      <Button
        type="submit"
        className="w-full bg-primary-500 hover:bg-primary-600 text-white"
        disabled={loading}
      >
        {loading ? "Wird gespeichert..." : "Passwort festlegen"}
      </Button>
    </form>
  )
}
