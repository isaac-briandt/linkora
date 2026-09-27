"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Check, Copy, Download, ExternalLink, Link2, Plus, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";

type Card = { id: string; card_uid: string; label: string | null; status: string; destination_url: string | null };

function validDestination(value: string) {
  try { const url = new URL(value); return url.protocol === "https:" || url.protocol === "http:"; } catch { return false; }
}

export default function CardsClient() {
  const [cards, setCards] = useState<Card[]>([]);
  const [uid, setUid] = useState("");
  const [label, setLabel] = useState("");
  const [destination, setDestination] = useState("");
  const [busy, setBusy] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const s = createClient();

  async function load() {
    const { data: { user } } = await s.auth.getUser();
    if (!user) return;
    const { data, error } = await s.from("nfc_cards").select("id,card_uid,label,status,destination_url").eq("profile_id", user.id).order("created_at", { ascending: false });
    if (error) setError(error.message); else setCards(data || []);
  }
  useEffect(() => { load(); }, []);

  async function add() {
    setError(""); setMessage("");
    const cleanDestination = destination.trim();
    if (!uid.trim()) return setError("Enter the card UID.");
    if (cleanDestination && !validDestination(cleanDestination)) return setError("Use a full http:// or https:// destination URL.");
    setBusy(true);
    const { data: { user } } = await s.auth.getUser();
    if (!user) { setError("Please log in."); setBusy(false); return; }
    const { error } = await s.from("nfc_cards").insert({ card_uid: uid.trim(), label: label.trim() || null, profile_id: user.id, destination_type: cleanDestination ? "custom" : "profile", destination_url: cleanDestination || null, status: "active" });
    if (error) setError(error.message);
    else { setUid(""); setLabel(""); setDestination(""); setMessage("Card registered. Its Connectora link stays the same if you change the destination later."); await load(); }
    setBusy(false);
  }

  async function saveDestination(card: Card, value: string) {
    const cleanDestination = value.trim(); setError(""); setMessage("");
    if (cleanDestination && !validDestination(cleanDestination)) return setError("Use a full http:// or https:// destination URL.");
    setSavingId(card.id);
    const { error } = await s.from("nfc_cards").update({ destination_url: cleanDestination || null, destination_type: cleanDestination ? "custom" : "profile" }).eq("id", card.id);
    if (error) setError(error.message); else { setMessage(`Updated ${card.label || card.card_uid}.`); await load(); }
    setSavingId(null);
  }
  async function qr(card: Card) { const data = await QRCode.toDataURL(`${window.location.origin}/c/${card.card_uid}`, { width: 800, margin: 2 }); const a = document.createElement("a"); a.href = data; a.download = `connectora-${card.card_uid}-qr.png`; a.click(); }
  async function copyLink(card: Card) { await navigator.clipboard.writeText(`${window.location.origin}/c/${card.card_uid}`); setCopiedId(card.id); window.setTimeout(() => setCopiedId(null), 1800); }

  return <div className="mt-8 grid gap-6 lg:grid-cols-[380px_1fr]">
    <section className="card p-6"><div className="flex items-center gap-2 text-coral-700"><Link2 size={19} /><h2 className="text-xl font-bold text-slate-900">Register card</h2></div><p className="mt-2 text-sm leading-6 text-slate-500">Give every NFC tag or QR a stable Connectora link, then choose whether it opens your profile or a specific destination.</p><div className="mt-5 space-y-4"><div><label className="label">Card UID</label><input className="input" value={uid} onChange={(e) => setUid(e.target.value)} placeholder="BLQ-00182" /></div><div><label className="label">Label</label><input className="input" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Conference card" /></div><div><label className="label">Custom destination <span className="font-normal text-slate-400">(optional)</span></label><input className="input" type="url" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="https://example.com/book" /><p className="mt-1.5 text-xs leading-5 text-slate-500">Leave blank to open your Connectora profile.</p></div>{error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}{message && <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}<button onClick={add} disabled={busy} className="btn-primary gap-2 disabled:cursor-not-allowed disabled:opacity-50"><Plus size={16} />{busy ? "Registering…" : "Register card"}</button></div></section>
    <section className="card p-6"><h2 className="text-xl font-bold">Your cards ({cards.length})</h2><p className="mt-1 text-sm text-slate-500">Use a different destination for each context without replacing the printed QR or NFC link.</p><div className="mt-5 space-y-4">{cards.length ? cards.map((card) => <CardRow key={card.id} card={card} onQr={qr} onCopy={copyLink} onSave={saveDestination} saving={savingId === card.id} copied={copiedId === card.id} />) : <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No cards registered yet.</p>}</div></section>
  </div>;
}

function CardRow({ card, onQr, onCopy, onSave, saving, copied }: { card: Card; onQr: (card: Card) => void; onCopy: (card: Card) => void; onSave: (card: Card, value: string) => void; saving: boolean; copied: boolean }) {
  const [destination, setDestination] = useState(card.destination_url || "");
  return <div className="rounded-xl border p-4"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div><p className="font-bold">{card.label || card.card_uid}</p><p className="mt-1 text-xs text-slate-500">{card.card_uid} · {card.status}</p></div><div className="flex flex-wrap gap-2"><button onClick={() => onCopy(card)} className="btn-secondary gap-2 px-3 py-2 text-sm">{copied ? <Check size={15} /> : <Copy size={15} />}{copied ? "Copied" : "Copy link"}</button><button onClick={() => onQr(card)} className="btn-secondary gap-2 px-3 py-2 text-sm"><Download size={15} />QR</button></div></div><p className="mt-3 break-all text-xs text-slate-400">{typeof window !== "undefined" ? window.location.origin : ""}/c/{card.card_uid}</p><div className="mt-4 flex flex-col gap-2 sm:flex-row"><input aria-label={`Destination for ${card.label || card.card_uid}`} className="input" type="url" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Profile (default) or https://…" /><button onClick={() => onSave(card, destination)} disabled={saving} className="btn-primary shrink-0 gap-2 disabled:opacity-50"><Save size={15} />{saving ? "Saving…" : "Save"}</button></div>{card.destination_url && <a className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-coral-600" href={card.destination_url} target="_blank" rel="noopener noreferrer">Open destination <ExternalLink size={12} /></a>}</div>;
}
