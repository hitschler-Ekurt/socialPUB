"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { useCreateLink } from "@/hooks/use-links"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { UtmTemplateSelect } from "@/components/links/utm-template-select"
import type { CreateLinkInput } from "@/lib/validations/link"
import type { Database } from "@/lib/supabase/types"
import { Loader2 } from "lucide-react"

type UtmTemplate = Database["public"]["Tables"]["utm_templates"]["Row"]

type UtmBuilderProps = {
  readonly channelPlatform: string | null
  readonly campaignSlug: string | null
  readonly onLinkCreated: (linkId: string) => void
  readonly initialValues?: Partial<CreateLinkInput>
}

type UtmFields = {
  originalUrl: string
  utmSource: string
  utmMedium: string
  utmCampaign: string
  utmContent: string
  utmTerm: string
  title: string
}

const EMPTY_FIELDS: UtmFields = {
  originalUrl: "",
  utmSource: "",
  utmMedium: "social",
  utmCampaign: "",
  utmContent: "",
  utmTerm: "",
  title: "",
}

function buildPreviewUrl(fields: UtmFields): string {
  if (!fields.originalUrl) return ""

  try {
    const url = new URL(fields.originalUrl)
    const params: Array<[string, string]> = [
      ["utm_source", fields.utmSource],
      ["utm_medium", fields.utmMedium],
      ["utm_campaign", fields.utmCampaign],
      ["utm_content", fields.utmContent],
      ["utm_term", fields.utmTerm],
    ]

    for (const [key, value] of params) {
      if (value) {
        url.searchParams.set(key, value)
      }
    }

    return url.toString()
  } catch {
    return fields.originalUrl
  }
}

export function UtmBuilder({
  channelPlatform,
  campaignSlug,
  onLinkCreated,
  initialValues,
}: UtmBuilderProps) {
  const [fields, setFields] = useState<UtmFields>(() => ({
    ...EMPTY_FIELDS,
    ...initialValues,
    utmSource: initialValues?.utmSource ?? channelPlatform ?? "",
    utmCampaign: initialValues?.utmCampaign ?? campaignSlug ?? "",
    utmMedium: initialValues?.utmMedium ?? "social",
  }))

  // Track which fields were auto-filled vs user-edited
  const userEditedRef = useRef<Set<string>>(new Set())
  const createLink = useCreateLink()

  // Auto-fill utmSource from channelPlatform
  useEffect(() => {
    if (channelPlatform && !userEditedRef.current.has("utmSource")) {
      setFields((prev) => ({ ...prev, utmSource: channelPlatform }))
    }
  }, [channelPlatform])

  // Auto-fill utmCampaign from campaignSlug
  useEffect(() => {
    if (campaignSlug && !userEditedRef.current.has("utmCampaign")) {
      setFields((prev) => ({ ...prev, utmCampaign: campaignSlug }))
    }
  }, [campaignSlug])

  const handleFieldChange = useCallback(
    (field: keyof UtmFields, value: string) => {
      userEditedRef.current.add(field)
      setFields((prev) => ({ ...prev, [field]: value }))
    },
    []
  )

  const handleTemplateSelect = useCallback((template: UtmTemplate) => {
    // Template is explicit user action -- overwrite all UTM fields
    setFields((prev) => ({
      ...prev,
      utmSource: template.utm_source ?? prev.utmSource,
      utmMedium: template.utm_medium ?? prev.utmMedium,
      utmCampaign: template.utm_campaign ?? prev.utmCampaign,
      utmContent: template.utm_content ?? prev.utmContent,
    }))
    // Clear auto-fill tracking for overwritten fields
    userEditedRef.current.delete("utmSource")
    userEditedRef.current.delete("utmMedium")
    userEditedRef.current.delete("utmCampaign")
    userEditedRef.current.delete("utmContent")
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      const input: CreateLinkInput = {
        originalUrl: fields.originalUrl,
        utmSource: fields.utmSource || undefined,
        utmMedium: fields.utmMedium || "social",
        utmCampaign: fields.utmCampaign || undefined,
        utmContent: fields.utmContent || undefined,
        utmTerm: fields.utmTerm || undefined,
        title: fields.title || undefined,
      }

      const result = await createLink.mutateAsync(input)
      onLinkCreated(result.data.id)
    },
    [fields, createLink, onLinkCreated]
  )

  const previewUrl = useMemo(() => buildPreviewUrl(fields), [fields])

  const isValid = fields.originalUrl.length > 0

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Template Selector */}
      <div className="space-y-1.5">
        <Label htmlFor="utm-template">UTM-Vorlage</Label>
        <UtmTemplateSelect onSelect={handleTemplateSelect} />
      </div>

      {/* URL */}
      <div className="space-y-1.5">
        <Label htmlFor="original-url">URL *</Label>
        <Input
          id="original-url"
          type="url"
          placeholder="https://example.com/page"
          value={fields.originalUrl}
          onChange={(e) => handleFieldChange("originalUrl", e.target.value)}
          required
        />
      </div>

      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="link-title">Titel</Label>
        <Input
          id="link-title"
          placeholder="Optionaler Titel fuer den Link"
          value={fields.title}
          onChange={(e) => handleFieldChange("title", e.target.value)}
          maxLength={200}
        />
      </div>

      {/* UTM Parameters Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="utm-source">UTM Source</Label>
          <Input
            id="utm-source"
            placeholder="instagram"
            value={fields.utmSource}
            onChange={(e) => handleFieldChange("utmSource", e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="utm-medium">UTM Medium</Label>
          <Input
            id="utm-medium"
            placeholder="social"
            value={fields.utmMedium}
            onChange={(e) => handleFieldChange("utmMedium", e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="utm-campaign">UTM Campaign</Label>
          <Input
            id="utm-campaign"
            placeholder="kampagnen-slug"
            value={fields.utmCampaign}
            onChange={(e) => handleFieldChange("utmCampaign", e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="utm-content">UTM Content</Label>
          <Input
            id="utm-content"
            placeholder="Optional"
            value={fields.utmContent}
            onChange={(e) => handleFieldChange("utmContent", e.target.value)}
          />
        </div>

        <div className="col-span-2 space-y-1.5">
          <Label htmlFor="utm-term">UTM Term</Label>
          <Input
            id="utm-term"
            placeholder="Optional"
            value={fields.utmTerm}
            onChange={(e) => handleFieldChange("utmTerm", e.target.value)}
          />
        </div>
      </div>

      {/* URL Preview */}
      {previewUrl && (
        <div className="space-y-1.5">
          <Label className="text-muted-foreground">Vorschau</Label>
          <p className="break-all rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
            {previewUrl}
          </p>
        </div>
      )}

      {/* Submit */}
      <Button
        type="submit"
        className="w-full"
        disabled={!isValid || createLink.isPending}
      >
        {createLink.isPending ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Wird erstellt...
          </>
        ) : (
          "Link erstellen"
        )}
      </Button>
    </form>
  )
}
