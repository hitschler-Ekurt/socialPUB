import { z } from "zod"

// --- Bio Page schemas ---

export const createBioPageSchema = z.object({
  slug: z
    .string()
    .min(2, "Slug muss mindestens 2 Zeichen lang sein")
    .max(50, "Slug darf maximal 50 Zeichen lang sein")
    .regex(/^[a-z0-9-]+$/, "Slug darf nur Kleinbuchstaben, Zahlen und Bindestriche enthalten"),
  title: z
    .string()
    .min(1, "Titel ist erforderlich")
    .max(100, "Titel darf maximal 100 Zeichen lang sein"),
  description: z.string().max(500, "Beschreibung darf maximal 500 Zeichen lang sein").optional(),
  logoUrl: z.string().url("Ungueltige Logo-URL").optional(),
})

export const updateBioPageSchema = z.object({
  slug: z
    .string()
    .min(2, "Slug muss mindestens 2 Zeichen lang sein")
    .max(50, "Slug darf maximal 50 Zeichen lang sein")
    .regex(/^[a-z0-9-]+$/, "Slug darf nur Kleinbuchstaben, Zahlen und Bindestriche enthalten")
    .optional(),
  title: z
    .string()
    .min(1, "Titel ist erforderlich")
    .max(100, "Titel darf maximal 100 Zeichen lang sein")
    .optional(),
  description: z
    .string()
    .max(500, "Beschreibung darf maximal 500 Zeichen lang sein")
    .nullable()
    .optional(),
  logoUrl: z.string().url("Ungueltige Logo-URL").nullable().optional(),
})

// --- Bio Item schemas ---

export const createBioItemSchema = z.object({
  linkId: z.string().uuid("Ungueltige Link-ID"),
  position: z.number().int().min(0).optional(),
  customTitle: z.string().max(200, "Titel darf maximal 200 Zeichen lang sein").optional(),
  customImageUrl: z.string().url("Ungueltige Bild-URL").optional(),
  expiresAt: z
    .string()
    .datetime({ message: "Ungueltiges Datumsformat fuer expiresAt" })
    .optional(),
})

export const updateBioItemSchema = z.object({
  linkId: z.string().uuid("Ungueltige Link-ID").optional(),
  position: z.number().int().min(0).optional(),
  customTitle: z.string().max(200, "Titel darf maximal 200 Zeichen lang sein").nullable().optional(),
  customImageUrl: z.string().url("Ungueltige Bild-URL").nullable().optional(),
  expiresAt: z
    .string()
    .datetime({ message: "Ungueltiges Datumsformat fuer expiresAt" })
    .nullable()
    .optional(),
  isVisible: z.boolean().optional(),
})

export const reorderBioItemsSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().uuid("Ungueltige Item-ID"),
      position: z.number().int().min(0),
    })
  ),
})

export type CreateBioPageInput = z.infer<typeof createBioPageSchema>
export type UpdateBioPageInput = z.infer<typeof updateBioPageSchema>
export type CreateBioItemInput = z.infer<typeof createBioItemSchema>
export type UpdateBioItemInput = z.infer<typeof updateBioItemSchema>
export type ReorderBioItemsInput = z.infer<typeof reorderBioItemsSchema>
