"use client";

import { useState } from "react";
import QRCode from "qrcode";
import { Check, Copy, Download, ExternalLink, Trash2 } from "lucide-react";
import Link from "next/link";

export default function MenuActions({
  slug,
  onDelete,
  deleting,
  disabled,
}: {
  slug: string;
  onDelete: () => void;
  deleting: boolean;
  disabled: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const path = `/m/${slug}`;
  async function copy() {
    await navigator.clipboard.writeText(`${window.location.origin}${path}`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }
  async function qr() {
    const data = await QRCode.toDataURL(`${window.location.origin}${path}`, {
      width: 900,
      margin: 2,
    });
    const anchor = document.createElement("a");
    anchor.href = data;
    anchor.download = `connectora-menu-${slug}-qr.png`;
    anchor.click();
  }
  return (
    <div className="flex flex-wrap gap-2">
      <Link href={path} target="_blank" className="btn-secondary gap-2">
        <ExternalLink size={15} /> Open menu
      </Link>
      <button
        type="button"
        onClick={copy}
        disabled={disabled}
        className="btn-secondary gap-2 disabled:opacity-50"
      >
        {copied ? <Check size={15} /> : <Copy size={15} />}
        {copied ? "Copied" : "Copy link"}
      </button>
      <button
        type="button"
        onClick={qr}
        disabled={disabled}
        className="btn-primary gap-2 disabled:opacity-50"
      >
        <Download size={15} /> QR code
      </button>
      <button
        type="button"
        onClick={onDelete}
        disabled={disabled}
        aria-label={deleting ? "Deleting menu" : "Delete menu"}
        className="btn-secondary gap-2 text-red-700 hover:bg-red-50 disabled:opacity-50"
      >
        <Trash2 size={15} /> {deleting ? "Deleting…" : "Delete"}
      </button>
    </div>
  );
}
