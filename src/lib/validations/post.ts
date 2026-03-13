import { z } from "zod"
import { POST_TYPES } from "@/lib/constants/platform-limits"

export const createPostSchema = z.object({
  caption: z.string().max(4000, "Caption darf maximal 4000 Zeichen lang sein").optional(),
  captionOverrides: z.record(z.string(), z.string()).optional(),
  postType: z.enum(POST_TYPES).default("image"),
  hashtags: z.array(z.string()).optional(),
  firstComment: z.string().max(2200, "Erster Kommentar darf maximal 2200 Zeichen lang sein").optional(),
  scheduledAt: z.string().datetime({ message: "Ungueltiges Datumsformat" }).optional(),
  campaignId: z.string().uuid("Ungueltige Kampagnen-ID").optional(),
  linkId: z.string().uuid("Ungueltige Link-ID").optional(),
  channelIds: z.array(z.string().uuid("Ungueltige Kanal-ID")).min(1, "Mindestens ein Kanal"),
  mediaIds: z.array(z.string().uuid("Ungueltige Medien-ID")).optional(),
  updateLinkinbio: z.boolean().optional().default(false),
})

export const updatePostSchema = z.object({
  caption: z.string().max(4000, "Caption darf maximal 4000 Zeichen lang sein").optional(),
  captionOverrides: z.record(z.string(), z.string()).optional(),
  postType: z.enum(POST_TYPES).optional(),
  hashtags: z.array(z.string()).optional(),
  firstComment: z.string().max(2200, "Erster Kommentar darf maximal 2200 Zeichen lang sein").optional(),
  scheduledAt: z.string().datetime({ message: "Ungueltiges Datumsformat" }).nullable().optional(),
  campaignId: z.string().uuid("Ungueltige Kampagnen-ID").nullable().optional(),
  linkId: z.string().uuid("Ungueltige Link-ID").nullable().optional(),
  channelIds: z.array(z.string().uuid("Ungueltige Kanal-ID")).min(1, "Mindestens ein Kanal").optional(),
  mediaIds: z.array(z.string().uuid("Ungueltige Medien-ID")).optional(),
  updateLinkinbio: z.boolean().optional(),
  status: z.enum(["draft", "review", "approved", "scheduled", "published", "failed"]).optional(),
})

export type CreatePostInput = z.infer<typeof createPostSchema>
export type UpdatePostInput = z.infer<typeof updatePostSchema>
