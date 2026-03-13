import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

type ComingSoonProps = {
  readonly title: string
  readonly description?: string
  readonly icon: LucideIcon
}

export function ComingSoon({ title, description, icon: Icon }: ComingSoonProps) {
  return (
    <Card className="border-t-2 border-t-primary-500">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary-50">
          <Icon className="h-10 w-10 text-primary-500" />
        </div>
        <h2 className="mb-2 font-display text-2xl font-bold text-neutral-800">
          {title}
        </h2>
        <p className="mb-1 text-lg text-neutral-500">
          Hier entsteht gerade etwas Suesses!
        </p>
        {description && (
          <p className="max-w-md text-sm text-neutral-400">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}
