"use client";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Plus, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";
import { downloadCsv, readCsv } from "@/lib/csv";
export default function OrgCards({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [id, setId] = useState(""),
    [org, setOrg] = useState<any>(null),
    [cards, setCards] = useState<any[]>([]),
    [people, setPeople] = useState<any[]>([]),
    [uid, setUid] = useState(""),
    [label, setLabel] = useState(""),
    [personId, setPersonId] = useState(""),
    [selectedCard, setSelectedCard] = useState<any>(null),
    [assignmentPersonId, setAssignmentPersonId] = useState(""),
    [assignmentBusy, setAssignmentBusy] = useState(false),
    [importBusy, setImportBusy] = useState(false),
    [message, setMessage] = useState("");
  const importInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    params.then((x) => {
      setId(x.id);
      load(x.id);
    });
  }, []);
  async function load(oid: string) {
    const s = createClient();
    const [{ data: o }, { data: c }, { data: p }] = await Promise.all([
      s.from("organizations").select("*").eq("id", oid).single(),
      s
        .from("nfc_cards")
        .select("*,people(full_name,email)")
        .eq("organization_id", oid)
        .order("created_at", { ascending: false }),
      s
        .from("people")
        .select("id,full_name,email,status")
        .eq("organization_id", oid)
        .order("full_name"),
    ]);
    setOrg(o);
    setCards(c || []);
    setPeople(p || []);
  }
  async function add() {
    setMessage("");
    if (!uid.trim() || !id) {
      setMessage("Card UID is required.");
      return;
    }
    const s = createClient();
    const { error } = await s.from("nfc_cards").insert({
      card_uid: uid.trim(),
      label: label.trim() || null,
      organization_id: id,
      person_id: personId || null,
      destination_type: "organization",
      status: "active",
    });
    if (error) setMessage(error.message);
    else {
      setUid("");
      setLabel("");
      setPersonId("");
      setMessage("Card registered.");
      load(id);
    }
  }
  function selectCard(card: any) {
    setSelectedCard(card);
    setAssignmentPersonId(card.person_id || "");
    setMessage("");
  }
  async function updateAssignment() {
    if (!selectedCard) return;
    setAssignmentBusy(true);
    setMessage("");
    const s = createClient();
    const { error } = await s
      .from("nfc_cards")
      .update({ person_id: assignmentPersonId || null })
      .eq("id", selectedCard.id)
      .eq("organization_id", id);
    if (error) setMessage(error.message);
    else {
      setMessage(assignmentPersonId ? "Card assigned." : "Card unassigned.");
      await load(id);
    }
    setAssignmentBusy(false);
  }
  function exportCards() {
    downloadCsv(
      `${org?.slug || "organization"}-cards.csv`,
      ["card_uid", "label", "status", "person_email", "person_name"],
      cards.map((card) => ({
        card_uid: card.card_uid,
        label: card.label || "",
        status: card.status,
        person_email: card.people?.email || "",
        person_name: card.people?.full_name || "",
      })),
    );
  }
  async function importCards(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !id) return;
    setImportBusy(true);
    setMessage("");
    try {
      const rows = await readCsv(file);
      if (!rows.length) throw new Error("The CSV has no rows.");
      const s = createClient();
      const peopleByEmail = new Map(
        people.filter((person) => person.email).map((person) => [person.email.toLowerCase(), person]),
      );
      const cardsByUid = new Map(cards.map((card) => [card.card_uid.toLowerCase(), card]));
      let imported = 0;
      let skipped = 0;
      for (const row of rows) {
        const cardUid = row.card_uid.trim();
        if (!cardUid) {
          skipped += 1;
          continue;
        }
        const holder = row.person_email ? peopleByEmail.get(row.person_email.toLowerCase()) : null;
        if (row.person_email && !holder) {
          skipped += 1;
          continue;
        }
        const card = {
          card_uid: cardUid,
          label: row.label || null,
          status: ["active", "inactive", "lost", "unassigned"].includes(row.status) ? row.status : "active",
          person_id: holder?.id || null,
          organization_id: id,
          destination_type: "organization",
        };
        const existing = cardsByUid.get(cardUid.toLowerCase());
        const { error } = existing
          ? await s.from("nfc_cards").update(card).eq("id", existing.id).eq("organization_id", id)
          : await s.from("nfc_cards").insert(card);
        if (error) skipped += 1;
        else imported += 1;
      }
      await load(id);
      setMessage(`Imported ${imported} cards${skipped ? `; skipped ${skipped}.` : "."}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not read that CSV file.");
    }
    setImportBusy(false);
  }
  return (
    <main className="min-h-screen py-10">
      <div className="container-page">
        <Link
          href={id ? `/organization/${id}` : "/organizations"}
          className="inline-flex items-center gap-2 text-sm font-semibold text-coral-600"
        >
          <ArrowLeft size={15} /> {org?.name || "Organization"}
        </Link>
        <div className="mt-5">
          <p className="text-sm font-bold text-coral-600">
            ORGANIZATION · CARDS
          </p>
          <h1 className="text-3xl font-black">NFC & QR cards</h1>
          <p className="mt-2 text-slate-500">
            Issue cards to employees, students, staff or event attendees.
          </p>
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-[380px_1fr]">
          <div className="card p-6">
            <h2 className="text-xl font-bold">Issue a card</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={exportCards} disabled={!cards.length} className="btn-secondary gap-2 disabled:cursor-not-allowed disabled:opacity-50">
                <Download size={16} /> Export CSV
              </button>
              <button onClick={() => importInput.current?.click()} disabled={importBusy} className="btn-secondary gap-2 disabled:cursor-not-allowed disabled:opacity-50">
                <Upload size={16} /> {importBusy ? "Importing…" : "Import CSV"}
              </button>
              <input ref={importInput} type="file" accept=".csv,text/csv" onChange={importCards} className="hidden" />
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500">CSV columns: card_uid, label, status, person_email. Import people first; person_email assigns the card to that person.</p>
            <div className="mt-5 space-y-4">
              <div>
                <label className="label">Card UID</label>
                <input
                  className="input"
                  value={uid}
                  onChange={(e) => setUid(e.target.value)}
                  placeholder="BLQ-ORG-001"
                />
              </div>
              <div>
                <label className="label">Label</label>
                <input
                  className="input"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Staff card"
                />
              </div>
              <div>
                <label className="label">Assign to person</label>
                <select
                  className="input"
                  value={personId}
                  onChange={(e) => setPersonId(e.target.value)}
                >
                  <option value="">Unassigned</option>
                  {people.filter((p) => p.status === "active").map((p) => (
                    <option key={p.id} value={p.id}>
                      {p?.full_name}
                    </option>
                  ))}
                </select>
              </div>
              {message && <p className="text-sm text-slate-600">{message}</p>}
              <button onClick={add} className="btn-primary gap-2">
                <Plus size={16} /> Register card
              </button>
            </div>
          </div>
          <div className="space-y-6">
            {selectedCard && (
              <section className="card p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold">Assign {selectedCard.label || selectedCard.card_uid}</h2>
                    <p className="mt-1 text-sm text-slate-500">Choose the person who holds this card.</p>
                  </div>
                  <button onClick={() => setSelectedCard(null)} className="text-sm font-semibold text-slate-500 hover:text-slate-900">Close</button>
                </div>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <select className="input" value={assignmentPersonId} onChange={(e) => setAssignmentPersonId(e.target.value)}>
                    <option value="">Unassigned</option>
                    {people.filter((person) => person.status === "active").map((person) => <option key={person.id} value={person.id}>{person.full_name}</option>)}
                  </select>
                  <button onClick={updateAssignment} disabled={assignmentBusy} className="btn-primary whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-50">
                    {assignmentBusy ? "Saving…" : assignmentPersonId ? "Assign card" : "Unassign card"}
                  </button>
                </div>
                {message && <p className="mt-3 text-sm text-slate-600">{message}</p>}
              </section>
            )}
            <section className="card p-6">
              <h2 className="text-xl font-bold">Issued cards ({cards.length})</h2>
            <div className="mt-5 space-y-3">
              {cards.map((c) => (
                <button key={c.id} onClick={() => selectCard(c)} className="w-full rounded-xl border p-4 text-left transition hover:border-coral-300 hover:bg-coral-50">
                  <div className="flex justify-between">
                    <b>{c.label || c.card_uid}</b>
                    <span className="text-xs text-slate-500">{c.status}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {c.card_uid} · {c.people?.full_name || "Unassigned"}
                  </p>
                  <p className="mt-1 break-all text-xs text-slate-400">
                    /c/{c.card_uid}
                  </p>
                </button>
              ))}
              {!cards.length && (
                <p className="text-sm text-slate-500">
                  No organization cards yet.
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
