"use client"

import { format } from "date-fns"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRequireRole } from "@/hooks/use-require-role"
import type { Database } from "@/lib/supabase/types"

type Campaign = Database["public"]["Tables"]["campaigns"]["Row"] & {
  post_count: number
}

type CampaignCardProps = {
  readonly campaign: Campaign
  readonly onEdit: (campaign: Campaign) => void
  readonly onDelete: (campaign: Campaign) => void
}

function formatDateRange(startDate: string | null, endDate: string | null): string {
  if (!startDate && !endDate) return "Kein Zeitraum"

  const formatDate = (d: string) => format(new Date(d), "dd.MM.yyyy")

  if (startDate && endDate) {
    return `${formatDate(startDate)} – ${formatDate(endDate)}`
  }
  if (startDate) return `Ab ${formatDate(startDate)}`
  return `Bis ${formatDate(endDate!)}`
}

export function CampaignCard({ campaign, onEdit, onDelete }: CampaignCardProps) {
  const { allowed: canEdit } = useRequireRole(["admin", "editor"])

  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md"
      style={{ borderLeft: `4px solid ${campaign.color}` }}
      onClick={() => onEdit(campaign)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-neutral-800">{campaign.name}</h3>
            <p className="mt-1 text-sm text-neutral-500">
              {formatDateRange(campaign.start_date, campaign.end_date)}
            </p>
            {campaign.description && (
              <p className="mt-2 line-clamp-2 text-sm text-neutral-500">
                {campaign.description}
              </p>
            )}
            <Badge variant="secondary" className="mt-3">
              {campaign.post_count} {campaign.post_count === 1 ? "Post" : "Posts"}
            </Badge>
          </div>
          {canEdit && (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  />
                }
              >
                <MoreHorizontal className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit(campaign)
                  }}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Bearbeiten
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(campaign)
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Loeschen
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
