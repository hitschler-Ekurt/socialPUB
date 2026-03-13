import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getLateClient } from "@/lib/late-dev/client"
import { connectChannelSchema } from "@/lib/validations/channel"

export async function GET(request: Request) {
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

    // Verify admin role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profile?.role !== "admin") {
      return NextResponse.json(
        { error: "Nur Admins koennen Kanaele verbinden" },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const platform = searchParams.get("platform")

    const parsed = connectChannelSchema.safeParse({ platform })
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Ungueltige Plattform", details: parsed.error.issues },
        { status: 400 }
      )
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
    const redirectUrl = `${appUrl}/api/channels/callback`

    const result = await getLateClient().connect.getConnectUrl({
      path: { platform: parsed.data.platform },
      query: {
        profileId: "default",
        redirect_url: redirectUrl,
        headless: true,
      },
    })

    if (!result.data?.authUrl) {
      return NextResponse.json(
        { error: "Keine Auth-URL von Late.dev erhalten" },
        { status: 502 }
      )
    }

    return NextResponse.json({ authUrl: result.data.authUrl })
  } catch {
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    )
  }
}
