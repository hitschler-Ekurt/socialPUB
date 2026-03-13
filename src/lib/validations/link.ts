import { z } from "zod"

export const createLinkSchema = z.object({
  originalUrl: z.string().url("Ungueltige URL"),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional().default("social"),
  utmCampaign: z.string().optional(),
  utmContent: z.string().optional(),
  utmTerm: z.string().optional(),
  title: z.string().max(200, "Titel darf maximal 200 Zeichen lang sein").optional(),
  campaignId: z.string().uuid("Ungueltige Kampagnen-ID").optional(),
  expiresAt: z.string().datetime({ message: "Ungueltiges Datumsformat" }).optional(),
})

export const updateLinkSchema = z.object({
  originalUrl: z.string().url("Ungueltige URL").optional(),
  utmSource: z.string().nullable().optional(),
  utmMedium: z.string().nullable().optional(),
  utmCampaign: z.string().nullable().optional(),
  utmContent: z.string().nullable().optional(),
  utmTerm: z.string().nullable().optional(),
  title: z.string().max(200, "Titel darf maximal 200 Zeichen lang sein").nullable().optional(),
  campaignId: z.string().uuid("Ungueltige Kampagnen-ID").nullable().optional(),
  expiresAt: z.string().datetime({ message: "Ungueltiges Datumsformat" }).nullable().optional(),
  isActive: z.boolean().optional(),
})

export type CreateLinkInput = z.infer<typeof createLinkSchema>
export type UpdateLinkInput = z.infer<typeof updateLinkSchema>
