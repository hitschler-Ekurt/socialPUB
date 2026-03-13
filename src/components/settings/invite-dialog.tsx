"use client"

import { useState } from "react"
import { z } from "zod/v4"
import { toast } from "sonner"
import { ROLES } from "@/lib/utils/constants"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { UserPlus } from "lucide-react"

const inviteSchema = z.object({
  email: z.email("Ungueltige E-Mail-Adresse"),
  full_name: z.string().min(1, "Name ist erforderlich"),
  role: z.enum(["admin", "editor", "viewer"]),
})

type InviteDialogProps = {
  readonly onInvited?: () => void
}

export function InviteDialog({ onInvited }: InviteDialogProps) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [fullName, setFullName] = useState("")
  const [role, setRole] = useState("editor")
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)

  function resetForm() {
    setEmail("")
    setFullName("")
    setRole("editor")
    setErrors({})
    setFormError(null)
  }

  async function handleSubmit() {
    setErrors({})
    setFormError(null)

    const result = inviteSchema.safeParse({ email, full_name: fullName, role })
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

    setSubmitting(true)
    try {
      const res = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, full_name: fullName, role }),
      })

      if (!res.ok) {
        const json = await res.json()
        setFormError(json.error ?? "Einladung fehlgeschlagen")
        return
      }

      toast.success(`Einladung gesendet an ${email}`)
      setOpen(false)
      resetForm()
      onInvited?.()
    } catch (err) {
      setFormError("Unerwarteter Fehler beim Senden der Einladung")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen)
      if (!isOpen) resetForm()
    }}>
      <DialogTrigger
        render={
          <Button className="gap-2">
            <UserPlus className="h-4 w-4" />
            Neues Mitglied einladen
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display">Teammitglied einladen</DialogTitle>
          <DialogDescription>
            Sende eine Einladung per E-Mail an ein neues Teammitglied.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="invite-email">E-Mail</Label>
            <Input
              id="invite-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="invite-name">Name</Label>
            <Input
              id="invite-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Max Mustermann"
            />
            {errors.full_name && (
              <p className="text-sm text-destructive">{errors.full_name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="invite-role">Rolle</Label>
            <Select value={role} onValueChange={(value) => { if (value) setRole(value) }}>
              <SelectTrigger id="invite-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ROLES.admin}>Admin</SelectItem>
                <SelectItem value={ROLES.editor}>Editor</SelectItem>
                <SelectItem value={ROLES.viewer}>Viewer</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-sm text-destructive">{errors.role}</p>
            )}
          </div>

          {formError && (
            <p className="text-sm text-destructive">{formError}</p>
          )}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={submitting}
            >
              Abbrechen
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Senden..." : "Einladung senden"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
