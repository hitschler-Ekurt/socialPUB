"use client"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useHashtagSets } from "@/hooks/use-hashtag-sets"
import { useComposerStore } from "@/stores/composer-store"
import { PLATFORM_CHAR_LIMITS } from "@/lib/constants/platform-limits"
import { X, AlertTriangle } from "lucide-react"

export function HashtagInserter() {
  const { data: hashtagSets, isLoading } = useHashtagSets()
  const hashtags = useComposerStore((s) => s.hashtags)
  const addHashtags = useComposerStore((s) => s.addHashtags)
  const removeHashtag = useComposerStore((s) => s.removeHashtag)

  // Group sets by category
  const grouped = (hashtagSets ?? []).reduce<Record<string, typeof hashtagSets>>(
    (acc, set) => {
      const category = set.category ?? "Allgemein"
      if (!acc[category]) acc[category] = []
      acc[category]!.push(set)
      return acc
    },
    {}
  )

  function handleSetSelect(setId: string | null) {
    if (!setId) return
    const set = (hashtagSets ?? []).find((s) => s.id === setId)
    if (set) {
      addHashtags(set.hashtags)
    }
  }

  const instagramLimit = PLATFORM_CHAR_LIMITS.instagram.maxHashtags
  const isOverLimit = hashtags.length > instagramLimit

  return (
    <div className="space-y-3">
      <Select onValueChange={handleSetSelect}>
        <SelectTrigger className="w-48" disabled={isLoading}>
          <SelectValue placeholder="Hashtag-Set einfuegen" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(grouped).map(([category, sets]) => (
            <SelectGroup key={category}>
              <SelectLabel>{category}</SelectLabel>
              {(sets ?? []).map((set) => (
                <SelectItem key={set.id} value={set.id}>
                  {set.name} ({set.hashtags.length})
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>

      {/* Current hashtags */}
      {hashtags.length > 0 && (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {hashtags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                {tag}
                <button
                  type="button"
                  onClick={() => removeHashtag(tag)}
                  className="rounded-full p-0.5 hover:bg-neutral-300/50"
                >
                  <X className="size-2.5" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {isOverLimit && (
              <AlertTriangle className="size-3.5 text-amber-500" />
            )}
            <span className={isOverLimit ? "text-amber-600 font-medium" : ""}>
              {hashtags.length} Hashtags
              {isOverLimit && ` (Instagram-Limit: ${instagramLimit})`}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
