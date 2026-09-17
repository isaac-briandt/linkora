"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/browser";
export default function AttendanceClient() {
  const [orgs, setOrgs] = useState<any[]>([]),
    [orgId, setOrgId] = useState(""),
    [people, setPeople] = useState<any[]>([]),
    [personId, setPersonId] = useState(""),
    [type, setType] = useState("check_in"),
    [message, setMessage] = useState("");
  const s = createClient();
  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await s.auth.getUser();
      if (!user) return;
      const { data } = await s
        .from("organization_members")
        .select("organization_id,organizations(id,name,type)")
        .eq("profile_id", user.id);
      setOrgs(data || []);
    })();
  }, []);
  useEffect(() => {
    if (!orgId) {
      setPeople([]);
      return;
    }
    (async () => {
      const { data } = await s
        .from("people")
        .select("id,full_name,title,status")
        .eq("organization_id", orgId)
        .eq("status", "active")
        .order("full_name");
      setPeople(data || []);
    })();
  }, [orgId]);
  async function submit() {
    setMessage("");
    if (!orgId || !personId) {
      setMessage("Select an organization and person.");
      return;
    }
    const r = await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ organizationId: orgId, personId, type }),
    });
    const d = await r.json();
    setMessage(
      r.ok
        ? `Recorded ${type.replace("_", " ")} for ${d.person?.full_name || "person"}.`
        : d.error || "Unable to record attendance.",
    );
  }
  return (
    <div className="mt-8 max-w-2xl card p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="label">Organization</label>
          <select
            className="input"
            value={orgId}
            onChange={(e) => {
              setOrgId(e.target.value);
              setPersonId("");
            }}
          >
            <option value="">Select organization</option>
            {orgs.map((o: any) => (
              <option key={o.organization_id} value={o.organization_id}>
                {o.organizations?.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Person</label>
          <select
            className="input"
            value={personId}
            onChange={(e) => setPersonId(e.target.value)}
            disabled={!orgId}
          >
            <option value="">Select person</option>
            {people.map((p) => (
              <option key={p.id} value={p.id}>
                {p?.full_name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-4">
        <label className="label">Action</label>
        <select
          className="input"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="check_in">Check in</option>
          <option value="check_out">Check out</option>
        </select>
      </div>
      {message && (
        <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm">{message}</p>
      )}
      <button onClick={submit} className="btn-primary mt-5">
        Record attendance
      </button>
    </div>
  );
}
