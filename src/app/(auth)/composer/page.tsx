"use client"

import { useState } from "react"
import { EntityPageHeader } from "@/components/shared/entity-page-header"
import { ComposerForm } from "@/components/composer/composer-form"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { useComposerStore } from "@/stores/composer-store"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

export default function ComposerPage() {
  const [showDiscardDialog, setShowDiscardDialog] = useState(false)
  const reset = useComposerStore((s) => s.reset)

  function handleDiscard() {
    reset()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <EntityPageHeader
          title="Neuer Post"
          description="Erstelle und plane einen neuen Social-Media-Post."
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDiscardDialog(true)}
        >
          <Trash2 className="mr-1.5 size-4" />
          Entwurf verwerfen
        </Button>
      </div>

      <ComposerForm />

      <ConfirmDialog
        open={showDiscardDialog}
        onOpenChange={setShowDiscardDialog}
        title="Entwurf verwerfen?"
        description="Alle eingegebenen Daten gehen verloren. Dieser Vorgang kann nicht rueckgaengig gemacht werden."
        confirmLabel="Verwerfen"
        onConfirm={handleDiscard}
        variant="destructive"
      />
    </div>
  )
}
