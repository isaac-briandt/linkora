import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PersonProfileForm from "./person-profile-form";

export default async function OrganizationPersonPage({
  params,
}: {
  params: Promise<{ id: string; personId: string }>;
}) {
  const { id, personId } = await params;
  const s = await createClient();
  const {
    data: { user },
  } = await s.auth.getUser();
  if (!user) redirect("/login");
  const { data: member } = await s
    .from("organization_members")
    .select("id")
    .eq("organization_id", id)
    .eq("profile_id", user.id)
    .single();
  if (!member) redirect("/dashboard");
  const [{ data: person }, { data: cards }] = await Promise.all([
    s
      .from("people")
      .select("*")
      .eq("id", personId)
      .eq("organization_id", id)
      .single(),
    s
      .from("nfc_cards")
      .select("id,card_uid,label,status,person_id")
      .eq("organization_id", id)
      .order("created_at", { ascending: false }),
  ]);
  if (!person) notFound();
  return (
    <PersonProfileForm
      person={person}
      organizationId={id}
      initialCards={cards || []}
    />
  );
}
