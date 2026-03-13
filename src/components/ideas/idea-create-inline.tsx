"use client"

import { useState, useRef } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCreateIdea } from "@/hooks/use-ideas"

export function IdeaCreateInline() {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const createIdea = useCreateIdea()

  function handleCreate() {
    const trimmed = title.trim()
    if (!trimmed) {
      setIsOpen(false)
      return
    }

    createIdea.mutate({ title: trimmed })
    setTitle("")
    // Keep input visible for rapid entry
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault()
      handleCreate()
    }
    if (e.key === "Escape") {
      setTitle("")
      setIsOpen(false)
    }
  }

  function handleBlur() {
    const trimmed = title.trim()
    if (trimmed) {
      handleCreate()
    } else {
      setIsOpen(false)
    }
  }

  if (!isOpen) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start text-muted-foreground"
        onClick={() => {
          setIsOpen(true)
          setTimeout(() => inputRef.current?.focus(), 0)
        }}
      >
        <Plus className="mr-1 h-4 w-4" />
        Neue Idee
      </Button>
    )
  }

  return (
    <Input
      ref={inputRef}
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      placeholder="Neue Idee..."
      className="text-sm"
      disabled={createIdea.isPending}
      autoFocus
    />
  )
}
