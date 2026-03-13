"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createHashtagSetSchema } from "@/lib/validations/hashtag-set"
import {
  useCreateHashtagSet,
  useUpdateHashtagSet,
} from "@/hooks/use-hashtag-sets"
import type { Database } from "@/lib/supabase/types"

type HashtagSet = Database["public"]["Tables"]["hashtag_sets"]["Row"]

type HashtagSetDialogProps = {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly hashtagSet?: HashtagSet | null
}

type FormErrors = Record<string, string>

const NO_CATEGORY = "__none__"

const INITIAL_FORM = {
  name: "",
  hashtagsText: "",
  category: NO_CATEGORY,
}

function parseHashtags(text: string): string[] {
  return text
    .split(/[\n,]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0)
    .map((t) => (t.startsWith("#") ? t : `#${t}`))
}

export function HashtagSetDialog({
  open,
  onOpenChange,
  hashtagSet,
}: HashtagSetDialogProps) {
  const isEdit = Boolean(hashtagSet)
  const createMutation = useCreateHashtagSet()
  const updateMutation = useUpdateHashtagSet()

  const [form, setForm] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    if (open) {
      if (hashtagSet) {
        setForm({
          name: hashtagSet.name,
          hashtagsText: (hashtagSet.hashtags ?? []).join("\n"),
          category: hashtagSet.category ?? NO_CATEGORY,
        })
      } else {
        setForm(INITIAL_FORM)
      }
      setErrors({})
    }
  }, [open, hashtagSet])

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

  const parsedTags = useMemo(
    () => parseHashtags(form.hashtagsText),
    [form.hashtagsText]
  )

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      const payload = {
        name: form.name,
        hashtags: parsedTags,
        category:
          form.category === NO_CATEGORY
            ? null
            : (form.category as "brand" | "produkt" | "kampagne"),
      }

      const result = createHashtagSetSchema.safeParse(payload)
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
        if (isEdit && hashtagSet) {
          await updateMutation.mutateAsync({ id: hashtagSet.id, ...payload })
        } else {
          await createMutation.mutateAsync(payload)
        }
        onOpenChange(false)
      } catch {
        // Error handled by mutation onError
      }
    },
    [
      form,
      parsedTags,
      isEdit,
      hashtagSet,
      createMutation,
      updateMutation,
      onOpenChange,
    ]
  )

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Hashtag-Set bearbeiten" : "Hashtag-Set erstellen"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="hashtagset-name">Name</Label>
            <Input
              id="hashtagset-name"
              value={form.name}
              onChange={(e) => handleFieldChange("name", e.target.value)}
              placeholder="z.B. hitschies Brand Tags"
              maxLength={50}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="hashtagset-category">Kategorie</Label>
            <Select
              value={form.category}
              onValueChange={(value) => handleFieldChange("category", value ?? NO_CATEGORY)}
            >
              <SelectTrigger id="hashtagset-category">
                <SelectValue placeholder="Kategorie waehlen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_CATEGORY}>Keine Kategorie</SelectItem>
                <SelectItem value="brand">Brand</SelectItem>
                <SelectItem value="produkt">Produkt</SelectItem>
                <SelectItem value="kampagne">Kampagne</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hashtagset-tags">
              Hashtags (ein Hashtag pro Zeile oder kommagetrennt)
            </Label>
            <Textarea
              id="hashtagset-tags"
              value={form.hashtagsText}
              onChange={(e) =>
                handleFieldChange("hashtagsText", e.target.value)
              }
              placeholder={"#hitschies\n#suessigkeiten\n#gummi"}
              rows={5}
            />
            {errors.hashtags && (
              <p className="text-sm text-red-500">{errors.hashtags}</p>
            )}
          </div>

          {parsedTags.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-neutral-400">
                Vorschau ({parsedTags.length}{" "}
                {parsedTags.length === 1 ? "Tag" : "Tags"})
              </p>
              <div className="flex flex-wrap gap-1">
                {parsedTags.map((tag, index) => (
                  <span
                    key={`${tag}-${index}`}
                    className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

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
