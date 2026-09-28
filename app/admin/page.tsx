import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Building2,
  CreditCard,
  Users,
  BarChart3,
  ShieldCheck,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import InviteUserForm from "./invite-user-form";
export default async function AdminPage() {
  const s = await createClient();
  const {
    data: { user },
  } = await s.auth.getUser();
  if (!user) redirect("/login");
  const { data: me } = await s
    .from("profiles")
    .select("role,full_name")
    .eq("id", user.id)
    .single();
  const { data: adminMembership } = await s
    .from("platform_admins")
    .select("profile_id")
    .eq("profile_id", user.id)
    .maybeSingle();
  if (!["platform_admin", "super_admin"].includes(me?.role || "") && !adminMembership) {
    return (
      <main className="min-h-screen grid place-items-center p-6">
        <div className="card max-w-md p-8 text-center">
          <ShieldCheck className="mx-auto text-coral-600" size={40} />
          <h1 className="mt-4 text-2xl font-black">Platform admin access</h1>
          <p className="mt-2 text-slate-500">
            Your account is not a Connectora platform administrator.
          </p>
          <Link href="/dashboard" className="btn-primary mt-6">
            Back to dashboard
          </Link>
        </div>
      </main>
    );
  }
  const [
    { count: users },
    { count: orgs },
    { count: cards },
    { count: events },
  ] = await Promise.all([
    s.from("profiles").select("*", { count: "exact", head: true }),
    s.from("organizations").select("*", { count: "exact", head: true }),
    s.from("nfc_cards").select("*", { count: "exact", head: true }),
    s.from("engagement_events").select("*", { count: "exact", head: true }),
  ]);
  const { data: recent } = await s
    .from("organizations")
    .select("id,name,type,created_at")
    .order("created_at", { ascending: false })
    .limit(10);
  return (
    <main className="min-h-screen py-10">
      <div className="container-page">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-coral-600">
              CONNECTORA PLATFORM
            </p>
            <h1 className="mt-1 text-3xl font-black">Admin overview</h1>
            <p className="mt-2 text-slate-500">
              Welcome, {me?.full_name || "Admin"}.
            </p>
          </div>
          <Link href="/dashboard" className="btn-secondary">
            My dashboard
          </Link>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-4">
          <Stat icon={<Users />} label="Users" value={String(users || 0)} />
          <Stat
            icon={<Building2 />}
            label="Organizations"
            value={String(orgs || 0)}
          />
          <Stat
            icon={<CreditCard />}
            label="NFC cards"
            value={String(cards || 0)}
          />
          <Stat
            icon={<BarChart3 />}
            label="Engagement events"
            value={String(events || 0)}
          />
        </div>
        <InviteUserForm />
        <div className="card mt-8 overflow-hidden">
          <div className="border-b p-6">
            <h2 className="text-xl font-bold">Recent organizations</h2>
          </div>
          <div className="divide-y">
            {recent?.length ? (
              recent.map((o) => (
                <div
                  key={o.id}
                  className="flex items-center justify-between p-5"
                >
                  <div>
                    <b>{o.name}</b>
                    <p className="text-sm text-slate-500">{o.type}</p>
                  </div>
                  <span className="text-xs text-slate-400">
                    {new Date(o.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-6 text-sm text-slate-500">
                No organizations yet.
              </div>
            )}
          </div>
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
      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  );
}
