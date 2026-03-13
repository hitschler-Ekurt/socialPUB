export const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "Kalender", href: "/calendar", icon: "Calendar" },
  { label: "Composer", href: "/composer", icon: "PenSquare" },
  { label: "Media", href: "/media", icon: "Image" },
  { label: "Links", href: "/links", icon: "Link" },
  { label: "Ideen", href: "/ideas", icon: "Lightbulb" },
  { label: "Kampagnen", href: "/campaigns", icon: "Target" },
  { label: "Kanaele", href: "/channels", icon: "Radio" },
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

export const CAMPAIGN_COLORS = [
  { name: "Magenta", value: "#E6007E" },
  { name: "Lila", value: "#7C4DFF" },
  { name: "Orange", value: "#FF6D00" },
  { name: "Gruen", value: "#00C853" },
  { name: "Blau", value: "#2979FF" },
  { name: "Gelb", value: "#FFD600" },
  { name: "Rot", value: "#FF1744" },
  { name: "Tuerkis", value: "#00BFA5" },
  { name: "Pink", value: "#FF4081" },
  { name: "Indigo", value: "#3D5AFE" },
] as const

export const HASHTAG_CATEGORIES = ["brand", "produkt", "kampagne"] as const
