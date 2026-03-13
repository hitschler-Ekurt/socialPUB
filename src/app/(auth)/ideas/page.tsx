"use client"

import { useState, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Lightbulb, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { IdeasBoard } from "@/components/ideas/ideas-board"
import { IdeaDetailDialog } from "@/components/ideas/idea-detail-dialog"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { useIdeas, useUpdateIdea, useDeleteIdea, type Idea } from "@/hooks/use-ideas"
import { useCampaigns } from "@/hooks/use-campaigns"
import { useDebounce } from "@/hooks/use-debounce"

export default function IdeasPage() {
  const router = useRouter()
  const [searchInput, setSearchInput] = useState("")
  const [campaignFilter, setCampaignFilter] = useState<string | null>(null)
  const [editIdea, setEditIdea] = useState<Idea | null>(null)
  const [deleteIdea, setDeleteIdea] = useState<Idea | null>(null)

  const debouncedSearch = useDebounce(searchInput, 300)

  const filters = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      campaignId: campaignFilter ?? undefined,
    }),
    [debouncedSearch, campaignFilter]
  )

  const { data: ideas = [] } = useIdeas(filters)
  const { data: campaigns } = useCampaigns()
  const updateIdea = useUpdateIdea()
  const deleteIdeaMutation = useDeleteIdea()

  const handleEdit = useCallback((idea: Idea) => {
    setEditIdea(idea)
  }, [])

  const handlePromote = useCallback(
    (idea: Idea) => {
      const params = new URLSearchParams()
      params.set("caption", idea.title)
      if (idea.campaign_id) {
        params.set("campaignId", idea.campaign_id)
      }

      // Update idea status to scheduled
      updateIdea.mutate({ id: idea.id, status: "scheduled" })

      router.push(`/composer?${params.toString()}`)
    },
    [updateIdea, router]
  )

  const handleDelete = useCallback((idea: Idea) => {
    setDeleteIdea(idea)
  }, [])

  const handleConfirmDelete = useCallback(() => {
    if (deleteIdea) {
      deleteIdeaMutation.mutate(deleteIdea.id)
      setDeleteIdea(null)
    }
  }, [deleteIdea, deleteIdeaMutation])

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-3">
        <Lightbulb className="h-6 w-6 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Ideen</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Ideen suchen..."
            className="pl-9"
          />
        </div>
        <Select
          value={campaignFilter ?? "all"}
          onValueChange={(value) =>
            setCampaignFilter(value === "all" ? null : value)
          }
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Alle Kampagnen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Kampagnen</SelectItem>
            {campaigns?.map((campaign) => (
              <SelectItem key={campaign.id} value={campaign.id}>
                <span className="flex items-center gap-2">
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: campaign.color }}
                  />
                  {campaign.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <IdeasBoard
        ideas={ideas}
        onEdit={handleEdit}
        onPromote={handlePromote}
        onDelete={handleDelete}
      />

      <IdeaDetailDialog
        idea={editIdea}
        open={editIdea !== null}
        onOpenChange={(open) => {
          if (!open) setEditIdea(null)
        }}
      />

      <ConfirmDialog
        open={deleteIdea !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteIdea(null)
        }}
        title="Idee loeschen"
        description={`Moechtest du "${deleteIdea?.title}" wirklich loeschen? Diese Aktion kann nicht rueckgaengig gemacht werden.`}
        confirmLabel="Loeschen"
        onConfirm={handleConfirmDelete}
        variant="destructive"
      />
    </div>
  )
}
