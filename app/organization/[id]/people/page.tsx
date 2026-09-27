"use client";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  Plus,
  Search,
  Trash2,
  Upload,
  UserPlus,
} from "lucide-react";
import { createClient } from "@/lib/supabase/browser";
import { downloadCsv, readCsv } from "@/lib/csv";
export default function PeoplePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [id, setId] = useState("");
  const [org, setOrg] = useState<any>(null);
  const [people, setPeople] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest" | "name">("newest");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [importBusy, setImportBusy] = useState(false);
  const [message, setMessage] = useState("");
  const importInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    params.then((x) => {
      setId(x.id);
      load(x.id);
    });
  }, []);
  async function load(oid: string) {
    const s = createClient();
    const [{ data: o }, { data: p }] = await Promise.all([
      s.from("organizations").select("*").eq("id", oid).single(),
      s
        .from("people")
        .select("*")
        .eq("organization_id", oid)
        .order("created_at", { ascending: false }),
    ]);
    setOrg(o);
    setPeople(p || []);
  }
  async function add() {
    if (!name.trim()) return;
    setBusy(true);
    const s = createClient();
    const { error } = await s.from("people").insert({
      organization_id: id,
      full_name: name,
      username: `${name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")}-${Date.now().toString(36)}`,
      company: org?.name || "",
      email: email || null,
    });
    if (!error) {
      setName("");
      setEmail("");
      await load(id);
    }
    setBusy(false);
  }
  async function removePerson(person: any) {
    if (
      !window.confirm(
        `Delete ${person.full_name}? Their engagement history will also be deleted and assigned cards will become unassigned.`,
      )
    )
      return;
    setDeletingId(person.id);
    setMessage("");
    const { error } = await createClient()
      .from("people")
      .delete()
      .eq("id", person.id)
      .eq("organization_id", id);
    if (error) setMessage(error.message);
    else {
      setPeople((current) => current.filter((item) => item.id !== person.id));
      setMessage(`${person.full_name} was deleted.`);
    }
    setDeletingId(null);
  }
  const visiblePeople = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return people
      .filter(
        (person) =>
          !normalized ||
          [
            person.full_name,
            person.email,
            person.title,
            person.username,
            person.status,
          ].some((value) =>
            String(value || "")
              .toLowerCase()
              .includes(normalized),
          ),
      )
      .sort((a, b) =>
        sort === "name"
          ? String(a.full_name || "").localeCompare(String(b.full_name || ""))
          : sort === "oldest"
            ? new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime()
            : new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime(),
      );
  }, [people, query, sort]);
  function exportPeople() {
    downloadCsv(
      `${org?.slug || "organization"}-people.csv`,
      ["full_name", "email", "external_id", "title", "phone", "status"],
      people,
    );
  }
  async function importPeople(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !id) return;
    setImportBusy(true);
    setMessage("");
    try {
      const rows = await readCsv(file);
      if (!rows.length) throw new Error("The CSV has no rows.");
      const s = createClient();
      const existingByEmail = new Map(
        people
          .filter((person) => person.email)
          .map((person) => [person.email.toLowerCase(), person]),
      );
      let imported = 0;
      let skipped = 0;
      for (const row of rows) {
        if (!row.full_name) {
          skipped += 1;
          continue;
        }
        const person = {
          full_name: row.full_name,
          email: row.email || null,
          external_id: row.external_id || null,
          title: row.title || null,
          phone: row.phone || null,
          status: row.status === "inactive" ? "inactive" : "active",
        };
        const existing = row.email
          ? existingByEmail.get(row.email.toLowerCase())
          : null;
        const { error } = existing
          ? await s
              .from("people")
              .update(person)
              .eq("id", existing.id)
              .eq("organization_id", id)
          : await s.from("people").insert({ ...person, organization_id: id });
        if (error) skipped += 1;
        else imported += 1;
      }
      await load(id);
      setMessage(
        `Imported ${imported} people${skipped ? `; skipped ${skipped}.` : "."}`,
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not read that CSV file.",
      );
    }
    setImportBusy(false);
  }
  return (
    <main className="min-h-screen py-10">
      <div className="container-page">
        <Link
          href={id ? `/organization/${id}` : "/dashboard"}
          className="inline-flex items-center gap-2 text-sm font-semibold text-coral-600"
        >
          <ArrowLeft size={15} /> Back
        </Link>
        <div className="mt-5 flex justify-between">
          <div>
            <p className="text-sm font-semibold text-coral-600">
              {org?.type?.toUpperCase()}
            </p>
            <h1 className="text-3xl font-black">{org?.name || "People"}</h1>
            <p className="mt-2 text-slate-500">
              Add employees, students, staff or attendees.
            </p>
          </div>
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-[360px_1fr]">
          <div className="card p-6">
            <UserPlus className="text-coral-600" />
            <h2 className="mt-4 text-xl font-bold">Add person</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={exportPeople}
                disabled={!people.length}
                className="btn-secondary gap-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Download size={16} /> Export CSV
              </button>
              <button
                onClick={() => importInput.current?.click()}
                disabled={importBusy}
                className="btn-secondary gap-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Upload size={16} /> {importBusy ? "Importing…" : "Import CSV"}
              </button>
              <input
                ref={importInput}
                type="file"
                accept=".csv,text/csv"
                onChange={importPeople}
                className="hidden"
              />
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500">
              CSV columns: full_name, email, external_id, title, phone, status.
              Matching emails update existing people.
            </p>
            {message && (
              <p className="mt-3 text-sm text-slate-600">{message}</p>
            )}
            <div className="mt-5 space-y-4">
              <div>
                <label className="label">Full name</label>
                <input
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Mensah"
                />
              </div>
              <div>
                <label className="label">Email</label>
                <input
                  className="input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                />
              </div>
              <button
                disabled={busy || !name.trim()}
                onClick={add}
                className="btn-primary gap-2"
              >
                <Plus size={17} />
                {busy ? "Adding…" : "Add person"}
              </button>
            </div>
          </div>
          <div className="space-y-6">
            <section className="card p-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-xl font-bold">
                    People ({visiblePeople.length}
                    {query ? ` of ${people.length}` : ""})
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Click a person to view their engagement.
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <label className="relative block">
                    <Search
                      size={16}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      className="input pl-9 sm:w-56"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder=""
                      aria-label="Search people"
                    />
                  </label>
                  <select
                    className="input sm:w-40"
                    value={sort}
                    onChange={(event) =>
                      setSort(event.target.value as typeof sort)
                    }
                    aria-label="Sort people"
                  >
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                    <option value="name">Name A-Z</option>
                  </select>
                </div>
              </div>
              <div className="mt-5 space-y-3">
                {visiblePeople.length ? (
                  visiblePeople.map((p) => (
                    <div
                      key={p.id}
                      className="flex w-full flex-col gap-4 rounded-xl border p-4 text-left transition hover:border-coral-300 hover:bg-coral-50 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <Link
                        href={`/organization/${id}/people/${p.id}/engagement`}
                        className="min-w-0 flex-1"
                      >
                        <b>{p?.full_name ?? ""}</b>
                        <p className="text-sm text-slate-500">
                          {p?.email ?? "No email"} · {p?.status}
                        </p>
                        <p className="mt-2 text-xs font-semibold text-coral-600">
                          View engagement →
                        </p>
                      </Link>
                      <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-coral-600">
                        <Link
                          href={`/organization/${id}/people/${p.id}`}
                          className="rounded-lg border border-coral-200 px-3 py-2 hover:bg-coral-50"
                        >
                          Edit profile & assign card
                        </Link>
                        <button
                          type="button"
                          onClick={() => removePerson(p)}
                          disabled={deletingId === p.id}
                          className="inline-flex items-center gap-1 rounded-lg px-2 py-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                          aria-label={`Delete ${p.full_name}`}
                        >
                          <Trash2 size={15} />{" "}
                          {deletingId === p.id ? "Deleting…" : "Delete"}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                    {query
                      ? "No people match that search."
                      : "No people added yet."}
                  </p>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
