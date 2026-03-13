import { z } from "zod"

export const createUtmTemplateSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich").max(100, "Name darf maximal 100 Zeichen lang sein"),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  utmContent: z.string().optional(),
  isDefault: z.boolean().optional(),
})

export const updateUtmTemplateSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich").max(100, "Name darf maximal 100 Zeichen lang sein").optional(),
  utmSource: z.string().nullable().optional(),
  utmMedium: z.string().nullable().optional(),
  utmCampaign: z.string().nullable().optional(),
  utmContent: z.string().nullable().optional(),
  isDefault: z.boolean().optional(),
})

export type CreateUtmTemplateInput = z.infer<typeof createUtmTemplateSchema>
export type UpdateUtmTemplateInput = z.infer<typeof updateUtmTemplateSchema>
