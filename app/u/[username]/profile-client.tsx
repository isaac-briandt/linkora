"use client";
import { useEffect, useState } from "react";
import {
  Mail,
  Phone,
  Globe,
  Linkedin,
  Instagram,
  Facebook,
  Github,
  MessageCircle,
  Download,
  ExternalLink,
} from "lucide-react";
import AIAssistant from "./ai-assistant";
import type { Profile } from "@/lib/types";
import QRCode from "qrcode";
import { normalizeUrl } from "@/components/normalizeUrl";
import BrandMark from "@/components/brand-mark";
export default function ProfileClient({
  profile,
  analyticsProfileId,
  analyticsPersonId,
  analyticsOrganizationId,
}: {
  profile: Profile;
  analyticsProfileId?: string | null;
  analyticsPersonId?: string | null;
  analyticsOrganizationId?: string | null;
}) {
  const [coverFailed, setCoverFailed] = useState(false);
  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/u/${profile?.username}`
      : `/u/${profile?.username}`;
  useEffect(() => {
    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profileId: analyticsProfileId,
        personId: analyticsPersonId,
        organizationId: analyticsOrganizationId,
        eventType: "view",
      }),
    }).catch(() => {});
  }, [profile?.id]);
  async function qr() {
    const data = await QRCode.toDataURL(url, { width: 700, margin: 2 });
    const a = document.createElement("a");
    a.href = data;
    a.download = `${profile?.username}-qr.png`;
    a.click();
  }
  function click(target: string) {
    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profileId: analyticsProfileId,
        personId: analyticsPersonId,
        organizationId: analyticsOrganizationId,
        eventType: "link_click",
        target,
      }),
    }).catch(() => {});
  }
  function contact() {
    const v = `BEGIN:VCARD\nVERSION:3.0\nFN:${profile?.full_name ?? ""}\nORG:${profile?.company}\nTITLE:${profile?.title}\nTEL:${profile?.phone}\nEMAIL:${profile?.email}\nURL:${profile?.website}\nEND:VCARD`;
    const blob = new Blob([v], { type: "text/vcard" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${(profile?.full_name ?? "") || "contact"}.vcf`;
    a.click();
    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profileId: analyticsProfileId,
        personId: analyticsPersonId,
        organizationId: analyticsOrganizationId,
        eventType: "contact_save",
      }),
    }).catch(() => {});
  }
  const socials: any[] = [
    ["LinkedIn", profile?.linkedin, Linkedin],
    ["Instagram", profile?.instagram, Instagram],
    ["Facebook", profile?.facebook, Facebook],
    ["X", profile?.x_url, ExternalLink],
    ["TikTok", profile?.tiktok, ExternalLink],
    ["GitHub", profile.github, Github],
  ].filter((x) => x[1]);
  const links = (profile.link_items || []).filter(
    (link) => link?.title && link?.url,
  );
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8">
      <div className="mx-auto max-w-md overflow-hidden rounded-[2rem] bg-white shadow-xl">
        <div className="relative h-40 overflow-hidden bg-gradient-to-br from-coral-600 to-ink-700">
          {profile.cover_image_url && !coverFailed && (
            <img
              src={profile.cover_image_url}
              alt=""
              className="h-full w-full object-cover"
              onError={() => setCoverFailed(true)}
            />
          )}
          <div className="absolute inset-0 bg-slate-950/10" />
        </div>
        <div className="relative z-10 -mt-14 px-6 pb-8 text-center">
          <div className="relative z-10 mx-auto grid h-28 w-28 place-items-center overflow-hidden rounded-full border-4 border-white bg-slate-200 text-3xl font-black text-slate-500">
            {profile.avatar_url ? (
              <img
                src={profile?.avatar_url}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <span>{profile?.full_name?.slice(0, 1) || "?"}</span>
            )}
          </div>
          <h1 className="mt-4 text-2xl font-black">
            {profile?.full_name ?? ""}
          </h1>
          <p className="mt-1 text-slate-600">
            {[profile?.title, profile?.company].filter(Boolean).join(" · ")}
          </p>
          {profile?.bio && (
            <p className="mt-4 text-sm leading-6 text-slate-600">
              {profile?.bio}
            </p>
          )}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <a
              onClick={() => click("phone")}
              href={profile?.phone ? `tel:${profile?.phone}` : "#"}
              className="btn-primary gap-2"
            >
              <Phone size={17} />
              Call
            </a>
            <a
              onClick={() => click("whatsapp")}
              href={
                profile?.whatsapp
                  ? `https://wa.me/${profile?.whatsapp.replace(/\D/g, "")}`
                  : "#"
              }
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary gap-2"
            >
              <MessageCircle size={17} />
              WhatsApp
            </a>
            <button onClick={contact} className="btn-secondary gap-2">
              <Download size={17} />
              Save contact
            </button>
            <button onClick={qr} className="btn-secondary">
              Get QR
            </button>
          </div>
          <div className="mt-7 space-y-3 text-left">
            {links.map((link) => (
              <a
                key={`${link.title}-${link.url}`}
                href={normalizeUrl(link.url)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => click(link.title)}
                className="flex items-center justify-between rounded-xl bg-slate-950 p-4 text-white shadow-sm"
              >
                <span className="font-semibold">{link.title}</span>
                <ExternalLink size={16} className="text-white/60" />
              </a>
            ))}
            {profile?.email && (
              <a
                onClick={() => click("email")}
                href={`mailto:${profile?.email}`}
                className="flex items-center gap-3 rounded-xl border p-4"
              >
                <Mail size={19} className="text-coral-600" />
                <span className="truncate">{profile?.email}</span>
              </a>
            )}
            {profile?.website && (
              <a
                onClick={() => click("website")}
                href={normalizeUrl(profile?.website)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl border p-4"
              >
                <Globe size={19} className="text-coral-600" />
                <span className="truncate">{profile?.website}</span>
              </a>
            )}
          </div>
          {socials.length > 0 && (
            <div className="mt-7 flex flex-wrap justify-center gap-2">
              {socials.map(([name, href, Icon]) => (
                <a
                  key={name}
                  onClick={() => click(String(name))}
                  href={normalizeUrl(String(href))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold"
                >
                  <Icon size={16} />
                  {name}
                </a>
              ))}
            </div>
          )}
          <AIAssistant username={profile?.username} />
          <div className="mt-8 flex items-center justify-center gap-1.5 text-xs text-slate-400">
            <BrandMark />
            <span>Powered by Connectora</span>
          </div>
        </div>
      </div>
    </main>
  );
}
