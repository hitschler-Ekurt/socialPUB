import { Image } from "lucide-react"
import { ComingSoon } from "@/components/shared/coming-soon"

export default function MediaPage() {
  return (
    <ComingSoon
      icon={Image}
      title="Media Library"
      description="Verwalte deine Bilder und Videos fuer Social Media."
    />
  )
}
