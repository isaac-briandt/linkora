import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
export async function POST(req: Request) {
  try {
    const s = await createClient();
    const {
      data: { user },
    } = await s.auth.getUser();
    if (!user)
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 },
      );
    const b = await req.json();
    const organizationId = String(b.organizationId || "");
    const personId = String(b.personId || "");
    const type = String(b.type || "");
    if (
      !organizationId ||
      !personId ||
      !["check_in", "check_out"].includes(type)
    )
      return NextResponse.json(
        {
          error: "Organization, person and valid attendance type are required.",
        },
        { status: 400 },
      );
    const { data: member } = await s
      .from("organization_members")
      .select("role")
      .eq("organization_id", organizationId)
      .eq("profile_id", user.id)
      .maybeSingle();
    if (!member)
      return NextResponse.json(
        { error: "You do not have access to this organization." },
        { status: 403 },
      );
    const { data: person } = await s
      .from("people")
      .select("id,full_name")
      .eq("id", personId)
      .eq("organization_id", organizationId)
      .single();
    if (!person)
      return NextResponse.json(
        { error: "Person not found in this organization." },
        { status: 404 },
      );
    const { data: record, error } = await s
      .from("attendance_records")
      .insert({
        organization_id: organizationId,
        person_id: personId,
        type,
        metadata: { source: "connectora_checkin_station", recorded_by: user.id },
      })
      .select("id,scanned_at,type")
      .single();
    if (error) throw error;
    await s
      .from("engagement_events")
      .insert({
        event_type:
          type === "check_in" ? "attendance_check_in" : "attendance_check_out",
        organization_id: organizationId,
        metadata: { person_id: personId, source: "connectora_checkin_station" },
      });
    return NextResponse.json({ record, person });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Attendance request failed." },
      { status: 500 },
    );
  }
}
