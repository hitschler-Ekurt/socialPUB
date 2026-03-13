"use client"

import { CheckCircle2, Circle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type ChecklistItem = {
  readonly id: string
  readonly label: string
  readonly completed: boolean
  readonly href?: string
}

const CHECKLIST_ITEMS: readonly ChecklistItem[] = [
  { id: "profile", label: "Profil einrichten", completed: false, href: "/settings/profile" },
  { id: "channel", label: "Ersten Kanal verbinden", completed: false },
  { id: "campaign", label: "Erste Kampagne erstellen", completed: false },
  { id: "post", label: "Ersten Post erstellen", completed: false },
] as const

export function OnboardingChecklist() {
  const completedCount = CHECKLIST_ITEMS.filter((item) => item.completed).length
  const totalCount = CHECKLIST_ITEMS.length
  const progressPercent = (completedCount / totalCount) * 100

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-lg">
          Willkommen bei hitschies Publisher!
        </CardTitle>
        <p className="text-sm text-neutral-500">
          Los geht&apos;s mit deinen ersten Schritten:
        </p>
      </CardHeader>
      <CardContent>
        {/* Progress bar */}
        <div className="mb-4">
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="text-neutral-500">Fortschritt</span>
            <span className="font-medium text-neutral-700">
              {completedCount}/{totalCount}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
            <div
              className="h-full rounded-full bg-primary-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Checklist */}
        <ul className="space-y-3">
          {CHECKLIST_ITEMS.map((item) => (
            <li key={item.id} className="flex items-center gap-3">
              {item.completed ? (
                <CheckCircle2 className="h-5 w-5 text-primary-500 shrink-0" />
              ) : (
                <Circle className="h-5 w-5 text-neutral-300 shrink-0" />
              )}
              <span
                className={
                  item.completed
                    ? "text-sm text-neutral-400 line-through"
                    : "text-sm text-neutral-700"
                }
              >
                {item.label}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
