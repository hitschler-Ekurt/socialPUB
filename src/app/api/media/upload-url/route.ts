import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

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
    const { fileName, contentType } = body

    if (!fileName || !contentType) {
      return NextResponse.json(
        { error: "fileName und contentType sind erforderlich" },
        { status: 400 }
      )
    }

    const filePath = `uploads/${crypto.randomUUID()}/${fileName}`

    const { data, error } = await supabase.storage
      .from("media")
      .createSignedUploadUrl(filePath)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      uploadUrl: data.signedUrl,
      filePath,
      token: data.token,
    })
  } catch {
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    )
  }
}
