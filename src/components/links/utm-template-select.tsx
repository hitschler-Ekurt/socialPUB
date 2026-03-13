"use client"

import { useUtmTemplates } from "@/hooks/use-utm-templates"
import type { Database } from "@/lib/supabase/types"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

type UtmTemplate = Database["public"]["Tables"]["utm_templates"]["Row"]

type UtmTemplateSelectProps = {
  readonly onSelect: (template: UtmTemplate) => void
}

export function UtmTemplateSelect({ onSelect }: UtmTemplateSelectProps) {
  const { data: templates, isLoading } = useUtmTemplates()

  if (isLoading || !templates || templates.length === 0) {
    return null
  }

  return (
    <Select
      onValueChange={(value: string | null) => {
        if (!value) return
        const template = templates.find((t) => t.id === value)
        if (template) {
          onSelect(template)
        }
      }}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="UTM-Vorlage waehlen..." />
      </SelectTrigger>
      <SelectContent>
        {templates.map((template) => (
          <SelectItem key={template.id} value={template.id}>
            <span className="flex items-center gap-2">
              {template.name}
              {template.is_default && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  Standard
                </Badge>
              )}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
