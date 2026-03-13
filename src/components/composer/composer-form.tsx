"use client"

import { useState, useMemo, useCallback } from "react"
import { useComposerStore } from "@/stores/composer-store"
import { useCreatePost, useUpdatePost } from "@/hooks/use-posts"
import { useChannels } from "@/hooks/use-channels"
import { useCampaigns } from "@/hooks/use-campaigns"
import { useLink } from "@/hooks/use-links"
import { useMedia } from "@/hooks/use-media"
import { createPostSchema } from "@/lib/validations/post"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { ChannelSelector } from "./channel-selector"
import { PlatformOverride } from "./platform-override"
import { MediaPicker } from "./media-picker"
import { CampaignPicker } from "./campaign-picker"
import { HashtagInserter } from "./hashtag-inserter"
import { FirstCommentInput } from "./first-comment-input"
import { SchedulePicker } from "./schedule-picker"
import { InstagramPreview } from "@/components/previews/instagram-preview"
import { TikTokPreview } from "@/components/previews/tiktok-preview"
import { LinkDialog } from "@/components/links/link-dialog"
import { CalendarClock, Link2, X } from "lucide-react"
import type { CreatePostInput } from "@/lib/validations/post"
import type { Database } from "@/lib/supabase/types"

type Media = Database["public"]["Tables"]["media"]["Row"]

const STORAGE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""

function getMediaUrl(media: Media): string {
  if (media.thumbnail_path) {
    return `${STORAGE_URL}/storage/v1/object/public/media/${media.thumbnail_path}`
  }
  return `${STORAGE_URL}/storage/v1/object/public/media/${media.file_path}`
}

function buildPostInput(
  state: ReturnType<typeof useComposerStore.getState>,
  status: "draft" | "scheduled"
): CreatePostInput {
  return {
    caption: state.caption || undefined,
    captionOverrides:
      Object.keys(state.captionOverrides).length > 0
        ? state.captionOverrides
        : undefined,
    postType: state.postType,
    hashtags: state.hashtags.length > 0 ? state.hashtags : undefined,
    firstComment: state.firstComment || undefined,
    scheduledAt:
      status === "scheduled" && state.scheduledAt
        ? state.scheduledAt
        : undefined,
    campaignId: state.campaignId ?? undefined,
    linkId: state.linkId ?? undefined,
    channelIds: state.selectedChannelIds,
    mediaIds:
      state.selectedMediaIds.length > 0 ? state.selectedMediaIds : undefined,
    updateLinkinbio: state.updateLinkinbio ?? false,
  }
}

type ComposerFormProps = {
  readonly editPostId?: string
}

