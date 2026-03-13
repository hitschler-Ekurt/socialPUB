"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCampaigns } from "@/hooks/use-campaigns"
import { Search } from "lucide-react"

type LinkFiltersProps = {
  readonly onSearchChange: (query: string) => void
  readonly onCampaignFilter: (campaignId: string | null) => void
}

const ALL_CAMPAIGNS = "__all__"

export function LinkFilters({ onSearchChange, onCampaignFilter }: LinkFiltersProps) {
  const { data: campaigns } = useCampaigns()
  const [searchValue, setSearchValue] = useState("")

  // Debounce search input by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(searchValue)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchValue, onSearchChange])

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Links durchsuchen..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="pl-9"
        />
      </div>

      <Select
        onValueChange={(value: string | null) => {
          onCampaignFilter(value === ALL_CAMPAIGNS ? null : value)
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Alle Kampagnen" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_CAMPAIGNS}>Alle Kampagnen</SelectItem>
          {campaigns?.map((campaign) => (
            <SelectItem key={campaign.id} value={campaign.id}>
              <span className="flex items-center gap-2">
                <span
                  className="inline-block size-2.5 rounded-full"
                  style={{ backgroundColor: campaign.color }}
                />
                {campaign.name}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
