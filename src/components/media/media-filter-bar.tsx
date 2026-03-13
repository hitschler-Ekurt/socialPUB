"use client"

import { useCallback, useEffect, useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"

type MediaFilterBarProps = {
  readonly mediaType: string | undefined
  readonly search: string | undefined
  readonly onMediaTypeChange: (value: string | undefined) => void
  readonly onSearchChange: (value: string | undefined) => void
}

const TYPE_ALL = "__all__"

export function MediaFilterBar({
  mediaType,
  search,
  onMediaTypeChange,
  onSearchChange,
}: MediaFilterBarProps) {
  const [searchInput, setSearchInput] = useState(search ?? "")

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = searchInput.trim()
      onSearchChange(trimmed || undefined)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput, onSearchChange])

  const handleTypeChange = useCallback(
    (value: string | null) => {
      onMediaTypeChange(!value || value === TYPE_ALL ? undefined : value)
    },
    [onMediaTypeChange]
  )

  const hasFilters = Boolean(mediaType || search)

  const handleClear = useCallback(() => {
    onMediaTypeChange(undefined)
    onSearchChange(undefined)
    setSearchInput("")
  }, [onMediaTypeChange, onSearchChange])

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select value={mediaType ?? TYPE_ALL} onValueChange={handleTypeChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Alle Typen" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={TYPE_ALL}>Alle</SelectItem>
          <SelectItem value="image">Bilder</SelectItem>
          <SelectItem value="video">Videos</SelectItem>
          <SelectItem value="gif">GIFs</SelectItem>
        </SelectContent>
      </Select>

      <div className="relative min-w-[200px] max-w-[300px] flex-1">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Dateiname suchen..."
          className="pl-9"
        />
      </div>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={handleClear}>
          <X className="mr-1 h-4 w-4" />
          Filter zuruecksetzen
        </Button>
      )}
    </div>
  )
}
