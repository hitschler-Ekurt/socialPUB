import { z } from "zod"

const DRAFT_STATUSES = ["idea", "in_progress", "ready", "scheduled"] as const

export const createIdeaSchema = z.object({
  title: z.string().min(1, "Titel ist erforderlich").max(200, "Titel darf maximal 200 Zeichen lang sein"),
  description: z.string().max(2000, "Beschreibung darf maximal 2000 Zeichen lang sein").optional(),
  campaignId: z.string().uuid("Ungueltige Kampagnen-ID").optional().nullable(),
  assignedTo: z.string().uuid("Ungueltige Benutzer-ID").optional().nullable(),
})

export const updateIdeaSchema = z.object({
  title: z.string().min(1, "Titel ist erforderlich").max(200, "Titel darf maximal 200 Zeichen lang sein").optional(),
  description: z.string().max(2000, "Beschreibung darf maximal 2000 Zeichen lang sein").nullable().optional(),
  status: z.enum(DRAFT_STATUSES).optional(),
  position: z.number().int().min(0).optional(),
  campaignId: z.string().uuid("Ungueltige Kampagnen-ID").nullable().optional(),
  assignedTo: z.string().uuid("Ungueltige Benutzer-ID").nullable().optional(),
})

export type CreateIdeaInput = z.infer<typeof createIdeaSchema>
export type UpdateIdeaInput = z.infer<typeof updateIdeaSchema>
