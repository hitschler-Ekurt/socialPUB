"use client"

import { useState, useCallback } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EntityPageHeader } from "@/components/shared/entity-page-header"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { CampaignGrid } from "@/components/campaigns/campaign-grid"
import { CampaignDialog } from "@/components/campaigns/campaign-dialog"
import { HashtagSetList } from "@/components/hashtags/hashtag-set-list"
import { HashtagSetDialog } from "@/components/hashtags/hashtag-set-dialog"
import { useCampaigns, useDeleteCampaign } from "@/hooks/use-campaigns"
import {
  useHashtagSets,
  useDeleteHashtagSet,
} from "@/hooks/use-hashtag-sets"
import type { Database } from "@/lib/supabase/types"

type Campaign = Database["public"]["Tables"]["campaigns"]["Row"] & {
  post_count: number
}
type HashtagSet = Database["public"]["Tables"]["hashtag_sets"]["Row"]

export default function CampaignsPage() {
  // Campaign state
  const { data: campaigns, isLoading: campaignsLoading } = useCampaigns()
  const deleteCampaignMutation = useDeleteCampaign()
  const [campaignDialogOpen, setCampaignDialogOpen] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)
  const [deletingCampaign, setDeletingCampaign] = useState<Campaign | null>(
    null
  )

  // Hashtag set state
  const { data: hashtagSets, isLoading: hashtagSetsLoading } = useHashtagSets()
  const deleteHashtagSetMutation = useDeleteHashtagSet()
  const [hashtagDialogOpen, setHashtagDialogOpen] = useState(false)
  const [editingHashtagSet, setEditingHashtagSet] =
    useState<HashtagSet | null>(null)
  const [deletingHashtagSet, setDeletingHashtagSet] =
    useState<HashtagSet | null>(null)

  // Campaign handlers
  const handleCreateCampaign = useCallback(() => {
    setEditingCampaign(null)
    setCampaignDialogOpen(true)
  }, [])

  const handleEditCampaign = useCallback((campaign: Campaign) => {
    setEditingCampaign(campaign)
    setCampaignDialogOpen(true)
  }, [])

  const handleDeleteCampaign = useCallback((campaign: Campaign) => {
    setDeletingCampaign(campaign)
  }, [])

  const handleConfirmDeleteCampaign = useCallback(() => {
    if (deletingCampaign) {
      deleteCampaignMutation.mutate(deletingCampaign.id)
    }
  }, [deletingCampaign, deleteCampaignMutation])

  // Hashtag set handlers
  const handleCreateHashtagSet = useCallback(() => {
    setEditingHashtagSet(null)
    setHashtagDialogOpen(true)
  }, [])

  const handleEditHashtagSet = useCallback((set: HashtagSet) => {
    setEditingHashtagSet(set)
    setHashtagDialogOpen(true)
  }, [])

  const handleDeleteHashtagSet = useCallback((set: HashtagSet) => {
    setDeletingHashtagSet(set)
  }, [])

  const handleConfirmDeleteHashtagSet = useCallback(() => {
    if (deletingHashtagSet) {
      deleteHashtagSetMutation.mutate(deletingHashtagSet.id)
    }
  }, [deletingHashtagSet, deleteHashtagSetMutation])

  return (
    <div className="space-y-6">
      <Tabs defaultValue="campaigns">
        <TabsList>
          <TabsTrigger value="campaigns">Kampagnen</TabsTrigger>
          <TabsTrigger value="hashtag-sets">Hashtag-Sets</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="pt-4">
          <div className="space-y-6">
            <EntityPageHeader
              title="Kampagnen"
              description="Organisiere deine Social-Media-Inhalte"
              actionLabel="Neue Kampagne"
              onAction={handleCreateCampaign}
            />
            <CampaignGrid
              campaigns={campaigns}
              isLoading={campaignsLoading}
              onEdit={handleEditCampaign}
              onDelete={handleDeleteCampaign}
              onCreateFirst={handleCreateCampaign}
            />
          </div>
        </TabsContent>

        <TabsContent value="hashtag-sets" className="pt-4">
          <div className="space-y-6">
            <EntityPageHeader
              title="Hashtag-Sets"
              description="Verwalte wiederverwendbare Hashtag-Sammlungen"
              actionLabel="Neues Set"
              onAction={handleCreateHashtagSet}
            />
            <HashtagSetList
              hashtagSets={hashtagSets}
              isLoading={hashtagSetsLoading}
              onEdit={handleEditHashtagSet}
              onDelete={handleDeleteHashtagSet}
              onCreateFirst={handleCreateHashtagSet}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Campaign dialogs */}
      <CampaignDialog
        open={campaignDialogOpen}
        onOpenChange={setCampaignDialogOpen}
        campaign={editingCampaign}
      />
      <ConfirmDialog
        open={Boolean(deletingCampaign)}
        onOpenChange={(open) => {
          if (!open) setDeletingCampaign(null)
        }}
        title="Kampagne loeschen"
        description={`Moechtest du die Kampagne "${deletingCampaign?.name ?? ""}" wirklich loeschen? Diese Aktion kann nicht rueckgaengig gemacht werden.`}
        confirmLabel="Loeschen"
        onConfirm={handleConfirmDeleteCampaign}
        variant="destructive"
      />

      {/* Hashtag set dialogs */}
      <HashtagSetDialog
        open={hashtagDialogOpen}
        onOpenChange={setHashtagDialogOpen}
        hashtagSet={editingHashtagSet}
      />
      <ConfirmDialog
        open={Boolean(deletingHashtagSet)}
        onOpenChange={(open) => {
          if (!open) setDeletingHashtagSet(null)
        }}
        title="Hashtag-Set loeschen"
        description={`Moechtest du das Set "${deletingHashtagSet?.name ?? ""}" wirklich loeschen? Diese Aktion kann nicht rueckgaengig gemacht werden.`}
        confirmLabel="Loeschen"
        onConfirm={handleConfirmDeleteHashtagSet}
        variant="destructive"
      />
    </div>
  )
}
