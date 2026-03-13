import { z } from "zod"

export const createCampaignSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich").max(50, "Name darf maximal 50 Zeichen lang sein"),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Ungueltige Farbe"),
  start_date: z.string().nullable().optional(),
  end_date: z.string().nullable().optional(),
  description: z.string().max(500, "Beschreibung darf maximal 500 Zeichen lang sein").nullable().optional(),
})

export const updateCampaignSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich").max(50, "Name darf maximal 50 Zeichen lang sein").optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Ungueltige Farbe").optional(),
  start_date: z.string().nullable().optional(),
  end_date: z.string().nullable().optional(),
  description: z.string().max(500, "Beschreibung darf maximal 500 Zeichen lang sein").nullable().optional(),
})

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>
export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>
