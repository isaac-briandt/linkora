"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ImagePlus, X } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";
const types = [
  "company",
  "school",
  "restaurant",
  "hotel",
  "event",
  "church",
  "ngo",
  "other",
];
export default function NewOrganization() {
  const [name, setName] = useState("");
  const [type, setType] = useState("company");
  const [description, setDescription] = useState("");
  const [logo, setLogo] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  async function create() {
    if (logo && !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(logo.type)) {
      setError("Choose a JPG, PNG, WebP, or GIF logo.");
      return;
    }
    if (logo && logo.size > 5 * 1024 * 1024) {
      setError("The logo must be 5 MB or smaller.");
      return;
    }
    setBusy(true);
    setError("");
    const s = createClient();
    const {
      data: { user },
    } = await s.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    let logoPath: string | null = null;
    let logoUrl: string | null = null;
    if (logo) {
      logoPath = `${user.id}/organizations/${crypto.randomUUID()}-${logo.name.replace(/[^a-z0-9._-]/gi, "-")}`;
      const { data: uploaded, error: uploadError } = await s.storage
        .from("profile-media")
        .upload(logoPath, logo, { contentType: logo.type, upsert: false });
      if (uploadError || !uploaded) {
        setError(uploadError?.message || "Could not upload the organization logo.");
        setBusy(false);
        return;
      }
      logoUrl = s.storage.from("profile-media").getPublicUrl(logoPath).data.publicUrl;
    }
    const { data, error } = await s
      .from("organizations")
      .insert({ name, slug, type, description, logo_url: logoUrl, created_by: user.id })
      .select()
      .single();
    if (error) {
      if (logoPath) await s.storage.from("profile-media").remove([logoPath]);
      setError(error.message);
      setBusy(false);
      return;
    }
    await s
      .from("organization_members")
      .insert({ organization_id: data.id, profile_id: user.id, role: "owner" });
    router.push(`/organization/${data.id}`);
  }
  return (
    <main className="min-h-screen py-12">
      <div className="container-page max-w-2xl">
        <Link
          href="/dashboard"
          className="text-sm font-semibold text-coral-600"
        >
          ← Dashboard
        </Link>
        <h1 className="mt-3 text-3xl font-black">Create an organization</h1>
        <p className="mt-2 text-slate-500">
          Choose the experience you want Connectora to power.
        </p>
        <div className="card mt-7 p-6 space-y-5">
          <div>
            <label className="label">Organization name</label>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Acme Ltd"
            />
          </div>
          <div>
            <label className="label">Type</label>
            <select
              className="input"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              {types.map((x) => (
                <option key={x} value={x}>
                  {x[0].toUpperCase() + x.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="organization-logo">
              Organization logo <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <label
                htmlFor="organization-logo"
                className="btn-secondary inline-flex cursor-pointer items-center gap-2"
              >
                <ImagePlus size={16} /> {logo ? "Change logo" : "Upload logo"}
              </label>
              {logo && (
                <span className="inline-flex items-center gap-2 text-sm text-slate-600">
                  <span className="max-w-56 truncate">{logo.name}</span>
                  <button
                    type="button"
                    aria-label="Remove selected logo"
                    onClick={() => setLogo(null)}
                    className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  >
                    <X size={15} />
                  </button>
                </span>
              )}
            </div>
            <input
              id="organization-logo"
              className="sr-only"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={(event) => {
                setLogo(event.target.files?.[0] || null);
                setError("");
              }}
            />
            <p className="mt-1.5 text-xs text-slate-500">
              JPG, PNG, WebP or GIF, up to 5 MB.
            </p>
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              className="input min-h-28"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this organization use Connectora for?"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            disabled={busy || !name.trim()}
            onClick={create}
            className="btn-primary"
          >
            {busy ? "Creating…" : "Create organization"}
          </button>
        </div>
      </div>
    </main>
  );
}
