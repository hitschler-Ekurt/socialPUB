"use client"

import { useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { useCalendarStore } from "@/stores/calendar-store"
import { useChannels } from "@/hooks/use-channels"
import { useCampaigns } from "@/hooks/use-campaigns"
import {
  formatMonthYear,
  formatWeekRange,
  formatDayHeader,
} from "@/lib/calendar-utils"
import { cn } from "@/lib/utils"

type ViewOption = {
  readonly key: "month" | "week" | "day"
  readonly label: string
}

const VIEW_OPTIONS: ViewOption[] = [
  { key: "month", label: "Monat" },
  { key: "week", label: "Woche" },
  { key: "day", label: "Tag" },
]

const STATUS_OPTIONS = [
  { value: "draft", label: "Entwurf" },
  { value: "scheduled", label: "Geplant" },
  { value: "published", label: "Veroeffentlicht" },
  { value: "failed", label: "Fehlgeschlagen" },
]

const ALL_VALUE = "__all__"

function getFormattedPeriod(date: Date, view: "month" | "week" | "day"): string {
  switch (view) {
    case "month":
      return formatMonthYear(date)
    case "week":
      return formatWeekRange(date)
    case "day":
      return formatDayHeader(date)
  }
}

export function CalendarHeader() {
  const currentDate = useCalendarStore((s) => s.currentDate)
  const view = useCalendarStore((s) => s.view)
  const navigateBack = useCalendarStore((s) => s.navigateBack)
  const navigateForward = useCalendarStore((s) => s.navigateForward)
  const goToToday = useCalendarStore((s) => s.goToToday)
  const setView = useCalendarStore((s) => s.setView)

  const filterChannelId = useCalendarStore((s) => s.filterChannelId)
  const filterStatus = useCalendarStore((s) => s.filterStatus)
  const filterCampaignId = useCalendarStore((s) => s.filterCampaignId)
  const setFilterChannelId = useCalendarStore((s) => s.setFilterChannelId)
  const setFilterStatus = useCalendarStore((s) => s.setFilterStatus)
  const setFilterCampaignId = useCalendarStore((s) => s.setFilterCampaignId)
  const clearFilters = useCalendarStore((s) => s.clearFilters)

  const { data: channels } = useChannels()
  const { data: campaigns } = useCampaigns()

  const hasActiveFilters = Boolean(filterChannelId || filterStatus || filterCampaignId)

  const periodLabel = getFormattedPeriod(currentDate, view)

  const handleChannelChange = useCallback(
    (value: string | null) => {
      setFilterChannelId(!value || value === ALL_VALUE ? null : value)
    },
    [setFilterChannelId]
  )

  const handleStatusChange = useCallback(
    (value: string | null) => {
      setFilterStatus(!value || value === ALL_VALUE ? null : value)
    },
    [setFilterStatus]
  )

  const handleCampaignChange = useCallback(
    (value: string | null) => {
      setFilterCampaignId(!value || value === ALL_VALUE ? null : value)
    },
    [setFilterCampaignId]
  )

  return (
    <div className="border-b border-neutral-200">
      {/* Navigation row */}
      <div className="flex items-center justify-between px-4 py-2">
        {/* Left side: navigation */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" onClick={navigateBack}>
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={navigateForward}>
            <ChevronRight className="size-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday} className="ml-1">
            Heute
          </Button>
        </div>

        {/* Center: period label */}
        <h2 className="text-base font-semibold capitalize text-neutral-800">
          {periodLabel}
        </h2>

        {/* Right side: view switcher */}
        <div className="flex items-center rounded-lg border border-neutral-200">
          {VIEW_OPTIONS.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setView(option.key)}
              className={cn(
                "px-3 py-1 text-sm font-medium transition-colors",
                "first:rounded-l-lg last:rounded-r-lg",
                view === option.key
                  ? "bg-primary text-primary-foreground"
                  : "text-neutral-600 hover:bg-neutral-100"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-3 border-t border-neutral-100 px-4 py-2">
        {/* Channel filter */}
        <Select
          value={filterChannelId ?? ALL_VALUE}
          onValueChange={handleChannelChange}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Alle Kanaele" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>Alle Kanaele</SelectItem>
            {(channels ?? []).map((channel) => (
              <SelectItem key={channel.id} value={channel.id}>
                {channel.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status filter */}
        <Select
          value={filterStatus ?? ALL_VALUE}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Alle Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>Alle Status</SelectItem>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Campaign filter */}
        <Select
          value={filterCampaignId ?? ALL_VALUE}
          onValueChange={handleCampaignChange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Alle Kampagnen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>Alle Kampagnen</SelectItem>
            {(campaigns ?? []).map((campaign) => (
              <SelectItem key={campaign.id} value={campaign.id}>
                <span className="flex items-center gap-1.5">
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

        {/* Clear filters */}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="mr-1 size-4" />
            Filter zuruecksetzen
          </Button>
        )}
      </div>
    </div>
  )
}
