"use client"

import { useState, useCallback } from "react"
import {
  useCreateBioPage,
  useUpdateBioPage,
  useDeleteBioPage,
} from "@/hooks/use-bio-pages"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Trash2 } from "lucide-react"
import type { Database } from "@/lib/supabase/types"

type BioPage = Database["public"]["Tables"]["linkinbio_pages"]["Row"]

type BioPageFormProps =
  | {
      readonly mode: "create"
      readonly bioPage?: undefined
      readonly onDone?: () => void
    }
  | {
      readonly mode: "edit"
      readonly bioPage: BioPage
      readonly onDone?: () => void
    }

export function BioPageForm({ mode, bioPage, onDone }: BioPageFormProps) {
  const [slug, setSlug] = useState(bioPage?.slug ?? "")
  const [title, setTitle] = useState(bioPage?.title ?? "")
  const [description, setDescription] = useState(bioPage?.description ?? "")
  const [logoUrl, setLogoUrl] = useState(bioPage?.logo_url ?? "")
  const [deleteOpen, setDeleteOpen] = useState(false)

  const createBioPage = useCreateBioPage()
  const updateBioPage = useUpdateBioPage()
  const deleteBioPage = useDeleteBioPage()

  const isSubmitting =
    createBioPage.isPending ||
    updateBioPage.isPending ||
    deleteBioPage.isPending

  const handleSlugChange = useCallback((value: string) => {
    // Normalize: lowercase, only alphanumeric and hyphens
    const normalized = value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "")
    setSlug(normalized)
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const data = {
      slug,
      title,
      description: description || undefined,
      logoUrl: logoUrl || undefined,
    }

    if (mode === "create") {
      createBioPage.mutate(data)
    } else {
      updateBioPage.mutate(
        { pageId: bioPage.id, ...data },
        { onSuccess: () => onDone?.() }
      )
    }
  }

  function handleDelete() {
    if (mode === "edit") {
      deleteBioPage.mutate(bioPage.id)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border p-4">
        <div className="space-y-2">
          <Label htmlFor="bio-slug">Slug</Label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">/bio/</span>
            <Input
              id="bio-slug"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="hitschies"
              required
              minLength={2}
              maxLength={50}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Deine Bio-Seite wird unter /bio/{slug || "..."} erreichbar sein
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio-title">Titel</Label>
          <Input
            id="bio-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="hitschies Links"
            required
            maxLength={100}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio-description">Beschreibung (optional)</Label>
          <Textarea
            id="bio-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Alle unsere wichtigen Links..."
            maxLength={500}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio-logo">Logo-URL (optional)</Label>
          <Input
            id="bio-logo"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="https://example.com/logo.png"
            type="url"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {mode === "create" ? "Bio-Seite erstellen" : "Speichern"}
          </Button>
          {mode === "edit" && (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => onDone?.()}
              >
                Abbrechen
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="ml-auto text-destructive hover:text-destructive"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </form>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Bio-Seite loeschen?"
        description="Die Bio-Seite und alle zugehoerigen Items werden dauerhaft geloescht. Diese Aktion kann nicht rueckgaengig gemacht werden."
        confirmLabel="Loeschen"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </>
  )
}
