import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  CreditCard,
  ExternalLink,
  Sparkles,
  UserRound,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function PeoplePage() {
  const s = await createClient();
  const {
    data: { user },
  } = await s.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await s
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  const { data: cards } = await s
    .from("nfc_cards")
    .select("*")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false });
  const { count: events } = await s
    .from("engagement_events")
    .select("*", { count: "exact", head: true })
    .eq("profile_id", user.id);
  return (
    <main className="min-h-screen py-10">
      <div className="container-page">
        <Link
          href="/dashboard"
          className="text-sm font-semibold text-coral-600"
        >
          ← Dashboard
        </Link>
        <div className="mt-6 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-coral-600">
              PEOPLE
            </p>
            <h1 className="mt-1 text-4xl font-black">Your digital identity</h1>
            <p className="mt-2 max-w-2xl text-slate-500">
              Build a professional identity that works across profiles, QR
              codes, NFC cards and real-world connections.
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/ai" className="btn-secondary gap-2">
              <Sparkles size={16} /> Connectora AI
            </Link>
            <Link
              target="_blank"
              href={`/u/${profile?.username}`}
              className="btn-primary gap-2"
            >
              View profile <ExternalLink size={16} />
            </Link>
          </div>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <Stat
            icon={<UserRound />}
            label="Profile"
            value={profile?.full_name ?? "Incomplete"}
          />
          <Stat
            icon={<CreditCard />}
            label="Personal cards"
            value={String(cards?.length || 0)}
          />
          <Stat
            icon={<Sparkles />}
            label="Engagement events"
            value={String(events || 0)}
          />
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Digital Profile</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Your public Connectora identity.
                </p>
              </div>
              <Link href="/dashboard/profile" className="btn-secondary">
                Edit
              </Link>
            </div>
            <div className="mt-5 rounded-2xl bg-slate-950 p-6 text-white">
              <p className="text-2xl font-black">
                {profile?.full_name ?? "Your name"}
              </p>
              <p className="mt-1 text-white/70">
                {profile?.title ?? "Add your title"}
                {profile?.company ? ` · ${profile.company}` : ""}
              </p>
              <p className="mt-5 text-sm leading-6 text-white/70">
                {profile?.bio ?? "Add a bio so people know what you do."}
              </p>
            </div>
          </section>
          <section className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Personal Cards</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Connect physical cards to your identity.
                </p>
              </div>
              <Link href="/experiences/cards" className="btn-secondary">
                Manage
              </Link>
            </div>
            <div className="mt-5 space-y-3">
              {cards?.length ? (
                cards.slice(0, 4).map((c: any) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between rounded-xl border p-4"
                  >
                    <div>
                      <b>{c.label || c.card_uid}</b>
                      <p className="text-xs text-slate-500">{c.card_uid}</p>
                    </div>
                    <Link
                      href={`/c/${c.card_uid}`}
                      target="_blank"
                      className="text-sm font-bold text-coral-600"
                    >
                      Open →
                    </Link>
                  </div>
                ))
              ) : (
                <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                  No personal cards yet.
                </p>
              )}
            </div>
          </section>
        </div>
        <div className="mt-8 card p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-coral-50 p-3 text-coral-700">
              <Sparkles />
            </div>
            <div>
              <h2 className="font-bold">AI Profile Assistant</h2>
              <p className="text-sm text-slate-500">
                Create better profile copy and understand how people interact
                with your identity.
              </p>
            </div>
          </div>
          <Link
            href="/ai"
            className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-coral-600"
          >
            Open Connectora AI <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </main>
  );
}
function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="card p-5">
      <div className="text-coral-600">{icon}</div>
      <p className="mt-4 text-sm text-slate-500">{label}</p>
      <p className="mt-1 truncate text-xl font-black">{value}</p>
    </div>
  );
}
