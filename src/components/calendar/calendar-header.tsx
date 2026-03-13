"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useCalendarStore } from "@/stores/calendar-store"
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

  const periodLabel = getFormattedPeriod(currentDate, view)

  return (
    <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-2">
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
  )
}
