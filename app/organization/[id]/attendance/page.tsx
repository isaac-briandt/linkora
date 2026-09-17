import Link from "next/link";
import { ArrowLeft, CalendarCheck, Radio } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
export default async function AttendancePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const s = await createClient();
  const {
    data: { user },
  } = await s.auth.getUser();
  if (!user) redirect("/login");
  const { data: org } = await s
    .from("organizations")
    .select("*")
    .eq("id", id)
    .single();
  if (!org) notFound();
  const { data: member } = await s
    .from("organization_members")
    .select("role")
    .eq("organization_id", id)
    .eq("profile_id", user.id)
    .single();
  if (!member) redirect("/dashboard");
  const { data: records } = await s
    .from("attendance_records")
    .select("*, people(full_name), attendance_points(name)")
    .eq("organization_id", id)
    .order("scanned_at", { ascending: false })
    .limit(50);
  return (
    <main className="min-h-screen py-10">
      <div className="container-page">
        <Link
          href={`/organization/${id}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-coral-600"
        >
          <ArrowLeft size={15} /> {org.name}
        </Link>
        <div className="mt-5 flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold text-coral-600">ATTENDANCE</p>
            <h1 className="mt-1 text-3xl font-black">Check-ins & check-outs</h1>
            <p className="mt-2 text-slate-500">
              The foundation for employee and student attendance.
            </p>
          </div>
          <div className="rounded-xl bg-coral-50 p-3 text-coral-700">
            <Radio />
          </div>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <div className="card p-6">
            <p className="text-sm text-slate-500">Records shown</p>
            <p className="mt-1 text-3xl font-black">{records?.length || 0}</p>
          </div>
          <div className="card p-6">
            <p className="text-sm text-slate-500">Organization</p>
            <p className="mt-1 font-bold">{org.name}</p>
          </div>
          <div className="card p-6">
            <p className="text-sm text-slate-500">Scan model</p>
            <p className="mt-1 font-bold">NFC + QR ready</p>
          </div>
        </div>
        <div className="card mt-8 overflow-hidden">
          <div className="border-b p-6">
            <h2 className="text-xl font-bold">Recent attendance</h2>
          </div>
          <div className="divide-y">
            {records?.length ? (
              records.map((r: any) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between p-5"
                >
                  <div>
                    <b>{r.people?.full_name || "Person"}</b>
                    <p className="text-sm text-slate-500">
                      {r.attendance_points?.name || "General point"}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold">
                      {r.type === "check_in" ? "CHECK IN" : "CHECK OUT"}
                    </span>
                    <p className="mt-1 text-xs text-slate-400">
                      {new Date(r.scanned_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-sm text-slate-500">
                No attendance records yet. The scanning API can be connected to
                an NFC/QR point next.
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
