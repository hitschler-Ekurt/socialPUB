// Workflow state machine for post approval pipeline
// Statuses match the DB enum: draft, review, approved, scheduled, published, failed

export type PostStatus = "draft" | "review" | "approved" | "scheduled" | "published" | "failed"

export type WorkflowAction = "submit_review" | "approve" | "reject" | "schedule" | "retry"

export type UserRole = "admin" | "editor" | "viewer"

/**
 * Valid status transitions map.
 * Each key is a current status, values are the statuses it can transition to.
 */
export const VALID_TRANSITIONS: Record<PostStatus, readonly PostStatus[]> = {
  draft: ["review"],
  review: ["approved", "draft"],
  approved: ["scheduled"],
  scheduled: ["published", "failed"],
  failed: ["scheduled"],
  published: [],
} as const

/**
 * Which roles are allowed to perform each action.
 */
export const ACTION_ROLES: Record<WorkflowAction, readonly UserRole[]> = {
  submit_review: ["admin", "editor"],
  approve: ["admin"],
  reject: ["admin"],
  schedule: ["admin", "editor"],
  retry: ["admin", "editor"],
} as const

/**
 * Maps each action to the resulting target status.
 */
export const ACTION_TO_STATUS: Record<WorkflowAction, PostStatus> = {
  submit_review: "review",
  approve: "approved",
  reject: "draft",
  schedule: "scheduled",
  retry: "scheduled",
} as const

export type TransitionResult =
  | { valid: true; targetStatus: PostStatus }
  | { valid: false; error: string }

/**
 * Validate whether a workflow transition is allowed.
 *
 * @param currentStatus - The post's current status
 * @param action - The workflow action being attempted
 * @param userRole - The role of the user performing the action
 * @returns Validation result with target status on success, error message on failure
 */
export function validateTransition(
  currentStatus: PostStatus,
  action: WorkflowAction,
  userRole: UserRole
): TransitionResult {
  // Check role permission
  const allowedRoles = ACTION_ROLES[action]
  if (!allowedRoles.includes(userRole)) {
    return {
      valid: false,
      error: `Rolle "${userRole}" darf die Aktion "${action}" nicht ausfuehren`,
    }
  }

  // Determine target status
  const targetStatus = ACTION_TO_STATUS[action]

  // Check if transition is valid
  const validTargets = VALID_TRANSITIONS[currentStatus]
  if (!validTargets.includes(targetStatus)) {
    return {
      valid: false,
      error: `Ungueltige Transition: "${currentStatus}" -> "${targetStatus}" (Aktion: "${action}")`,
    }
  }

  return { valid: true, targetStatus }
}
