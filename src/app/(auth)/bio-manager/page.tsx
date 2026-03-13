"use client"

import { useState } from "react"
import { useBioPages } from "@/hooks/use-bio-pages"
import { useBioItems } from "@/hooks/use-bio-items"
import { EntityPageHeader } from "@/components/shared/entity-page-header"
import { BioPageForm } from "@/components/bio-manager/bio-page-form"
import { BioItemList } from "@/components/bio-manager/bio-item-list"
import { BioPreview } from "@/components/bio-manager/bio-preview"
import { Skeleton } from "@/components/ui/skeleton"

function BioManagerSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-[300px]" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-[400px]" />
        <Skeleton className="h-[400px]" />
      </div>
    </div>
  )
}

export default function BioManagerPage() {
  const { data: bioPages, isLoading } = useBioPages()
  const [isEditing, setIsEditing] = useState(false)

  const bioPage = bioPages?.[0] ?? null
  const { data: bioItems } = useBioItems(bioPage?.id)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <EntityPageHeader
          title="Link-in-Bio Manager"
          description="Erstelle und verwalte deine Bio-Seite mit Links."
        />
        <BioManagerSkeleton />
      </div>
    )
  }

  // No bio page yet -- show create form
  if (!bioPage) {
    return (
      <div className="space-y-6">
        <EntityPageHeader
          title="Link-in-Bio Manager"
          description="Erstelle deine Bio-Seite mit Links."
        />
        <div className="max-w-lg">
          <BioPageForm mode="create" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <EntityPageHeader
        title="Link-in-Bio Manager"
        description={`Deine Bio-Seite: /bio/${bioPage.slug}`}
        actionLabel={isEditing ? undefined : "Seite bearbeiten"}
        onAction={() => setIsEditing(true)}
      />

      {isEditing && (
        <BioPageForm
          mode="edit"
          bioPage={bioPage}
          onDone={() => setIsEditing(false)}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Item list with drag-and-drop */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Links verwalten</h2>
          <BioItemList pageId={bioPage.id} items={bioItems ?? []} />
        </div>

        {/* Right: Live preview */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Vorschau</h2>
          <BioPreview bioPage={bioPage} items={bioItems ?? []} />
        </div>
      </div>
    </div>
  )
}
