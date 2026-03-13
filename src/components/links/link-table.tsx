"use client"

import { useState, useCallback } from "react"
import { formatDistanceToNow } from "date-fns"
import { de } from "date-fns/locale"
import { BarChart2, Copy, Check, Trash2, ChevronDown, ChevronRight, Link2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/shared/empty-state"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import type { Database } from "@/lib/supabase/types"

type Link = Database["public"]["Tables"]["links"]["Row"] & {
  campaigns: {
    id: string
    name: string
    color: string
    slug: string
  } | null
}

type LinkTableProps = {
  readonly links: readonly Link[]
  readonly onDelete: (id: string) => void
}

type ExpandedRows = Record<string, boolean>

function truncateUrl(url: string, maxLength: number = 45): string {
  if (url.length <= maxLength) return url
  return url.slice(0, maxLength) + "..."
}

function LinkRow({
  link,
  expanded,
  onToggle,
  onDelete,
}: {
  readonly link: Link
  readonly expanded: boolean
  readonly onToggle: () => void
  readonly onDelete: (id: string) => void
}) {
  const [copied, setCopied] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const handleCopy = useCallback(async () => {
    const urlToCopy = link.short_url ?? link.full_url ?? link.original_url
    try {
      await navigator.clipboard.writeText(urlToCopy)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard API not available
    }
  }, [link.short_url, link.full_url, link.original_url])

  const createdAtText = formatDistanceToNow(new Date(link.created_at), {
    addSuffix: true,
    locale: de,
  })

  return (
    <>
      <tr
        className="group cursor-pointer border-b transition-colors hover:bg-muted/50"
        onClick={onToggle}
      >
        {/* Expand indicator */}
        <td className="w-8 px-2 py-3">
          {expanded ? (
            <ChevronDown className="size-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="size-4 text-muted-foreground" />
          )}
        </td>

        {/* Title / URL */}
        <td className="max-w-[300px] px-3 py-3">
          <div className="flex flex-col gap-0.5">
            <span className="truncate text-sm font-medium text-foreground">
              {link.title || truncateUrl(link.original_url)}
            </span>
            {link.short_url && (
              <Badge variant="secondary" className="w-fit text-xs font-mono">
                {link.short_url}
              </Badge>
            )}
          </div>
        </td>

        {/* Campaign */}
        <td className="px-3 py-3">
          {link.campaigns ? (
            <span className="inline-flex items-center gap-1.5 text-sm">
              <span
                className="inline-block size-2.5 rounded-full"
                style={{ backgroundColor: link.campaigns.color }}
              />
              {link.campaigns.name}
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">-</span>
          )}
        </td>

        {/* Clicks */}
        <td className="px-3 py-3">
          <span className="inline-flex items-center gap-1.5 text-sm">
            <BarChart2 className="size-3.5 text-muted-foreground" />
            {link.click_count}
          </span>
        </td>

        {/* Created */}
        <td className="px-3 py-3">
          <span className="text-sm text-muted-foreground">{createdAtText}</span>
        </td>

        {/* Actions */}
        <td className="px-3 py-3">
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="sm"
              className="size-8 p-0"
              onClick={handleCopy}
              title="Link kopieren"
            >
              {copied ? (
                <Check className="size-3.5 text-green-600" />
              ) : (
                <Copy className="size-3.5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="size-8 p-0 text-destructive hover:text-destructive"
              onClick={() => setConfirmOpen(true)}
              title="Link loeschen"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>

          <ConfirmDialog
            open={confirmOpen}
            onOpenChange={setConfirmOpen}
            title="Link loeschen?"
            description="Dieser Link wird unwiderruflich geloescht. Alle zugehoerigen Tracking-Daten gehen verloren."
            confirmLabel="Loeschen"
            onConfirm={() => onDelete(link.id)}
          />
        </td>
      </tr>

      {/* Expanded detail row */}
      {expanded && (
        <tr className="border-b bg-muted/30">
          <td colSpan={6} className="px-5 py-3">
            <div className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
              {link.full_url && (
                <div>
                  <span className="text-xs font-medium text-muted-foreground">Volle URL</span>
                  <p className="mt-0.5 break-all font-mono text-xs">{link.full_url}</p>
                </div>
              )}
              <div>
                <span className="text-xs font-medium text-muted-foreground">Original URL</span>
                <p className="mt-0.5 break-all font-mono text-xs">{link.original_url}</p>
              </div>
              {link.utm_source && (
                <div>
                  <span className="text-xs font-medium text-muted-foreground">UTM Source</span>
                  <p className="mt-0.5">{link.utm_source}</p>
                </div>
              )}
              {link.utm_medium && (
                <div>
                  <span className="text-xs font-medium text-muted-foreground">UTM Medium</span>
                  <p className="mt-0.5">{link.utm_medium}</p>
                </div>
              )}
              {link.utm_campaign && (
                <div>
                  <span className="text-xs font-medium text-muted-foreground">UTM Campaign</span>
                  <p className="mt-0.5">{link.utm_campaign}</p>
                </div>
              )}
              {link.utm_content && (
                <div>
                  <span className="text-xs font-medium text-muted-foreground">UTM Content</span>
                  <p className="mt-0.5">{link.utm_content}</p>
                </div>
              )}
              {link.utm_term && (
                <div>
                  <span className="text-xs font-medium text-muted-foreground">UTM Term</span>
                  <p className="mt-0.5">{link.utm_term}</p>
                </div>
              )}
              <div>
                <span className="text-xs font-medium text-muted-foreground">Status</span>
                <p className="mt-0.5">{link.is_active ? "Aktiv" : "Inaktiv"}</p>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

export function LinkTable({ links, onDelete }: LinkTableProps) {
  const [expandedRows, setExpandedRows] = useState<ExpandedRows>({})

  const toggleRow = useCallback((id: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }, [])

  if (links.length === 0) {
    return (
      <EmptyState
        icon={Link2}
        title="Noch keine Links erstellt"
        description="Erstelle deinen ersten Link mit UTM-Tracking und Kurzlink-Generierung."
      />
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-left">
        <thead className="border-b bg-muted/50">
          <tr>
            <th className="w-8 px-2 py-3" />
            <th className="px-3 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Titel / URL
            </th>
            <th className="px-3 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Kampagne
            </th>
            <th className="px-3 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Klicks
            </th>
            <th className="px-3 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Erstellt
            </th>
            <th className="px-3 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Aktionen
            </th>
          </tr>
        </thead>
        <tbody>
          {links.map((link) => (
            <LinkRow
              key={link.id}
              link={link}
              expanded={!!expandedRows[link.id]}
              onToggle={() => toggleRow(link.id)}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}
