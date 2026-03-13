"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { EntityPageHeader } from "@/components/shared/entity-page-header"
import { ComposerForm } from "@/components/composer/composer-form"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { useComposerStore } from "@/stores/composer-store"
import { usePost } from "@/hooks/use-posts"
import { Button } from "@/components/ui/button"
import { Trash2, Loader2 } from "lucide-react"

export default function ComposerPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showDiscardDialog, setShowDiscardDialog] = useState(false)
  const reset = useComposerStore((s) => s.reset)
  const hydratedRef = useRef(false)

  // Extract URL params
  const postId = searchParams.get("postId")
  const scheduledAtParam = searchParams.get("scheduledAt")
  const captionParam = searchParams.get("caption")
  const campaignIdParam = searchParams.get("campaignId")

  const isEditMode = Boolean(postId)

  // Fetch existing post when editing
  const { data: existingPost, isLoading: isLoadingPost } = usePost(
    postId ?? undefined
  )

  // Hydrate composer store from URL params (once)
  useEffect(() => {
    if (hydratedRef.current) return

    const store = useComposerStore.getState()

    if (postId && existingPost) {
      // Edit mode: hydrate from fetched post data
      store.reset()
      store.setCaption(existingPost.caption ?? "")
      if (existingPost.scheduled_at) {
        store.setScheduledAt(existingPost.scheduled_at)
      }
      if (existingPost.campaign_id) {
        store.setCampaignId(existingPost.campaign_id)
      }
      if (existingPost.channels && existingPost.channels.length > 0) {
        store.setSelectedChannelIds(existingPost.channels)
      }
      if (existingPost.media && existingPost.media.length > 0) {
        store.setSelectedMediaIds(existingPost.media.map((m) => m.media_id))
      }
      if (existingPost.first_comment) {
        store.setFirstComment(existingPost.first_comment)
      }
      if (existingPost.post_type) {
        store.setPostType(existingPost.post_type as "image" | "video" | "carousel" | "text" | "story" | "reel")
      }

      hydratedRef.current = true
      // Clear URL params to avoid re-hydration on navigation
      router.replace("/composer", { scroll: false })
    } else if (!postId) {
      // Quick-add mode: hydrate from individual params
      if (scheduledAtParam) {
        store.setScheduledAt(scheduledAtParam)
      }
      if (captionParam) {
        store.setCaption(decodeURIComponent(captionParam))
      }
      if (campaignIdParam) {
        store.setCampaignId(campaignIdParam)
      }

      if (scheduledAtParam || captionParam || campaignIdParam) {
        hydratedRef.current = true
        router.replace("/composer", { scroll: false })
      }
    }
  }, [postId, existingPost, scheduledAtParam, captionParam, campaignIdParam, router])

  function handleDiscard() {
    reset()
    hydratedRef.current = false
  }

  // Show loading state when fetching post for edit mode
  if (isEditMode && isLoadingPost) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <Loader2 className="size-6 animate-spin text-neutral-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <EntityPageHeader
          title={isEditMode ? "Post bearbeiten" : "Neuer Post"}
          description={
            isEditMode
              ? "Bearbeite den bestehenden Post."
              : "Erstelle und plane einen neuen Social-Media-Post."
          }
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDiscardDialog(true)}
        >
          <Trash2 className="mr-1.5 size-4" />
          Entwurf verwerfen
        </Button>
      </div>

      <ComposerForm editPostId={postId ?? undefined} />

      <ConfirmDialog
        open={showDiscardDialog}
        onOpenChange={setShowDiscardDialog}
        title="Entwurf verwerfen?"
        description="Alle eingegebenen Daten gehen verloren. Dieser Vorgang kann nicht rueckgaengig gemacht werden."
        confirmLabel="Verwerfen"
        onConfirm={handleDiscard}
        variant="destructive"
      />
    </div>
  )
}
