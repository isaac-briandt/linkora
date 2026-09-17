import { createClient } from "@/lib/supabase/server";
import ProfileClient from "./profile-client";
import { notFound } from "next/navigation";

export default async function PublicProfile({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();
  if (!profile) notFound();
  return <ProfileClient profile={profile} />;
}
