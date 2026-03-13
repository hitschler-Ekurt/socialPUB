"use client"

import { useState, useCallback, useMemo } from "react"
import { useLinks, useDeleteLink } from "@/hooks/use-links"
import { EntityPageHeader } from "@/components/shared/entity-page-header"
import { LinkFilters } from "@/components/links/link-filters"
import { LinkTable } from "@/components/links/link-table"
import { LinkDialog } from "@/components/links/link-dialog"
import { Skeleton } from "@/components/ui/skeleton"

function LinkTableSkeleton() {
  return (
    <div className="space-y-2 rounded-lg border p-4">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="flex items-center gap-4 py-3">
          <Skeleton className="h-5 w-[250px]" />
          <Skeleton className="h-5 w-[100px]" />
          <Skeleton className="h-5 w-[60px]" />
          <Skeleton className="h-5 w-[80px]" />
          <Skeleton className="h-5 w-[60px]" />
        </div>
      ))}
    </div>
  )
}

export default function LinksPage() {
  const { data: links, isLoading } = useLinks()
  const deleteLink = useDeleteLink()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [campaignFilter, setCampaignFilter] = useState<string | null>(null)

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  const handleCampaignFilter = useCallback((campaignId: string | null) => {
    setCampaignFilter(campaignId)
  }, [])

  const handleDelete = useCallback(
    (id: string) => {
      deleteLink.mutate(id)
    },
    [deleteLink]
  )

  const handleLinkCreated = useCallback(() => {
    setDialogOpen(false)
  }, [])

  const filteredLinks = useMemo(() => {
    if (!links) return []

    const lowerQuery = searchQuery.toLowerCase()

    return links.filter((link) => {
      // Search filter
      if (lowerQuery) {
        const matchesTitle = link.title?.toLowerCase().includes(lowerQuery)
        const matchesUrl = link.original_url.toLowerCase().includes(lowerQuery)
        if (!matchesTitle && !matchesUrl) return false
      }

      // Campaign filter
      if (campaignFilter && link.campaign_id !== campaignFilter) {
        return false
      }

      return true
    })
  }, [links, searchQuery, campaignFilter])

  return (
    <div className="space-y-6">
      <EntityPageHeader
        title="Link-Bibliothek"
        description="Alle Links mit UTM-Tracking und Kurzlink-Generierung."
        actionLabel="Neuer Link"
        onAction={() => setDialogOpen(true)}
      />

      <LinkFilters
        onSearchChange={handleSearchChange}
        onCampaignFilter={handleCampaignFilter}
      />

      {isLoading ? (
        <LinkTableSkeleton />
      ) : (
        <LinkTable links={filteredLinks} onDelete={handleDelete} />
      )}

      <LinkDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        channelPlatform={null}
        campaignSlug={null}
        onLinkCreated={handleLinkCreated}
      />
    </div>
  )
}
