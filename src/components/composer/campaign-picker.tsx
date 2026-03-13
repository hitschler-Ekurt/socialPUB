"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCampaigns } from "@/hooks/use-campaigns"
import { useComposerStore } from "@/stores/composer-store"

export function CampaignPicker() {
  const { data: campaigns, isLoading } = useCampaigns()
  const campaignId = useComposerStore((s) => s.campaignId)
  const setCampaignId = useComposerStore((s) => s.setCampaignId)

  if (isLoading) {
    return (
      <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
    )
  }

  return (
    <Select
      value={campaignId ?? ""}
      onValueChange={(value) =>
        setCampaignId(value === "" ? null : (value as string))
      }
    >
      <SelectTrigger className="w-48">
        <SelectValue placeholder="Keine Kampagne" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="">
          Keine Kampagne
        </SelectItem>
        {(campaigns ?? []).map((campaign) => (
          <SelectItem key={campaign.id} value={campaign.id}>
            <span
              className="mr-1.5 inline-block size-2.5 rounded-full"
              style={{ backgroundColor: campaign.color }}
            />
            {campaign.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
