"use client"

import { BioLinkButton } from "./bio-link-button"
import type { Database } from "@/lib/supabase/types"

type BioPageData = Database["public"]["Tables"]["linkinbio_pages"]["Row"]
type BioItem = Database["public"]["Tables"]["linkinbio_items"]["Row"] & {
  links: Database["public"]["Tables"]["links"]["Row"] | null
}

type BioPageProps = {
  readonly page: BioPageData
  readonly items: readonly BioItem[]
}

export function BioPage({ page, items }: BioPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-neutral-50">
      <div className="mx-auto max-w-md px-6 py-12 space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          {page.logo_url ? (
            <img
              src={page.logo_url}
              alt={page.title}
              className="h-20 w-20 rounded-full object-cover shadow-sm"
            />
          ) : (
            <div className="h-20 w-20 rounded-full bg-[#E6007E] flex items-center justify-center text-white font-bold text-2xl shadow-sm">
              {page.title.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Title & description */}
        <div className="text-center space-y-2">
          <h1 className="text-xl font-bold text-neutral-800">
            {page.title}
          </h1>
          {page.description && (
            <p className="text-sm text-neutral-500">{page.description}</p>
          )}
        </div>

        {/* Link buttons */}
        <div className="space-y-3">
          {items.map((item) => (
            <BioLinkButton key={item.id} item={item} />
          ))}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-neutral-400 pt-8">
          Powered by hitschies Publisher
        </p>
      </div>
    </div>
  )
}
