import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const sessionClient = await createClient();
  const {
    data: { user },
  } = await sessionClient.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Sign in to invite a user." },
      { status: 401 },
    );
  }

  const { data: profile } = await sessionClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const { data: adminMembership } = await sessionClient
    .from("platform_admins")
    .select("profile_id")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (
    (!profile || !["platform_admin", "super_admin"].includes(profile.role)) &&
    !adminMembership
  ) {
    return NextResponse.json(
      { error: "Platform administrator access is required." },
      { status: 403 },
    );
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!serviceRoleKey || !supabaseUrl) {
    return NextResponse.json(
      { error: "User invitations are not configured on the server." },
      { status: 503 },
    );
  }

  let email: string;
  try {
    const body: unknown = await request.json();
    email =
      typeof body === "object" &&
      body !== null &&
      "email" in body &&
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";
  } catch {
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 },
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 },
    );
  }

  const adminClient = createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
  const redirectTo = new URL("/auth/set-password", appUrl).toString();
  const { error } = await adminClient.auth.admin.inviteUserByEmail(email, {
    redirectTo,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    message: `Invitation sent to ${email}. They’ll choose a password after accepting it.`,
  });
}
