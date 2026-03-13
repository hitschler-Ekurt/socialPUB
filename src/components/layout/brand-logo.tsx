import { cn } from "@/lib/utils"

type BrandLogoProps = {
  readonly collapsed?: boolean
  readonly className?: string
}

export function BrandLogo({ collapsed = false, className }: BrandLogoProps) {
  if (collapsed) {
    return (
      <div
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full bg-primary-500 text-white font-bold text-sm",
          className
        )}
      >
        h
      </div>
    )
  }

  return (
    <div className={cn("flex items-baseline gap-1", className)}>
      <span className="font-display text-xl font-bold text-primary-500">
        hitschies
      </span>
      <span className="text-sm text-neutral-500">Publisher</span>
    </div>
  )
}