export function ComposerForm({ editPostId }: ComposerFormProps = {}) {
  const isEditMode = Boolean(editPostId)
  const createPost = useCreatePost()
  const updatePost = useUpdatePost()
  const reset = useComposerStore((s) => s.reset)
  const selectedChannelIds = useComposerStore((s) => s.selectedChannelIds)
  const scheduledAt = useComposerStore((s) => s.scheduledAt)
  const caption = useComposerStore((s) => s.caption)
  const hashtags = useComposerStore((s) => s.hashtags)
  const campaignId = useComposerStore((s) => s.campaignId)
  const linkId = useComposerStore((s) => s.linkId)
  const setLinkId = useComposerStore((s) => s.setLinkId)
  const selectedMediaIds = useComposerStore((s) => s.selectedMediaIds)

  const [linkDialogOpen, setLinkDialogOpen] = useState(false)

  // Fetch channels to determine platforms
  const { data: channels } = useChannels()
  const { data: campaigns } = useCampaigns()
  const { data: linkedLink } = useLink(linkId ?? undefined)
  const { data: mediaResponse } = useMedia()

  // Determine selected platforms
  const selectedPlatforms = useMemo(() => {
    if (!channels) return []
    return [
      ...new Set(
        channels
          .filter((ch) => selectedChannelIds.includes(ch.id))
          .map((ch) => ch.platform)
      ),
    ]
  }, [channels, selectedChannelIds])

  // Get first selected channel's platform for link dialog auto-fill
  const firstChannelPlatform = useMemo(() => {
    if (!channels) return null
    const firstSelected = channels.find((ch) =>
      selectedChannelIds.includes(ch.id)
    )
    return firstSelected?.platform ?? null
  }, [channels, selectedChannelIds])

  // Get campaign slug for link dialog auto-fill
  const campaignSlug = useMemo(() => {
    if (!campaignId || !campaigns) return null
    const campaign = campaigns.find((c) => c.id === campaignId)
    return campaign?.slug ?? null
  }, [campaignId, campaigns])

  // Get selected campaign for color display
  const selectedCampaign = useMemo(() => {
    if (!campaignId || !campaigns) return null
    return campaigns.find((c) => c.id === campaignId) ?? null
  }, [campaignId, campaigns])

  // Build preview data
  const previewData = useMemo(() => {
    const firstChannel = channels?.find((ch) =>
      selectedChannelIds.includes(ch.id)
    )
    const channelName = firstChannel?.name ?? "hitschies"
    const channelAvatar = firstChannel?.avatar_url ?? null

    // Find first selected media for preview
    const firstMediaId = selectedMediaIds[0]
    const allMedia = mediaResponse?.data ?? []
    const firstMedia = firstMediaId
      ? allMedia.find((m) => m.id === firstMediaId)
      : null

    return {
      caption,
      hashtags,
      mediaUrl: firstMedia ? getMediaUrl(firstMedia) : null,
      mediaType: (firstMedia?.media_type === "video" ? "video" : "image") as
        | "image"
        | "video",
      channelName,
      channelAvatar,
    }
  }, [caption, hashtags, channels, selectedChannelIds, selectedMediaIds, mediaResponse])

  const showInstagram =
    selectedPlatforms.length === 0 || selectedPlatforms.includes("instagram")
  const showTikTok =
    selectedPlatforms.length === 0 || selectedPlatforms.includes("tiktok")

  const handleLinkCreated = useCallback(
    (newLinkId: string) => {
      setLinkId(newLinkId)
    },
    [setLinkId]
  )

  function handleSubmit(status: "draft" | "scheduled") {
    const state = useComposerStore.getState()
    const input = buildPostInput(state, status)

    const result = createPostSchema.safeParse(input)
    if (!result.success) {
      const errors = result.error.issues.map((i) => i.message)
      errors.forEach((msg) => toast.error(msg))
      return
    }

    if (isEditMode && editPostId) {
      updatePost.mutate(
        { id: editPostId, ...result.data },
        {
          onSuccess: () => {
            reset()
          },
        }
      )
    } else {
      createPost.mutate(result.data, {
        onSuccess: () => {
          reset()
        },
      })
    }
  }

  const isMutating = createPost.isPending || updatePost.isPending

  const canSchedule =
    selectedChannelIds.length > 0 && scheduledAt !== null
  const canSaveDraft = selectedChannelIds.length > 0

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      {/* Left column: form */}
      <div className="space-y-6">
        {/* Channel selector */}
        <section className="space-y-2">
          <h3 className="text-sm font-medium text-neutral-700">Kanaele</h3>
          <ChannelSelector />
        </section>

        {/* Caption with platform overrides */}
        <section className="space-y-2">
          <h3 className="text-sm font-medium text-neutral-700">Caption</h3>
          <PlatformOverride />
        </section>

        {/* Media picker */}
        <section className="space-y-2">
          <h3 className="text-sm font-medium text-neutral-700">Medien</h3>
          <MediaPicker />
        </section>

        {/* Campaign + Hashtags row */}
        <div className="flex flex-wrap items-start gap-4">
          <section className="space-y-2">
            <h3 className="text-sm font-medium text-neutral-700">Kampagne</h3>
            <div className="flex items-center gap-2">
              <CampaignPicker />
              {selectedCampaign && (
                <span
                  className="inline-block size-4 rounded-full border border-neutral-200"
                  style={{ backgroundColor: selectedCampaign.color }}
                  title={`Kampagnenfarbe: ${selectedCampaign.color}`}
                />
              )}
            </div>
          </section>
          <section className="min-w-0 flex-1 space-y-2">
            <h3 className="text-sm font-medium text-neutral-700">Hashtags</h3>
            <HashtagInserter />
          </section>
        </div>

        {/* Link section */}
        <section className="space-y-2">
          <h3 className="text-sm font-medium text-neutral-700">Link</h3>
          {linkId && linkedLink ? (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="font-mono text-xs">
                <Link2 className="mr-1 size-3" />
                {linkedLink.short_url ?? linkedLink.original_url}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                className="size-6 p-0"
                onClick={() => setLinkId(null)}
                title="Link entfernen"
              >
                <X className="size-3.5" />
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLinkDialogOpen(true)}
            >
              <Link2 className="mr-1.5 size-4" />
              Link hinzufuegen
            </Button>
          )}
        </section>

        {/* First comment */}
        <FirstCommentInput />

        {/* Schedule picker */}
        <section className="space-y-2">
          <h3 className="text-sm font-medium text-neutral-700">Zeitplan</h3>
          <SchedulePicker />
        </section>

        {/* Action bar */}
        <div className="flex items-center gap-3 border-t pt-4">
          <Button
            variant="outline"
            disabled={!canSaveDraft || isMutating}
            onClick={() => handleSubmit("draft")}
          >
            {isEditMode ? "Entwurf aktualisieren" : "Als Entwurf speichern"}
          </Button>
          <Button
            disabled={!canSchedule || isMutating}
            onClick={() => handleSubmit("scheduled")}
          >
            <CalendarClock className="mr-1.5 size-4" />
            {isEditMode ? "Aktualisieren" : "Planen"}
          </Button>
        </div>
      </div>

      {/* Right column: live previews */}
      <aside className="hidden lg:block">
        <div className="sticky top-4 space-y-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Vorschau
          </p>

          {showInstagram && (
            <div className="space-y-1.5">
              {selectedPlatforms.length > 0 && (
                <p className="text-xs text-muted-foreground">Instagram</p>
              )}
              <InstagramPreview {...previewData} />
            </div>
          )}

          {showTikTok && (
            <div className="space-y-1.5">
              {selectedPlatforms.length > 0 && (
                <p className="text-xs text-muted-foreground">TikTok</p>
              )}
              <TikTokPreview {...previewData} />
            </div>
          )}
        </div>
      </aside>

      {/* Link creation dialog */}
      <LinkDialog
        open={linkDialogOpen}
        onOpenChange={setLinkDialogOpen}
        channelPlatform={firstChannelPlatform}
        campaignSlug={campaignSlug}
        onLinkCreated={handleLinkCreated}
      />
    </div>
  )
}
