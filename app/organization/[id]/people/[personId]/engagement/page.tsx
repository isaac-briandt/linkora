import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BarChart3, CheckCircle2, Eye, MousePointerClick, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import ShareButton from "./share-button";
import PersonShareLinks from "./person-share-links";

const labels: Record<string, string> = {
  view: "Profile views",
  link_click: "Link clicks",
  contact_save: "Contact saves",
  nfc_tap: "NFC taps",
  qr_scan: "QR scans",
  event_checkin: "Event check-ins",
  attendance_scan: "Attendance scans",
  menu_view: "Menu views",
};

export default async function PersonEngagementPage({ params }: { params: Promise<{ id: string; personId: string }> }) {
  const { id, personId } = await params;
  const s = await createClient();
  const { data: { user } } = await s.auth.getUser();
  if (!user) redirect("/login");
  const { data: member } = await s.from("organization_members").select("id").eq("organization_id", id).eq("profile_id", user.id).single();
  if (!member) redirect("/dashboard");
  const [{ data: person }, { data: engagement }, { data: cards }] = await Promise.all([
    s.from("people").select("id,full_name,email,title,username,engagement_share_token").eq("id", personId).eq("organization_id", id).single(),
    s.from("engagement_events").select("event_type,target,created_at,metadata,card_id").eq("person_id", personId).eq("organization_id", id).order("created_at", { ascending: false }).limit(500),
    s.from("nfc_cards").select("id,card_uid,label,status").eq("person_id", personId).eq("organization_id", id).eq("status", "active").order("created_at", { ascending: false }),
  ]);
  if (!person) notFound();
  const events = engagement || [];
  const count = (type: string) => events.filter((event) => event.event_type === type).length;
  const breakdown = Object.entries(events.reduce((result, event) => { result[event.event_type] = (result[event.event_type] || 0) + 1; return result; }, {} as Record<string, number>)).sort((a, b) => b[1] - a[1]);
  return <main className="min-h-screen py-10"><div className="container-page"><Link href={`/organization/${id}/people`} className="inline-flex items-center gap-2 text-sm font-semibold text-coral-600"><ArrowLeft size={15} /> People</Link><div className="mt-5 flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="text-sm font-bold uppercase tracking-wider text-coral-600">PERSON ENGAGEMENT</p><h1 className="mt-1 text-3xl font-black">{person.full_name}</h1><p className="mt-2 text-slate-500">{person.title || person.email || "Engagement overview"}</p></div><div className="flex flex-wrap gap-2"><ShareButton token={person.engagement_share_token} /><Link href={`/organization/${id}/people/${person.id}`} className="btn-secondary">Edit profile & assign card</Link></div></div><PersonShareLinks username={person.username || person.id} cards={cards || []} /><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Metric icon={<BarChart3 />} label="Total interactions" value={events.length} /><Metric icon={<Eye />} label="Profile views" value={count("view")} /><Metric icon={<MousePointerClick />} label="Link clicks" value={count("link_click")} /><Metric icon={<CheckCircle2 />} label="Contact saves" value={count("contact_save")} /></div><div className="mt-6 grid gap-6 lg:grid-cols-2"><section className="card p-6"><h2 className="text-xl font-bold">Event breakdown</h2><p className="mt-1 text-sm text-slate-500">Every recorded interaction for this person.</p><div className="mt-5 space-y-2">{breakdown.map(([event, total]) => <div key={event} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"><span className="capitalize">{labels[event] || event.replaceAll("_", " ")}</span><strong>{total}</strong></div>)}{!breakdown.length && <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No engagement recorded yet.</p>}</div></section><section className="card p-6"><div className="flex items-center gap-2"><UserRound className="text-coral-600" size={20} /><h2 className="text-xl font-bold">Recent activity</h2></div><div className="mt-5 divide-y">{events.slice(0, 12).map((event, index) => <div key={`${event.created_at}-${index}`} className="flex justify-between gap-4 py-3"><div><p className="font-semibold capitalize">{labels[event.event_type] || event.event_type.replaceAll("_", " ")}</p><p className="text-xs text-slate-500">{event.target || "Profile interaction"}</p></div><time className="shrink-0 text-xs text-slate-400">{new Date(event.created_at).toLocaleString()}</time></div>)}{!events.length && <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Activity will appear here after the profile is shared.</p>}</div></section></div></div></main>;
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) { return <div className="card p-5"><div className="text-coral-600">{icon}</div><p className="mt-4 text-sm text-slate-500">{label}</p><p className="mt-1 text-3xl font-black">{value}</p></div>; }
