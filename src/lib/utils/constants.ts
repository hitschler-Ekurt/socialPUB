export const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "Kalender", href: "/calendar", icon: "Calendar" },
  { label: "Composer", href: "/composer", icon: "PenSquare" },
  { label: "Media", href: "/media", icon: "Image" },
  { label: "Links", href: "/links", icon: "Link" },
  { label: "Ideen", href: "/ideas", icon: "Lightbulb" },
  { label: "Kampagnen", href: "/campaigns", icon: "Target" },
  { label: "Settings", href: "/settings", icon: "Settings" },
] as const

export const ROLES = {
  admin: "admin",
  editor: "editor",
  viewer: "viewer",
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

export const BRAND = {
  name: "hitschies Publisher",
  primaryColor: "#E6007E",
} as const
