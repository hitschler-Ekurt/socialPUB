import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { PostType } from "@/lib/constants/platform-limits"

type ComposerState = {
  readonly caption: string
  readonly captionOverrides: Record<string, string>
  readonly selectedChannelIds: string[]
  readonly selectedMediaIds: string[]
  readonly campaignId: string | null
  readonly hashtags: string[]
  readonly firstComment: string
  readonly scheduledAt: string | null
  readonly postType: PostType
  readonly linkId: string | null
  readonly updateLinkinbio: boolean
}

type ComposerActions = {
  readonly setCaption: (caption: string) => void
  readonly setCaptionOverride: (platform: string, caption: string) => void
  readonly removeCaptionOverride: (platform: string) => void
  readonly toggleChannel: (channelId: string) => void
  readonly setSelectedChannelIds: (ids: string[]) => void
  readonly setSelectedMediaIds: (ids: string[]) => void
  readonly setCampaignId: (id: string | null) => void
  readonly addHashtags: (tags: string[]) => void
  readonly removeHashtag: (tag: string) => void
  readonly setFirstComment: (text: string) => void
  readonly setScheduledAt: (date: string | null) => void
  readonly setPostType: (type: PostType) => void
  readonly setLinkId: (id: string | null) => void
  readonly setUpdateLinkinbio: (value: boolean) => void
  readonly reset: () => void
}

type ComposerStore = ComposerState & ComposerActions

const initialState: ComposerState = {
  caption: "",
  captionOverrides: {},
  selectedChannelIds: [],
  selectedMediaIds: [],
  campaignId: null,
  hashtags: [],
  firstComment: "",
  scheduledAt: null,
  postType: "image",
  linkId: null,
  updateLinkinbio: false,
}

export const useComposerStore = create<ComposerStore>()(
  persist(
    (set) => ({
      ...initialState,

      setCaption: (caption: string) => set({ caption }),

      setCaptionOverride: (platform: string, caption: string) =>
        set((state) => ({
          captionOverrides: { ...state.captionOverrides, [platform]: caption },
        })),

      removeCaptionOverride: (platform: string) =>
        set((state) => {
          const { [platform]: _, ...rest } = state.captionOverrides
          return { captionOverrides: rest }
        }),

      toggleChannel: (channelId: string) =>
        set((state) => ({
          selectedChannelIds: state.selectedChannelIds.includes(channelId)
            ? state.selectedChannelIds.filter((id) => id !== channelId)
            : [...state.selectedChannelIds, channelId],
        })),

      setSelectedChannelIds: (ids: string[]) =>
        set({ selectedChannelIds: ids }),

      setSelectedMediaIds: (ids: string[]) =>
        set({ selectedMediaIds: ids }),

      setCampaignId: (id: string | null) => set({ campaignId: id }),

      addHashtags: (tags: string[]) =>
        set((state) => ({
          hashtags: [...new Set([...state.hashtags, ...tags])],
        })),

      removeHashtag: (tag: string) =>
        set((state) => ({
          hashtags: state.hashtags.filter((t) => t !== tag),
        })),

      setFirstComment: (text: string) => set({ firstComment: text }),

      setScheduledAt: (date: string | null) => set({ scheduledAt: date }),

      setPostType: (type: PostType) => set({ postType: type }),

      setLinkId: (id: string | null) => set({ linkId: id }),

      setUpdateLinkinbio: (value: boolean) => set({ updateLinkinbio: value }),

      reset: () => set(initialState),
    }),
    {
      name: "hitschies-composer",
    }
  )
)
