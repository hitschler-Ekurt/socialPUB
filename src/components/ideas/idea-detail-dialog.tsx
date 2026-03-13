"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useUpdateIdea, type Idea } from "@/hooks/use-ideas"
import { useCampaigns } from "@/hooks/use-campaigns"

type IdeaDetailDialogProps = {
  readonly idea: Idea | null
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
}

export function IdeaDetailDialog({
  idea,
  open,
  onOpenChange,
}: IdeaDetailDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [campaignId, setCampaignId] = useState<string | null>(null)
  const updateIdea = useUpdateIdea()
  const { data: campaigns } = useCampaigns()

  useEffect(() => {
    if (idea) {
      setTitle(idea.title)
      setDescription(idea.description ?? "")
      setCampaignId(idea.campaign_id)
    }
  }, [idea])

  function handleSave() {
    if (!idea || !title.trim()) return

    updateIdea.mutate(
      {
        id: idea.id,
        title: title.trim(),
        description: description.trim() || null,
        campaignId,
      },
      {
        onSuccess: () => {
          onOpenChange(false)
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Idee bearbeiten</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="idea-title">Titel</Label>
            <Input
              id="idea-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titel der Idee"
              maxLength={200}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="idea-description">Beschreibung</Label>
            <Textarea
              id="idea-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optionale Beschreibung..."
              rows={4}
              maxLength={2000}
            />
          </div>
          <div className="space-y-2">
            <Label>Kampagne</Label>
            <Select
              value={campaignId ?? "none"}
              onValueChange={(value) =>
                setCampaignId(value === "none" ? null : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Keine Kampagne" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Keine Kampagne</SelectItem>
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
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button
            onClick={handleSave}
            disabled={!title.trim() || updateIdea.isPending}
          >
            {updateIdea.isPending ? "Speichern..." : "Speichern"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
