"use client"

import { useState, useCallback, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { CAMPAIGN_COLORS } from "@/lib/utils/constants"
import { createCampaignSchema } from "@/lib/validations/campaign"
import { useCreateCampaign, useUpdateCampaign } from "@/hooks/use-campaigns"
import type { Database } from "@/lib/supabase/types"

type Campaign = Database["public"]["Tables"]["campaigns"]["Row"] & {
  post_count: number
}

type CampaignDialogProps = {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly campaign?: Campaign | null
}

type FormErrors = Record<string, string>

const INITIAL_FORM = {
  name: "",
  color: CAMPAIGN_COLORS[0].value as string,
  start_date: "",
  end_date: "",
  description: "",
}

export function CampaignDialog({
  open,
  onOpenChange,
  campaign,
}: CampaignDialogProps) {
  const isEdit = Boolean(campaign)
  const createMutation = useCreateCampaign()
  const updateMutation = useUpdateCampaign()

  const [form, setForm] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    if (open) {
      if (campaign) {
        setForm({
          name: campaign.name,
          color: campaign.color,
          start_date: campaign.start_date ?? "",
          end_date: campaign.end_date ?? "",
          description: campaign.description ?? "",
        })
      } else {
        setForm(INITIAL_FORM)
      }
      setErrors({})
    }
  }, [open, campaign])

  const handleFieldChange = useCallback(
    (field: string, value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }))
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    },
    []
  )

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      const payload = {
        name: form.name,
        color: form.color,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        description: form.description || null,
      }

      const result = createCampaignSchema.safeParse(payload)
      if (!result.success) {
        const fieldErrors: FormErrors = {}
        for (const issue of result.error.issues) {
          const key = issue.path[0]?.toString()
          if (key && !fieldErrors[key]) {
            fieldErrors[key] = issue.message
          }
        }
        setErrors(fieldErrors)
        return
      }

      try {
        if (isEdit && campaign) {
          await updateMutation.mutateAsync({ id: campaign.id, ...payload })
        } else {
          await createMutation.mutateAsync(payload)
        }
        onOpenChange(false)
      } catch {
        // Error handled by mutation onError
      }
    },
    [form, isEdit, campaign, createMutation, updateMutation, onOpenChange]
  )

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Kampagne bearbeiten" : "Kampagne erstellen"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="campaign-name">Name</Label>
            <Input
              id="campaign-name"
              value={form.name}
              onChange={(e) => handleFieldChange("name", e.target.value)}
              placeholder="z.B. Sommer-Kampagne 2026"
              maxLength={50}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Farbe</Label>
            <div className="flex flex-wrap gap-2">
              {CAMPAIGN_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  className={cn(
                    "h-8 w-8 rounded-full transition-all",
                    form.color === c.value
                      ? "ring-2 ring-offset-2 ring-neutral-400"
                      : "hover:scale-110"
                  )}
                  style={{ backgroundColor: c.value }}
                  onClick={() => handleFieldChange("color", c.value)}
                  title={c.name}
                  aria-label={`Farbe ${c.name}`}
                />
              ))}
            </div>
            {errors.color && (
              <p className="text-sm text-red-500">{errors.color}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="campaign-start">Startdatum</Label>
              <Input
                id="campaign-start"
                type="date"
                value={form.start_date}
                onChange={(e) =>
                  handleFieldChange("start_date", e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="campaign-end">Enddatum</Label>
              <Input
                id="campaign-end"
                type="date"
                value={form.end_date}
                onChange={(e) => handleFieldChange("end_date", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="campaign-description">Beschreibung</Label>
            <Textarea
              id="campaign-description"
              value={form.description}
              onChange={(e) =>
                handleFieldChange("description", e.target.value)
              }
              placeholder="Optionale Beschreibung..."
              maxLength={500}
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Abbrechen
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? "Speichern..."
                : isEdit
                  ? "Aktualisieren"
                  : "Erstellen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
