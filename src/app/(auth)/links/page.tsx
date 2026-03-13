import { Link } from "lucide-react"
import { ComingSoon } from "@/components/shared/coming-soon"

export default function LinksPage() {
  return (
    <ComingSoon
      icon={Link}
      title="Links"
      description="Erstelle und verwalte Kurzlinks mit UTM-Tracking."
    />
  )
}
