import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import ProfileClient from "@/app/u/[username]/profile-client";
import Link from "next/link";

function safeExternalUrl(value: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch { return null; }
}

export default async function CardRoute({ params }: { params: Promise<{ cardUid: string }> }) {
  const { cardUid } = await params;
  const s = await createClient();
  const { data: card } = await s.from("nfc_cards").select("*").eq("card_uid", cardUid).eq("status", "active").single();
  if (!card) notFound();
  await s.from("engagement_events").insert({ event_type: "nfc_tap", card_id: card.id, profile_id: card.profile_id, organization_id: card.organization_id, metadata: { card_uid: cardUid } });
  const destination = safeExternalUrl(card.destination_url);
  if (destination) redirect(destination);
  if (card.destination_type === "profile" && card.profile_id) {
    const { data: profile } = await s.from("profiles").select("*").eq("id", card.profile_id).single();
    if (profile) return <ProfileClient profile={profile} />;
  }
  return <main className="min-h-screen grid place-items-center p-6"><div className="card max-w-md p-8 text-center"><h1 className="text-2xl font-black">Linkora card</h1><p className="mt-2 text-slate-500">This card is active but its destination has not been configured yet.</p><Link href="/" className="btn-primary mt-6">Learn about Linkora</Link></div></main>;
}
