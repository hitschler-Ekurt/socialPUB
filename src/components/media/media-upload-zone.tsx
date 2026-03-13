"use client"

import { useCallback, useRef, useState } from "react"
import { Upload, CheckCircle2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { useUploadMedia } from "@/hooks/use-media"
import { useRequireRole } from "@/hooks/use-require-role"

type UploadItem = {
  id: string
  name: string
  status: "pending" | "uploading" | "done" | "error"
}

export function MediaUploadZone() {
  const { allowed: canUpload } = useRequireRole(["admin", "editor"])
  const uploadMutation = useUploadMedia()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploads, setUploads] = useState<UploadItem[]>([])

  const processFiles = useCallback(
    async (files: FileList | File[]) => {
      const validFiles: File[] = []

      for (const file of Array.from(files)) {
        if (
          file.type.startsWith("image/") ||
          file.type.startsWith("video/")
        ) {
          validFiles.push(file)
        } else {
          toast.error("Nur Bilder und Videos erlaubt")
        }
      }

      if (validFiles.length === 0) return

      const newUploads: UploadItem[] = validFiles.map((f) => ({
        id: crypto.randomUUID(),
        name: f.name,
        status: "pending" as const,
      }))

      setUploads((prev) => [...prev, ...newUploads])

      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i]
        const uploadId = newUploads[i].id

        setUploads((prev) =>
          prev.map((u) =>
            u.id === uploadId ? { ...u, status: "uploading" } : u
          )
        )

        try {
          await uploadMutation.mutateAsync(file)
          setUploads((prev) =>
            prev.map((u) =>
              u.id === uploadId ? { ...u, status: "done" } : u
            )
          )
        } catch {
          setUploads((prev) =>
            prev.map((u) =>
              u.id === uploadId ? { ...u, status: "error" } : u
            )
          )
        }
      }

      // Clear completed uploads after 3 seconds
      setTimeout(() => {
        setUploads((prev) => prev.filter((u) => u.status !== "done"))
      }, 3000)
    },
    [uploadMutation]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      if (e.dataTransfer.files.length > 0) {
        processFiles(e.dataTransfer.files)
      }
    },
    [processFiles]
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        processFiles(e.target.files)
        e.target.value = ""
      }
    },
    [processFiles]
  )

  if (!canUpload) return null

  return (
    <div className="space-y-3">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-8 transition-colors ${
          isDragOver
            ? "border-primary-500 bg-primary-50"
            : "border-neutral-200 bg-neutral-50/50"
        }`}
      >
        <Upload
          className={`h-8 w-8 ${isDragOver ? "text-primary-500" : "text-neutral-400"}`}
        />
        <div className="text-center">
          <p className="text-sm font-medium text-neutral-600">
            Dateien hierher ziehen
          </p>
          <p className="text-xs text-neutral-400">
            oder klicke um Dateien auszuwaehlen
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
        >
          Hochladen
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {uploads.length > 0 && (
        <div className="space-y-1">
          {uploads.map((upload) => (
            <div
              key={upload.id}
              className="flex items-center gap-2 rounded-md bg-neutral-50 px-3 py-2 text-sm"
            >
              {upload.status === "uploading" || upload.status === "pending" ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary-500" />
              ) : upload.status === "done" ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <span className="h-4 w-4 text-red-500">!</span>
              )}
              <span className="truncate text-neutral-600">{upload.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
