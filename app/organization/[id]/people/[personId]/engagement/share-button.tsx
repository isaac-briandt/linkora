"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export default function ShareButton({ token }: { token: string | null }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    if (!token) return;
    await navigator.clipboard.writeText(`${window.location.origin}/e/${token}`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }
  return <button type="button" onClick={copy} disabled={!token} className="btn-primary gap-2 disabled:opacity-50">{copied ? <Check size={16} /> : <Copy size={16} />}{copied ? "Copied" : "Copy private link"}</button>;
}