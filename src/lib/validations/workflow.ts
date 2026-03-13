import { z } from "zod"

const WORKFLOW_ACTIONS = [
  "submit_review",
  "approve",
  "reject",
  "schedule",
  "retry",
] as const

export const workflowActionSchema = z
  .object({
    action: z.enum(WORKFLOW_ACTIONS, {
      error: "Ungueltige Workflow-Aktion",
    }),
    comment: z.string().max(1000, "Kommentar darf maximal 1000 Zeichen lang sein").optional(),
    scheduledAt: z
      .string()
      .datetime({ message: "Ungueltiges Datumsformat fuer scheduledAt" })
      .optional(),
  })
  .refine(
    (data) => {
      // scheduledAt is required when action is "schedule"
      if (data.action === "schedule" && !data.scheduledAt) {
        return false
      }
      return true
    },
    {
      message: "scheduledAt ist erforderlich fuer die Aktion 'schedule'",
      path: ["scheduledAt"],
    }
  )

export type WorkflowActionInput = z.infer<typeof workflowActionSchema>
