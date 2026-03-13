import { Lightbulb } from "lucide-react"
import { ComingSoon } from "@/components/shared/coming-soon"

export default function IdeasPage() {
  return (
    <ComingSoon
      icon={Lightbulb}
      title="Ideen"
      description="Sammle und organisiere deine Content-Ideen."
    />
  )
}
