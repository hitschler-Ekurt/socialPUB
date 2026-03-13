"use client"

import { FileText, CalendarDays, Send } from "lucide-react"
import { useUser } from "@/hooks/use-user"
import { OnboardingChecklist } from "@/components/shared/onboarding-checklist"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const STATS = [
  { label: "Posts", value: 0, icon: FileText },
  { label: "Geplant", value: 0, icon: CalendarDays },
  { label: "Veroeffentlicht", value: 0, icon: Send },
] as const

export default function DashboardPage() {
  const { profile } = useUser()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-neutral-800">
          Dashboard
        </h1>
        <p className="text-neutral-500">
          Hallo, {profile?.full_name ?? "..."}!
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {STATS.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-neutral-500">
                  {stat.label}
                </CardTitle>
                <Icon className="h-4 w-4 text-neutral-400" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-neutral-800">{stat.value}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Onboarding checklist */}
      <OnboardingChecklist />
    </div>
  )
}
