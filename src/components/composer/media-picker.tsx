"use client"

import { Button } from "@/components/ui/button"
import { ImagePlus } from "lucide-react"

export function MediaPicker() {
  return (
    <Button variant="outline" size="sm">
      <ImagePlus className="mr-1.5 size-4" />
      Medien hinzufuegen
    </Button>
  )
}
