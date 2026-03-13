export const PLATFORM_CHAR_LIMITS = {
  instagram: { caption: 2200, previewCutoff: 125, maxHashtags: 30 },
  tiktok: { caption: 4000, previewCutoff: 150, maxHashtags: 100 },
} as const

export type Platform = keyof typeof PLATFORM_CHAR_LIMITS

export const POST_TYPES = ["image", "video", "carousel", "text", "story", "reel"] as const
export type PostType = (typeof POST_TYPES)[number]

export const POST_STATUSES = ["draft", "review", "approved", "scheduled", "published", "failed"] as const
export type PostStatus = (typeof POST_STATUSES)[number]
