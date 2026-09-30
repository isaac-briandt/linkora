import { createClient } from "@/lib/supabase/server";
import ProfileClient from "./profile-client";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

function cleanDescription(value: string | null | undefined) {
  const description = value?.replace(/\s+/g, " ").trim();
  if (!description) return "View this digital profile on Connectora.";
  return description.length > 160
    ? `${description.slice(0, 157).trimEnd()}...`
    : description;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("username,full_name,title,company,bio,avatar_url")
    .eq("username", username)
    .single();

  if (!profile) {
    return { robots: { index: false, follow: false } };
  }

  const name = profile.full_name?.trim() || profile.username;
  const role = [profile.title, profile.company].filter(Boolean).join(" at ");
  const title = role ? `${name} — ${role}` : `${name} | Digital Profile`;
  const canonical = `/u/${encodeURIComponent(profile.username)}`;
  const images = profile.avatar_url
    ? [{ url: profile.avatar_url, alt: name }]
    : undefined;

  return {
    title,
    description: cleanDescription(profile.bio),
    alternates: { canonical },
    openGraph: {
      type: "profile",
      title,
      description: cleanDescription(profile.bio),
      url: canonical,
      images,
    },
    twitter: {
      card: "summary",
      title,
      description: cleanDescription(profile.bio),
      images,
    },
  };
}

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
