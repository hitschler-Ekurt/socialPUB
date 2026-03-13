import { createClient } from "@supabase/supabase-js";
import { geolocation, ipAddress } from "@vercel/functions";
import { createHash } from "crypto";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function parseDeviceType(ua: string | null): string {
  if (!ua) return "unknown";
  if (/tablet|ipad/i.test(ua)) return "tablet";
  if (/mobile|android|iphone/i.test(ua)) return "mobile";
  return "desktop";
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  // Validate short code format (alphanumeric, reasonable length)
  if (!code || code.length > 32 || !/^[a-zA-Z0-9_-]+$/.test(code)) {
    return new Response("Not Found", { status: 404 });
  }

  // Look up short code
  const { data: link, error } = await supabase
    .from("links")
    .select("id, full_url, original_url, expires_at, is_active")
    .eq("short_code", code)
    .single();

  if (error || !link || !link.is_active) {
    return new Response("Not Found", { status: 404 });
  }

  if (link.expires_at && new Date(link.expires_at) < new Date()) {
    return new Response("Link Expired", { status: 410 });
  }

  // Determine redirect URL (full_url has UTM params, fallback to original_url)
  const redirectUrl = link.full_url || link.original_url;

  if (!redirectUrl) {
    return new Response("Not Found", { status: 404 });
  }

  // Track click (fire and forget -- do NOT await)
  const geo = geolocation(request);
  const ip = ipAddress(request);
  const ipHash = ip
    ? createHash("sha256").update(ip).digest("hex").slice(0, 16)
    : null;
  const ua = request.headers.get("user-agent");
  const referrer = request.headers.get("referer");

  supabase.from("link_clicks").insert({
    link_id: link.id,
    country: geo?.country ?? null,
    city: geo?.city ?? null,
    ip_hash: ipHash,
    user_agent: ua,
    referrer: referrer,
    device_type: parseDeviceType(ua),
  });
  // Note: DB trigger increment_link_clicks auto-increments links.click_count

  return Response.redirect(redirectUrl, 302);
}
