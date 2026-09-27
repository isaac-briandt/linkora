"use client";

import { useState } from "react";
import QRCode from "qrcode";
import { Check, Copy, Download, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function MenuActions({ slug }: { slug: string }) {
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
      <button type="button" onClick={copy} className="btn-secondary gap-2">
        {copied ? <Check size={15} /> : <Copy size={15} />}
        {copied ? "Copied" : "Copy link"}
      </button>
      <button type="button" onClick={qr} className="btn-primary gap-2">
        <Download size={15} /> QR code
      </button>
    </div>
  );
}
