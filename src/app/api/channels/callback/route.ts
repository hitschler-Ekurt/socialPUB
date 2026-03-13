import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getLateClient } from "@/lib/late-dev/client"
import { callbackSchema } from "@/lib/validations/channel"

export async function POST(request: Request) {
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

    const body = await request.json()
    const parsed = callbackSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Ungueltige Callback-Daten", details: parsed.error.issues },
        { status: 400 }
      )
    }

    const { code, state, platform, profileId } = parsed.data

    // Exchange the OAuth code via Late.dev SDK
    const callbackResult = await getLateClient().connect.handleOAuthCallback({
      path: { platform },
      body: {
        code,
        state: state ?? "",
        profileId,
      },
    })

    // Get account details from the pending OAuth data
    const pendingData = await getLateClient().connect.getPendingOAuthData({
      query: { profileId, platform },
    })

    const accountData = pendingData.data
    const accountId = (callbackResult.data as Record<string, unknown>)?.accountId as string | undefined

    // Store the channel in Supabase
    const { data: channel, error: insertError } = await supabase
      .from("channels")
      .insert({
        platform,
        name: (accountData as Record<string, unknown>)?.username as string ?? platform,
        account_id: accountId ?? null,
        avatar_url: (accountData as Record<string, unknown>)?.avatarUrl as string ?? null,
        is_active: true,
        metadata: {
          lateProfileId: profileId,
          connectedAt: new Date().toISOString(),
        },
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: channel }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    )
  }
}
