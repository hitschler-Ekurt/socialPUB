import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { createAdminClient } from "@/lib/supabase/admin"
import { BioPage } from "@/components/bio-public/bio-page"
import type { Database } from "@/lib/supabase/types"

type BioItem = Database["public"]["Tables"]["linkinbio_items"]["Row"] & {
  links: Database["public"]["Tables"]["links"]["Row"] | null
}

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = createAdminClient()

  const { data: page } = await supabase
    .from("linkinbio_pages")
    .select("title, description")
    .eq("slug", slug)
    .eq("is_active", true)
    .single()

  if (!page) {
    return { title: "Seite nicht gefunden" }
  }

  return {
    title: page.title,
    description: page.description ?? `${page.title} - Links`,
  }
}

export default async function PublicBioPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = createAdminClient()

  // Fetch bio page by slug
  const { data: page, error: pageError } = await supabase
    .from("linkinbio_pages")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single()

  if (pageError || !page) {
    notFound()
  }

  // Fetch visible, non-expired items with link data
  const now = new Date().toISOString()
  const { data: rawItems } = await supabase
    .from("linkinbio_items")
    .select("*, links(*)")
    .eq("page_id", page.id)
    .eq("is_visible", true)
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .order("position", { ascending: true })

  const items: BioItem[] = (rawItems ?? []) as unknown as BioItem[]

  return <BioPage page={page} items={items} />
}
