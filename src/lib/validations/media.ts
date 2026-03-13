import { z } from "zod"

export const createMediaSchema = z.object({
  file_name: z.string().min(1, "Dateiname ist erforderlich"),
  file_path: z.string().min(1, "Dateipfad ist erforderlich"),
  file_size: z.number().positive("Dateigroesse muss positiv sein"),
  mime_type: z.string().min(1, "MIME-Typ ist erforderlich"),
  media_type: z.enum(["image", "video", "gif"]),
  width: z.number().nullable().optional(),
  height: z.number().nullable().optional(),
  duration_seconds: z.number().nullable().optional(),
  thumbnail_path: z.string().nullable().optional(),
})

export const updateMediaTagsSchema = z.object({
  tags: z.array(z.string()),
})

export const mediaFilterSchema = z.object({
  media_type: z.enum(["image", "video", "gif"]).optional(),
  tags: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(24),
})

export type CreateMediaInput = z.infer<typeof createMediaSchema>
export type UpdateMediaTagsInput = z.infer<typeof updateMediaTagsSchema>
export type MediaFilterInput = z.infer<typeof mediaFilterSchema>
