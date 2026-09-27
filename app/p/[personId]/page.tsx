import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ProfileClient from "@/app/u/[username]/profile-client";

export default async function OrganizationPersonProfile({
  params,
}: {
  params: Promise<{ personId: string }>;
}) {
  const { personId } = await params;
  const s = await createClient();
  const { data: person } = await s
    .from("people")
    .select("*,profiles(*)")
    .or(`username.eq.${personId},id.eq.${personId}`)
    .single();
  if (!person) notFound();
  if (person.profiles)
    return (
      <ProfileClient
        profile={person.profiles}
        analyticsProfileId={person.profile_id}
        analyticsPersonId={person.id}
        analyticsOrganizationId={person.organization_id}
      />
    );
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
