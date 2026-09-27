"use client";

import { useState } from "react";
import QRCode from "qrcode";
import { Check, Copy, Download, Link2, QrCode } from "lucide-react";

type Card = { id: string; card_uid: string; label: string | null; status: string };

export default function PersonShareLinks({ username, cards }: { username: string; cards: Card[] }) {
  const profilePath = `/p/${username}`;
  const [copied, setCopied] = useState("");
  async function copy(path: string, key: string) {
    await navigator.clipboard.writeText(`${window.location.origin}${path}`);
    setCopied(key);
    window.setTimeout(() => setCopied(""), 1800);
  }
  async function downloadQr(path: string, filename: string) {
    const data = await QRCode.toDataURL(`${window.location.origin}${path}`, { width: 900, margin: 2 });
    const anchor = document.createElement("a");
    anchor.href = data;
    anchor.download = filename;
    anchor.click();
  }
  return <section className="card mt-6 p-6"><div className="flex items-start gap-3"><div className="rounded-xl bg-coral-50 p-3 text-coral-700"><Link2 size={20} /></div><div><h2 className="text-xl font-bold">Share this person</h2><p className="mt-1 text-sm text-slate-500">Use the profile link for sharing, or connect an assigned card to its NFC/QR destination.</p></div></div><div className="mt-5 rounded-xl border p-4"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Profile link</p><div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center"><code className="min-w-0 flex-1 truncate text-sm text-slate-700">{typeof window !== "undefined" ? window.location.origin : ""}{profilePath}</code><div className="flex shrink-0 gap-2"><button type="button" onClick={() => copy(profilePath, "profile")} className="btn-secondary gap-2 px-3 py-2 text-sm">{copied === "profile" ? <Check size={15} /> : <Copy size={15} />}{copied === "profile" ? "Copied" : "Copy link"}</button><button type="button" onClick={() => downloadQr(profilePath, `connectora-${username}-profile-qr.png`)} className="btn-secondary gap-2 px-3 py-2 text-sm"><QrCode size={15} />Download QR</button></div></div></div><div className="mt-4 space-y-3">{cards.length ? cards.map((card) => { const path = `/c/${card.card_uid}`; return <div key={card.id} className="rounded-xl border p-4"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><p className="font-bold">{card.label || card.card_uid}</p><p className="mt-1 text-xs text-slate-500">NFC / QR destination · {card.card_uid}</p></div><div className="flex shrink-0 gap-2"><button type="button" onClick={() => copy(path, card.id)} className="btn-secondary gap-2 px-3 py-2 text-sm">{copied === card.id ? <Check size={15} /> : <Copy size={15} />}{copied === card.id ? "Copied" : "Copy card link"}</button><button type="button" onClick={() => downloadQr(path, `connectora-${card.card_uid}-qr.png`)} className="btn-primary gap-2 px-3 py-2 text-sm"><Download size={15} />Download QR</button></div></div><p className="mt-3 break-all text-xs text-slate-400">{typeof window !== "undefined" ? window.location.origin : ""}{path}</p></div>; }) : <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No active card is assigned to this person yet. Assign one from Edit profile & assign card.</p>}</div></section>;
}