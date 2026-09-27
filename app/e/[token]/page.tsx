import { notFound } from "next/navigation";
import {
  BarChart3,
  CheckCircle2,
  Eye,
  MousePointerClick,
  UserRound,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

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

export default async function SharedEngagementPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const s = await createClient();
  const { data } = await s.rpc("get_public_person_engagement", {
    share_token: token,
  });
  if (!data?.person) notFound();
  const events = data.events || [];
  const count = (type: string) =>
    events.filter((event: any) => event.event_type === type).length;
  const breakdown = (
    Object.entries(
      events.reduce((result: Record<string, number>, event: any) => {
        result[event.event_type] = (result[event.event_type] || 0) + 1;
        return result;
      }, {}),
    ) as [string, number][]
  ).sort((a, b) => b[1] - a[1]);
  return (
    <main className="min-h-screen bg-slate-100 py-10">
      <div className="container-page max-w-4xl">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-wider text-coral-600">
            CONNECTORA ENGAGEMENT REPORT
          </p>
          <h1 className="mt-1 text-3xl font-black">{data.person.full_name}</h1>
          <p className="mt-2 text-slate-500">
            {data.person.title || data.person.company || "Engagement overview"}
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric
            icon={<BarChart3 />}
            label="Total interactions"
            value={events.length}
          />
          <Metric icon={<Eye />} label="Profile views" value={count("view")} />
          <Metric
            icon={<MousePointerClick />}
            label="Link clicks"
            value={count("link_click")}
          />
          <Metric
            icon={<CheckCircle2 />}
            label="Contact saves"
            value={count("contact_save")}
          />
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="card p-6">
            <h2 className="text-xl font-bold">Event breakdown</h2>
            <div className="mt-5 space-y-2">
              {breakdown.map(([event, total]) => (
                <div
                  key={event}
                  className="flex justify-between rounded-xl bg-slate-50 px-4 py-3"
                >
                  <span>{labels[event] || event.replaceAll("_", " ")}</span>
                  <strong>{total}</strong>
                </div>
              ))}
              {!breakdown.length && (
                <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                  No engagement recorded yet.
                </p>
              )}
            </div>
          </section>
          <section className="card p-6">
            <div className="flex items-center gap-2">
              <UserRound className="text-coral-600" size={20} />
              <h2 className="text-xl font-bold">Recent activity</h2>
            </div>
            <div className="mt-5 divide-y">
              {events.slice(0, 12).map((event: any, index: number) => (
                <div
                  key={`${event.created_at}-${index}`}
                  className="flex justify-between gap-4 py-3"
                >
                  <div>
                    <p className="font-semibold">
                      {labels[event.event_type] ||
                        event.event_type.replaceAll("_", " ")}
                    </p>
                    <p className="text-xs text-slate-500">
                      {event.target || "Profile interaction"}
                    </p>
                  </div>
                  <time className="shrink-0 text-xs text-slate-400">
                    {new Date(event.created_at).toLocaleString()}
                  </time>
                </div>
              ))}
              {!events.length && (
                <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                  Activity will appear here after the profile is shared.
                </p>
              )}
            </div>
          </section>
        </div>
        <p className="mt-8 text-center text-xs text-slate-400">
          Shared securely with Connectora
        </p>
      </div>
    </main>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="card p-5">
      <div className="text-coral-600">{icon}</div>
      <p className="mt-4 text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-black">{value}</p>
    </div>
  );
}
