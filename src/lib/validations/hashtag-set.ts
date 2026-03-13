import { z } from "zod"

export const createHashtagSetSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich").max(50, "Name darf maximal 50 Zeichen lang sein"),
  hashtags: z.array(z.string().min(1)).min(1, "Mindestens ein Hashtag erforderlich"),
  category: z.enum(["brand", "produkt", "kampagne"]).nullable().optional(),
})

export const updateHashtagSetSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich").max(50, "Name darf maximal 50 Zeichen lang sein").optional(),
  hashtags: z.array(z.string().min(1)).min(1, "Mindestens ein Hashtag erforderlich").optional(),
  category: z.enum(["brand", "produkt", "kampagne"]).nullable().optional(),
})

export type CreateHashtagSetInput = z.infer<typeof createHashtagSetSchema>
export type UpdateHashtagSetInput = z.infer<typeof updateHashtagSetSchema>
