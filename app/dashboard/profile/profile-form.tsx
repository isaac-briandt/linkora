"use client";
import { ChangeEvent, useState } from "react";
import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";
import type { Profile } from "@/lib/types";

export default function ProfileForm({ initial }: { initial: Profile }) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<keyof Profile | null>(null);
  const [msg, setMsg] = useState("");
  const [links, setLinks] = useState<{ title: string; url: string }[]>(initial.link_items || []);
  function set(k: keyof Profile, v: string) {
    setForm((x) => ({ ...x, [k]: v }));
  }
  async function save() {
    setSaving(true);
    setMsg("");
    const { error } = await createClient()
      .from("profiles")
      .update({ ...form, link_items: links.filter((link) => link.title.trim() && link.url.trim()) })
      .eq("id", form.id);
    setMsg(error ? error.message : "Profile saved successfully.");
    setSaving(false);
  }
  async function uploadImage(field: "avatar_url" | "cover_image_url", event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return setMsg("Please choose an image file.");
    if (file.size > 5 * 1024 * 1024) return setMsg("Images must be 5 MB or smaller.");
    setUploading(field);
    setMsg("");
    const extension = file.name.split(".").pop()?.replace(/[^a-z0-9]/gi, "") || "jpg";
    const path = `${form.id}/${field}-${Date.now()}.${extension}`;
    const storage = createClient().storage.from("profile-media");
    const { error } = await storage.upload(path, file, { contentType: file.type, upsert: false });
    if (error) setMsg(error.message);
    else {
      const { data } = storage.getPublicUrl(path);
      set(field, data.publicUrl);
      setMsg("Image uploaded. Save changes to publish it on your profile.");
    }
    setUploading(null);
  }
  const fields: [keyof Profile, string, string][] = [
    ["full_name", "Full name", "text"],
    ["username", "Username", "text"],
    ["title", "Job title", "text"],
    ["company", "Company", "text"],
    ["bio", "Bio", "textarea"],
    ["phone", "Phone", "tel"],
    ["email", "Email", "email"],
    ["whatsapp", "WhatsApp number", "tel"],
    ["website", "Website URL", "url"],
    ["linkedin", "LinkedIn URL", "url"],
    ["instagram", "Instagram URL", "url"],
    ["facebook", "Facebook URL", "url"],
    ["x_url", "X URL", "url"],
    ["tiktok", "TikTok URL", "url"],
    ["github", "GitHub URL", "url"],
  ];
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-7 flex items-center justify-between">
        <div>
          <Link
            href="/dashboard"
            className="text-sm font-semibold text-coral-600"
          >
            ← Dashboard
          </Link>
          <h1 className="mt-2 text-3xl font-black">Edit profile</h1>
        </div>
        <Link
          target="_blank"
          href={`/u/${form?.username}`}
          className="btn-secondary"
        >
          Preview
        </Link>
      </div>
      <div className="card p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          {fields?.map(([key, label, type]) => (
            <div className={key === "bio" ? "sm:col-span-2" : ""} key={key}>
              <label className="label">{label}</label>
              {type === "textarea" ? (
                <textarea
                  className="input min-h-28"
                  value={String(form[key] ?? "")}
                  onChange={(e) => set(key, e.target.value)}
                />
              ) : (
                <input
                  className="input"
                  type={type}
                  value={String(form[key] ?? "")}
                  onChange={(e) => set(key, e.target.value)}
                />
              )}
            </div>
          ))}
          <ImageField
            label="Profile image"
            value={form.avatar_url}
            uploading={uploading === "avatar_url"}
            onChange={(value) => set("avatar_url", value)}
            onUpload={(event) => uploadImage("avatar_url", event)}
          />
          <ImageField
            label="Cover image"
            value={form.cover_image_url}
            uploading={uploading === "cover_image_url"}
            onChange={(value) => set("cover_image_url", value)}
            onUpload={(event) => uploadImage("cover_image_url", event)}
          />
        </div>
        <div className="mt-6 flex items-center gap-4">
          <button onClick={save} disabled={saving} className="btn-primary">
            {saving ? "Saving…" : "Save changes"}
          </button>
          {msg && <span className="text-sm text-slate-600">{msg}</span>}
        </div>
        <div className="mt-8 border-t pt-6">
          <h2 className="text-xl font-bold">Featured links</h2>
          <p className="mt-1 text-sm text-slate-500">Add the links you want people to see first.</p>
          <div className="mt-4 space-y-3">
            {links.map((link, index) => <div key={index} className="grid gap-3 sm:grid-cols-[.8fr_1.2fr_auto]"><input className="input" value={link.title} placeholder="Button title" onChange={(event) => setLinks((current) => current.map((item, i) => i === index ? { ...item, title: event.target.value } : item))} /><input className="input" value={link.url} placeholder="https://example.com" onChange={(event) => setLinks((current) => current.map((item, i) => i === index ? { ...item, url: event.target.value } : item))} /><button type="button" className="text-sm font-semibold text-red-600" onClick={() => setLinks((current) => current.filter((_, i) => i !== index))}>Remove</button></div>)}
          </div>
          <button type="button" className="btn-secondary mt-4" onClick={() => setLinks((current) => [...current, { title: "", url: "" }])}>Add link</button>
        </div>
      </div>
    </div>
  );
}

function ImageField({ label, value, uploading, onChange, onUpload }: { label: string; value: string; uploading: boolean; onChange: (value: string) => void; onUpload: (event: ChangeEvent<HTMLInputElement>) => void }) {
  return <div>
    <label className="label">{label}</label>
    <input className="input" type="url" value={value || ""} onChange={(event) => onChange(event.target.value)} placeholder="Paste a public image URL" />
    <div className="mt-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3">
      <label className="block text-sm font-semibold text-slate-700">Upload an image file</label>
      <input className="mt-2 block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-coral-600 file:px-3 file:py-2 file:text-sm file:font-bold file:text-white hover:file:bg-coral-700 disabled:opacity-50" type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={onUpload} disabled={uploading} />
      {uploading ? <p className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-coral-700"><LoaderCircle className="animate-spin" size={14} /> Uploading image…</p> : <p className="mt-2 text-xs text-slate-500">JPG, PNG, WebP, or GIF · maximum 5 MB</p>}
    </div>
  </div>;
}
