"use client"

import { useComposerStore } from "@/stores/composer-store"
import { useCreatePost } from "@/hooks/use-posts"
import { createPostSchema } from "@/lib/validations/post"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { ChannelSelector } from "./channel-selector"
import { PlatformOverride } from "./platform-override"
import { MediaPicker } from "./media-picker"
import { CampaignPicker } from "./campaign-picker"
import { HashtagInserter } from "./hashtag-inserter"
import { FirstCommentInput } from "./first-comment-input"
import { SchedulePicker } from "./schedule-picker"
import { CalendarClock, Send } from "lucide-react"
import type { CreatePostInput } from "@/lib/validations/post"

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

export function ComposerForm() {
  const createPost = useCreatePost()
  const reset = useComposerStore((s) => s.reset)
  const selectedChannelIds = useComposerStore((s) => s.selectedChannelIds)
  const scheduledAt = useComposerStore((s) => s.scheduledAt)

  function handleSubmit(status: "draft" | "scheduled") {
    const state = useComposerStore.getState()
    const input = buildPostInput(state, status)

    const result = createPostSchema.safeParse(input)
    if (!result.success) {
      const errors = result.error.issues.map((i) => i.message)
      errors.forEach((msg) => toast.error(msg))
      return
    }

    createPost.mutate(result.data, {
      onSuccess: () => {
        reset()
      },
    })
  }

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
            <CampaignPicker />
          </section>
          <section className="min-w-0 flex-1 space-y-2">
            <h3 className="text-sm font-medium text-neutral-700">Hashtags</h3>
            <HashtagInserter />
          </section>
        </div>

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
            disabled={!canSaveDraft || createPost.isPending}
            onClick={() => handleSubmit("draft")}
          >
            Als Entwurf speichern
          </Button>
          <Button
            disabled={!canSchedule || createPost.isPending}
            onClick={() => handleSubmit("scheduled")}
          >
            <CalendarClock className="mr-1.5 size-4" />
            Planen
          </Button>
        </div>
      </div>

      {/* Right column: preview placeholder */}
      <aside className="hidden rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-6 lg:block">
        <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
          <Send className="size-8 text-neutral-300" />
          <p>Vorschau</p>
          <p className="text-xs">Wird in einem spaeteren Update hinzugefuegt</p>
        </div>
      </aside>
    </div>
  )
}
