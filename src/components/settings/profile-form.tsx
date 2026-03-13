"use client"

import { useState } from "react"
import { z } from "zod/v4"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { useUser, type Profile } from "@/hooks/use-user"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const profileSchema = z.object({
  full_name: z.string().min(1, "Name ist erforderlich"),
  avatar_url: z.string().url("Ungueltige URL").or(z.literal("")),
})

const passwordSchema = z
  .object({
    new_password: z.string().min(8, "Mindestens 8 Zeichen"),
    confirm_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwoerter stimmen nicht ueberein",
    path: ["confirm_password"],
  })

export function ProfileForm() {
  const { profile } = useUser()
  const [fullName, setFullName] = useState(profile?.full_name ?? "")
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? "")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [saving, setSaving] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Sync when profile loads
  useState(() => {
    if (profile) {
      setFullName(profile.full_name ?? "")
      setAvatarUrl(profile.avatar_url ?? "")
    }
  })

  async function handleSaveProfile() {
    setErrors({})
    const result = profileSchema.safeParse({ full_name: fullName, avatar_url: avatarUrl })
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of result.error.issues) {
        const path = issue.path[0]
        if (typeof path === "string") {
          fieldErrors[path] = issue.message
        }
      }
      setErrors(fieldErrors)
      return
    }

    setSaving(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          avatar_url: avatarUrl || null,
        })
        .eq("id", profile?.id ?? "")

      if (error) {
        toast.error("Fehler beim Speichern: " + error.message)
      } else {
        toast.success("Profil aktualisiert")
      }
    } catch (err) {
      toast.error("Unerwarteter Fehler beim Speichern")
    } finally {
      setSaving(false)
    }
  }

  async function handleChangePassword() {
    setErrors({})
    const result = passwordSchema.safeParse({
      new_password: newPassword,
      confirm_password: confirmPassword,
    })
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of result.error.issues) {
        const path = issue.path[0]
        if (typeof path === "string") {
          fieldErrors[path] = issue.message
        }
      }
      setErrors(fieldErrors)
      return
    }

    setSavingPassword(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) {
        toast.error("Fehler: " + error.message)
      } else {
        toast.success("Passwort geaendert")
        setNewPassword("")
        setConfirmPassword("")
      }
    } catch (err) {
      toast.error("Unerwarteter Fehler")
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Profile info */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg">Profil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Name</Label>
            <Input
              id="full_name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Dein Name"
            />
            {errors.full_name && (
              <p className="text-sm text-destructive">{errors.full_name}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="avatar_url">Avatar URL (optional)</Label>
            <Input
              id="avatar_url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://..."
            />
            {errors.avatar_url && (
              <p className="text-sm text-destructive">{errors.avatar_url}</p>
            )}
          </div>
          <Button onClick={handleSaveProfile} disabled={saving}>
            {saving ? "Speichern..." : "Profil speichern"}
          </Button>
        </CardContent>
      </Card>

      {/* Password change */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg">Passwort aendern</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new_password">Neues Passwort</Label>
            <Input
              id="new_password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Mindestens 8 Zeichen"
            />
            {errors.new_password && (
              <p className="text-sm text-destructive">{errors.new_password}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm_password">Passwort bestaetigen</Label>
            <Input
              id="confirm_password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Passwort wiederholen"
            />
            {errors.confirm_password && (
              <p className="text-sm text-destructive">{errors.confirm_password}</p>
            )}
          </div>
          <Button onClick={handleChangePassword} disabled={savingPassword}>
            {savingPassword ? "Aendern..." : "Passwort aendern"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
