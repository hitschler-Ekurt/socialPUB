"use client"

import { useState, useEffect, useCallback } from "react"
import { useComposerStore } from "@/stores/composer-store"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { CalendarClock } from "lucide-react"
import { format, addHours, startOfHour, isBefore, startOfDay } from "date-fns"
import { de } from "date-fns/locale"

function getNextFullHour(): Date {
  return addHours(startOfHour(new Date()), 1)
}

function formatDateForInput(date: Date): string {
  return format(date, "yyyy-MM-dd")
}

function formatTimeForInput(date: Date): string {
  return format(date, "HH:mm")
}

export function SchedulePicker() {
  const scheduledAt = useComposerStore((s) => s.scheduledAt)
  const setScheduledAt = useComposerStore((s) => s.setScheduledAt)

  const [enabled, setEnabled] = useState(scheduledAt !== null)
  const [dateStr, setDateStr] = useState(() => {
    if (scheduledAt) return formatDateForInput(new Date(scheduledAt))
    return formatDateForInput(getNextFullHour())
  })
  const [timeStr, setTimeStr] = useState(() => {
    if (scheduledAt) return formatTimeForInput(new Date(scheduledAt))
    return formatTimeForInput(getNextFullHour())
  })

  const updateSchedule = useCallback(
    (date: string, time: string) => {
      try {
        const combined = new Date(`${date}T${time}:00`)
        if (isNaN(combined.getTime())) return
        setScheduledAt(combined.toISOString())
      } catch {
        // Invalid date, ignore
      }
    },
    [setScheduledAt]
  )

  useEffect(() => {
    if (enabled) {
      updateSchedule(dateStr, timeStr)
    } else {
      setScheduledAt(null)
    }
  }, [enabled, dateStr, timeStr, updateSchedule, setScheduledAt])

  function handleToggle() {
    if (!enabled) {
      // Enabling: set defaults if not already set
      const nextHour = getNextFullHour()
      setDateStr(formatDateForInput(nextHour))
      setTimeStr(formatTimeForInput(nextHour))
    }
    setEnabled(!enabled)
  }

  const todayStr = formatDateForInput(new Date())

  return (
    <div className="space-y-3">
      <Button
        variant={enabled ? "default" : "outline"}
        size="sm"
        onClick={handleToggle}
      >
        <CalendarClock className="mr-1.5 size-4" />
        {enabled ? "Geplant" : "Jetzt planen"}
      </Button>

      {enabled && (
        <div className="flex items-end gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Datum</Label>
            <input
              type="date"
              value={dateStr}
              min={todayStr}
              onChange={(e) => setDateStr(e.target.value)}
              className="flex h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Uhrzeit</Label>
            <input
              type="time"
              value={timeStr}
              onChange={(e) => setTimeStr(e.target.value)}
              className="flex h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>
          {scheduledAt && (
            <span className="pb-1 text-xs text-muted-foreground">
              {format(new Date(scheduledAt), "dd.MM.yyyy HH:mm", {
                locale: de,
              })}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
