import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const allowed = ["view", "link_click", "contact_save", "nfc_tap", "qr_scan", "menu_view", "attendance_scan", "event_checkin"];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.eventType || !allowed.includes(body.eventType)) {
      return NextResponse.json({ error: "Invalid event" }, { status: 400 });
    }
    const requestUrl = new URL(req.url);
    const userAgent = req.headers.get("user-agent") || "";
    const metadata = {
      ...(body.metadata || {}),
      referrer: req.headers.get("referer") || null,
      device: userAgent.toLowerCase().includes("mobile") ? "mobile" : "desktop",
      path: requestUrl.pathname,
    };
    const s = await createClient();
    const { error } = await s.from("engagement_events").insert({
      event_type: body.eventType,
      profile_id: body.profileId || null,
      person_id: body.personId || null,
      organization_id: body.organizationId || null,
      card_id: body.cardId || null,
      target: body.target || null,
      metadata,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    if (["view", "link_click", "contact_save"].includes(body.eventType) && body.profileId) {
      await s.from("profile_events").insert({ profile_id: body.profileId, event_type: body.eventType, target: body.target || null });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
