import Link from "next/link";
import { ArrowLeft, CalendarDays, Sparkles } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
export default async function EventsPage() {
  const s = await createClient();
  const {
    data: { user },
  } = await s.auth.getUser();
  if (!user) redirect("/login");
  const { data: members } = await s
    .from("organization_members")
    .select("organization_id,organizations(name,type)")
    .eq("profile_id", user.id);
  return (
    <main className="min-h-screen py-10">
      <div className="container-page">
        <Link
          href="/experiences"
          className="inline-flex items-center gap-2 text-sm font-semibold text-coral-600"
        >
          <ArrowLeft size={15} /> Experiences
        </Link>
        <div className="mt-5 flex items-center gap-3">
          <div className="rounded-xl bg-coral-50 p-3 text-coral-700">
            <CalendarDays />
          </div>
          <div>
            <p className="text-sm font-bold text-coral-600">
              EXPERIENCE · EVENTS
            </p>
            <h1 className="text-3xl font-black">Events & check-ins</h1>
          </div>
        </div>
        <p className="mt-2 max-w-2xl text-slate-500">
          Use organizations of type event to represent conferences, workshops,
          launches and gatherings. The same people, cards, QR and analytics
          infrastructure powers attendance.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {members?.map((m: any) => (
            <Link
              key={m.organization_id}
              href={`/organization/${m.organization_id}`}
              className="card p-5"
            >
              <b>{m.organizations?.name}</b>
              <p className="mt-1 text-xs uppercase text-coral-600">
                {m.organizations?.type}
              </p>
            </Link>
          ))}
        </div>
        <div className="mt-8 rounded-2xl bg-coral-50 p-6">
          <div className="flex items-center gap-2 font-bold text-coral-800">
            <Sparkles size={17} /> AI event assistant
          </div>
          <p className="mt-2 text-sm leading-6 text-coral-900/70">
            Use Connectora AI to generate event copy, attendee instructions and
            engagement insights.
          </p>
          <Link
            href="/ai"
            className="mt-4 inline-flex text-sm font-bold text-coral-700"
          >
            Open AI →
          </Link>
        </div>
      </div>
    </main>
  );
}
