"use client";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CreditCard, Download, Plus, Upload, UserPlus } from "lucide-react";
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
  const [cards, setCards] = useState<any[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<any>(null);
  const [cardId, setCardId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [assignmentBusy, setAssignmentBusy] = useState(false);
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
    const [{ data: o }, { data: p }, { data: c }] = await Promise.all([
      s.from("organizations").select("*").eq("id", oid).single(),
      s
        .from("people")
        .select("*")
        .eq("organization_id", oid)
        .order("created_at", { ascending: false }),
      s
        .from("nfc_cards")
        .select("id,card_uid,label,person_id")
        .eq("organization_id", oid)
        .order("created_at", { ascending: false }),
    ]);
    setOrg(o);
    setPeople(p || []);
    setCards(c || []);
  }
  async function add() {
    if (!name.trim()) return;
    setBusy(true);
    const s = createClient();
    const { error } = await s
      .from("people")
      .insert({ organization_id: id, full_name: name, email });
    if (!error) {
      setName("");
      setEmail("");
      await load(id);
    }
    setBusy(false);
  }
  function selectPerson(person: any) {
    setSelectedPerson(person);
    setCardId("");
    setMessage("");
  }
  async function assignCard() {
    if (!selectedPerson || !cardId) return;
    setAssignmentBusy(true);
    setMessage("");
    const s = createClient();
    const { error } = await s
      .from("nfc_cards")
      .update({ person_id: selectedPerson.id })
      .eq("id", cardId)
      .eq("organization_id", id);
    if (error) setMessage(error.message);
    else {
      setMessage("Card assigned.");
      setCardId("");
      await load(id);
    }
    setAssignmentBusy(false);
  }
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
        people.filter((person) => person.email).map((person) => [person.email.toLowerCase(), person]),
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
        const existing = row.email ? existingByEmail.get(row.email.toLowerCase()) : null;
        const { error } = existing
          ? await s.from("people").update(person).eq("id", existing.id).eq("organization_id", id)
          : await s.from("people").insert({ ...person, organization_id: id });
        if (error) skipped += 1;
        else imported += 1;
      }
      await load(id);
      setMessage(`Imported ${imported} people${skipped ? `; skipped ${skipped}.` : "."}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not read that CSV file.");
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
              <button onClick={exportPeople} disabled={!people.length} className="btn-secondary gap-2 disabled:cursor-not-allowed disabled:opacity-50">
                <Download size={16} /> Export CSV
              </button>
              <button onClick={() => importInput.current?.click()} disabled={importBusy} className="btn-secondary gap-2 disabled:cursor-not-allowed disabled:opacity-50">
                <Upload size={16} /> {importBusy ? "Importing…" : "Import CSV"}
              </button>
              <input ref={importInput} type="file" accept=".csv,text/csv" onChange={importPeople} className="hidden" />
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500">CSV columns: full_name, email, external_id, title, phone, status. Matching emails update existing people.</p>
            {message && <p className="mt-3 text-sm text-slate-600">{message}</p>}
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
            {selectedPerson && (
              <section className="card p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-coral-600">
                      <CreditCard size={18} />
                      <h2 className="text-xl font-bold text-slate-900">
                        Assign a card
                      </h2>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">
                      Choose a card for {selectedPerson.full_name}.
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedPerson(null)}
                    className="text-sm font-semibold text-slate-500 hover:text-slate-900"
                  >
                    Close
                  </button>
                </div>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <select
                    className="input"
                    value={cardId}
                    onChange={(e) => setCardId(e.target.value)}
                  >
                    <option value="">Select a card</option>
                    {cards.map((card) => (
                      <option key={card.id} value={card.id}>
                        {card.label || card.card_uid}
                        {card.person_id ? " (reassign)" : ""}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={assignCard}
                    disabled={assignmentBusy || !cardId}
                    className="btn-primary whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {assignmentBusy ? "Assigning…" : "Assign card"}
                  </button>
                </div>
                {!cards.length && (
                  <p className="mt-3 text-sm text-slate-500">
                    Register a card first from the Cards page.
                  </p>
                )}
                {message && <p className="mt-3 text-sm text-slate-600">{message}</p>}
              </section>
            )}
            <section className="card p-6">
              <h2 className="text-xl font-bold">People ({people.length})</h2>
            <div className="mt-5 space-y-3">
              {people.length ? (
                people.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => selectPerson(p)}
                    className="flex w-full items-center justify-between rounded-xl border p-4 text-left transition hover:border-coral-300 hover:bg-coral-50"
                  >
                    <div>
                      <b>{p?.full_name ?? ""}</b>
                      <p className="text-sm text-slate-500">
                        {p?.email ?? "No email"} · {p?.status}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-coral-600">
                      Assign card
                    </span>
                  </button>
                ))
              ) : (
                <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                  No people added yet.
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
