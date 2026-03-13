import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getLateClient } from "@/lib/late-dev/client"

export type ChannelHealthStatus = "connected" | "expiring" | "disconnected"

type ChannelHealthItem = {
  channelId: string
  accountId: string | null
  status: ChannelHealthStatus
  expiresAt: string | null
}

function mapHealthStatus(
  lateStatus?: "healthy" | "warning" | "error",
  tokenExpiresAt?: string | null
): ChannelHealthStatus {
  if (lateStatus === "error") return "disconnected"
  if (lateStatus === "warning") return "expiring"

  // Additional check: if token expires within 7 days
  if (tokenExpiresAt) {
    const expiresAt = new Date(tokenExpiresAt)
    const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    if (expiresAt < new Date()) return "disconnected"
    if (expiresAt < sevenDaysFromNow) return "expiring"
  }

  return "connected"
}

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: "Nicht authentifiziert" },
        { status: 401 }
      )
    }

    // Get all active channels from DB
    const { data: channels, error: channelsError } = await supabase
      .from("channels")
      .select("id, account_id, token_expires_at")
      .eq("is_active", true)

    if (channelsError) {
      return NextResponse.json(
        { error: channelsError.message },
        { status: 500 }
      )
    }

    if (!channels || channels.length === 0) {
      return NextResponse.json({ data: [] })
    }

    // Fetch health from Late.dev
    let lateHealthMap: Map<string, { status: "healthy" | "warning" | "error"; tokenExpiresAt?: string }> = new Map()

    try {
      const healthResult = await getLateClient().accounts.getAllAccountsHealth()
      const accounts = healthResult.data?.accounts ?? []

      for (const account of accounts) {
        if (account.accountId) {
          lateHealthMap.set(account.accountId, {
            status: account.status ?? "error",
            tokenExpiresAt: account.tokenExpiresAt ?? undefined,
          })
        }
      }
    } catch {
      // If Late.dev is unreachable, fall back to local token_expires_at data
    }

    const healthData: ChannelHealthItem[] = channels.map((channel) => {
      const lateHealth = channel.account_id
        ? lateHealthMap.get(channel.account_id)
        : undefined

      return {
        channelId: channel.id,
        accountId: channel.account_id,
        status: mapHealthStatus(
          lateHealth?.status,
          lateHealth?.tokenExpiresAt ?? channel.token_expires_at
        ),
        expiresAt: lateHealth?.tokenExpiresAt ?? channel.token_expires_at,
      }
    })

    return NextResponse.json({ data: healthData })
  } catch {
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    )
  }
}
