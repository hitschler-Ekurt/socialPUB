import { PenSquare } from "lucide-react"
import { ComingSoon } from "@/components/shared/coming-soon"

export default function ComposerPage() {
  return (
    <ComingSoon
      icon={PenSquare}
      title="Composer"
      description="Erstelle und bearbeite deine Social-Media-Posts."
    />
  )
}
