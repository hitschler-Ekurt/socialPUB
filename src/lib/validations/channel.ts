import { z } from "zod"

export const connectChannelSchema = z.object({
  platform: z.enum(["instagram", "tiktok"]),
})

export const callbackSchema = z.object({
  code: z.string().min(1, "Code ist erforderlich"),
  state: z.string().optional(),
  platform: z.enum(["instagram", "tiktok"]),
  profileId: z.string().min(1, "Profile ID ist erforderlich"),
})

export type ConnectChannelInput = z.infer<typeof connectChannelSchema>
export type CallbackInput = z.infer<typeof callbackSchema>
