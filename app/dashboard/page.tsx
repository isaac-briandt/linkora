import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Building2,
  ExternalLink,
  CreditCard,
  BarChart3,
  Plus,
  Users,
  CalendarCheck,
  Sparkles,
  ArrowRight,
  QrCode,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import BrandMark from "@/components/brand-mark";
import LogoutButton from "./logout-button";
export default async function Dashboard() {
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
  const [{ count: events }, { data: members }, { data: cards }] =
    await Promise.all([
      s
        .from("engagement_events")
        .select("*", { count: "exact", head: true })
        .eq("profile_id", user.id),
      s
        .from("organization_members")
        .select("organization_id,role,organizations(id,name,slug,type)")
        .eq("profile_id", user.id),
      s.from("nfc_cards").select("*").eq("profile_id", user.id),
    ]);
  return (
    <main className="min-h-screen">
      <nav className="border-b bg-white">
        <div className="container-page flex min-h-16 flex-wrap items-center justify-between gap-3 py-3">
          <Link href="/" className="inline-flex items-center gap-2">
            <BrandMark />
            <span className="text-xl font-black tracking-tight">
              Connectora
            </span>
          </Link>
          <div className="flex flex-wrap gap-2">
            <Link href="/ai" className="btn-secondary gap-2">
              <Sparkles size={16} /> AI
            </Link>
            <Link href="/people" className="btn-secondary gap-2">
              <Users size={16} /> People
            </Link>
            <Link href="/organizations" className="btn-secondary gap-2">
              <Building2 size={16} /> Organizations
            </Link>
            <Link href="/experiences" className="btn-secondary gap-2">
              <QrCode size={16} /> Experiences
            </Link>
            <LogoutButton />
          </div>
        </div>
      </nav>
      <div className="container-page py-10">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-coral-600">
              CONNECTORA COMMAND CENTER
            </p>
            <h1 className="mt-1 text-4xl font-black">
              Hello, {profile?.full_name || "there"}
            </h1>
            <p className="mt-2 max-w-2xl text-slate-500">
              One platform connecting people, organizations and physical-world
              experiences — with AI across the entire system.
            </p>
          </div>
          {profile && (
            <Link
              target="_blank"
              href={`/u/${profile.username}`}
              className="btn-primary gap-2"
            >
              View profile <ExternalLink size={16} />
            </Link>
          )}
        </div>
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          <Pillar
            href="/people"
            label="PEOPLE"
            title="Digital identity"
            text="Profiles, QR, contact sharing and personal cards."
            icon={<Users />}
          />
          <Pillar
            href="/organizations"
            label="ORGANIZATIONS"
            title="Manage people & operations"
            text="Companies, schools, restaurants, hotels and events."
            icon={<Building2 />}
          />
          <Pillar
            href="/experiences"
            label="EXPERIENCES"
            title="Connect physical & digital"
            text="NFC, QR, attendance, menus, check-ins and analytics."
            icon={<QrCode />}
          />
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-4">
          <Stat
            icon={<Users />}
            label="Organizations"
            value={String(members?.length || 0)}
          />
          <Stat
            icon={<CreditCard />}
            label="Personal cards"
            value={String(cards?.length || 0)}
          />
          <Stat
            icon={<BarChart3 />}
            label="Your events"
            value={String(events || 0)}
          />
          <Stat icon={<Sparkles />} label="AI layer" value="Active" />
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Your organizations</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Open a workspace or create a new one.
                </p>
              </div>
              <Link href="/organizations/new" className="btn-secondary gap-2">
                <Plus size={15} /> Create
              </Link>
            </div>
            <div className="mt-5 space-y-3">
              {members?.length ? (
                members.map((m: any) => (
                  <Link
                    key={m.organization_id}
                    href={`/organization/${m.organization_id}`}
                    className="flex items-center justify-between rounded-xl border p-4 hover:bg-slate-50"
                  >
                    <span>
                      <b>{m.organizations?.name}</b>
                      <span className="ml-2 text-xs text-slate-500">
                        {m.organizations?.type} · {m.role}
                      </span>
                    </span>
                    <ArrowRight size={16} className="text-coral-600" />
                  </Link>
                ))
              ) : (
                <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                  No organizations yet.
                </p>
              )}
            </div>
          </section>
          <section className="card bg-slate-950 p-6 text-white">
            <div className="flex items-center gap-2">
              <Sparkles className="text-coral-300" size={18} />
              <h2 className="text-xl font-black">Connectora AI</h2>
            </div>
            <p className="mt-3 text-sm leading-7 text-white/70">
              Build profile content, create marketing copy, interpret engagement
              and ask organization-level questions.
            </p>
            <Link
              href="/ai"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-950"
            >
              Open AI workspace <ArrowRight size={15} />
            </Link>
          </section>
        </div>
      </div>
    </main>
  );
}
function Pillar({
  href,
  label,
  title,
  text,
  icon,
}: {
  href: string;
  label: string;
  title: string;
  text: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="card group p-7 transition hover:-translate-y-1"
    >
      <div className="flex items-center justify-between">
        <div className="rounded-2xl bg-coral-50 p-3 text-coral-700">{icon}</div>
        <ArrowRight
          size={18}
          className="text-slate-300 group-hover:text-coral-600"
        />
      </div>
      <p className="mt-6 text-xs font-black tracking-wider text-coral-600">
        {label}
      </p>
      <h2 className="mt-1 text-2xl font-black">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
    </Link>
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
      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  );
}
