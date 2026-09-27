import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import ProfileClient from "@/app/u/[username]/profile-client";
import Link from "next/link";

function safeExternalUrl(value: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

export default async function CardRoute({
  params,
}: {
  params: Promise<{ cardUid: string }>;
}) {
  const { cardUid } = await params;
  const s = await createClient();
  const { data: card } = await s
    .from("nfc_cards")
    .select("*")
    .eq("card_uid", cardUid)
    .eq("status", "active")
    .single();
  if (!card) notFound();
  let eventProfileId = card.profile_id;
  if (!eventProfileId && card.person_id) {
    const { data: person } = await s
      .from("people")
      .select("profile_id")
      .eq("id", card.person_id)
      .single();
    eventProfileId = person?.profile_id || null;
  }
  await s
    .from("engagement_events")
    .insert({
      event_type: "nfc_tap",
      card_id: card.id,
      person_id: card.person_id,
      profile_id: eventProfileId,
      organization_id: card.organization_id,
      metadata: { card_uid: cardUid },
    });
  const destination = safeExternalUrl(card.destination_url);
  if (destination) redirect(destination);
  if (card.person_id) {
    const { data: person } = await s
      .from("people")
      .select("*,profiles(*)")
      .eq("id", card.person_id)
      .single();
    if (person?.profiles)
      return (
        <ProfileClient
          profile={person.profiles}
          analyticsProfileId={person.profile_id}
          analyticsPersonId={person.id}
          analyticsOrganizationId={person.organization_id}
        />
      );
    if (person) {
      return (
        <ProfileClient
          analyticsProfileId={null}
          analyticsPersonId={person.id}
          analyticsOrganizationId={person.organization_id}
          profile={{
            id: person.id,
            username: person.username || `person-${person.id}`,
            full_name: person.full_name,
            title: person.title || "",
            company: person.company || "",
            bio: person.bio || "",
            avatar_url: person.avatar_url || "",
            cover_image_url: person.cover_image_url || "",
            phone: person.phone || "",
            email: person.email || "",
            website: person.website || "",
            linkedin: person.linkedin || "",
            instagram: person.instagram || "",
            facebook: person.facebook || "",
            x_url: person.x_url || "",
            tiktok: person.tiktok || "",
            github: person.github || "",
            whatsapp: person.whatsapp || "",
          }}
        />
      );
    }
  }
  if (card.destination_type === "profile" && card.profile_id) {
    const { data: profile } = await s
      .from("profiles")
      .select("*")
      .eq("id", card.profile_id)
      .single();
    if (profile) return <ProfileClient profile={profile} />;
  }
  return (
    <main className="min-h-screen grid place-items-center p-6">
      <div className="card max-w-md p-8 text-center">
        <h1 className="text-2xl font-black">Connectora card</h1>
        <p className="mt-2 text-slate-500">
          This card is active but its destination has not been configured yet.
        </p>
        <Link href="/" className="btn-primary mt-6">
          Learn about Connectora
        </Link>
      </div>
    </main>
  );
}
