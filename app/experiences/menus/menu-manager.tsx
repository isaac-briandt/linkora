"use client";
import { useEffect, useState } from "react";
import { Plus, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";
import MenuActions from "./menu-actions";

export default function MenuManager({ orgs }: { orgs: any[] }) {
  const [orgId, setOrgId] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [externalUrl, setExternalUrl] = useState("");
  const [menus, setMenus] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [loadingMenus, setLoadingMenus] = useState(true);
  async function loadMenus() {
    setLoadingMenus(true);
    const ids = orgs.map((org) => org.organization_id);
    if (!ids.length) {
      setMenus([]);
      setLoadingMenus(false);
      return;
    }
    const { data, error } = await createClient()
      .from("menus")
      .select("id,name,slug,active,created_at,menu_file_url,menu_file_name,menu_external_url,organizations(name)")
      .in("organization_id", ids)
      .order("created_at", { ascending: false });
    if (error) setMessage(error.message);
    else setMenus(data || []);
    setLoadingMenus(false);
  }
  useEffect(() => {
    loadMenus();
  }, []);
  async function create() {
    setMessage("");
    if (!orgId || !name.trim() || !slug.trim()) {
      setMessage("Select an organization and enter a menu name and slug.");
      return;
    }
    if (file && !file.type.startsWith("image/") && file.type !== "application/pdf") return setMessage("Upload a PDF or image menu.");
    if (file && file.size > 10 * 1024 * 1024) return setMessage("Menu files must be 10 MB or smaller.");
    const cleanExternalUrl = externalUrl.trim();
    if (file && cleanExternalUrl) return setMessage("Use either an uploaded menu or an external menu link, not both.");
    if (cleanExternalUrl) {
      try { const url = new URL(cleanExternalUrl); if (!["http:", "https:"].includes(url.protocol)) throw new Error(); }
      catch { return setMessage("Enter a complete http:// or https:// menu link."); }
    }
    setBusy(true);
    const cleanSlug = slug
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-");
    const client = createClient();
    const { error } = await client
      .from("menus")
      .insert({
        organization_id: orgId,
        name: name.trim(),
        slug: cleanSlug,
        description: "Published with Connectora",
        menu_external_url: cleanExternalUrl || null,
        active: true,
      });
    if (error) setMessage(error.message);
    else {
      if (file) {
        const { data: { user } } = await client.auth.getUser();
        if (user) {
          const { data: createdMenu } = await client.from("menus").select("id").eq("slug", cleanSlug).single();
          const path = `${user.id}/menus/${createdMenu?.id || cleanSlug}-${file.name.replace(/[^a-z0-9._-]/gi, "-")}`;
          const upload = await client.storage.from("profile-media").upload(path, file, { contentType: file.type, upsert: true });
          if (!upload.error) {
            const { data: publicUrl } = client.storage.from("profile-media").getPublicUrl(path);
            if (createdMenu?.id) await client.from("menus").update({ menu_file_url: publicUrl.publicUrl, menu_file_name: file.name }).eq("id", createdMenu.id);
          }
        }
      }
      setMessage(`Menu created. You can open it below at /m/${cleanSlug}.`);
      setName("");
      setSlug("");
      setFile(null);
      setExternalUrl("");
      await loadMenus();
    }
    setBusy(false);
  }
  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[380px_1fr]">
      <div className="card p-6">
        <h2 className="text-xl font-bold">Create menu</h2>
        <div className="mt-5 space-y-4">
          <div>
            <label className="label">Organization</label>
            <select
              className="input"
              value={orgId}
              onChange={(event) => setOrgId(event.target.value)}
            >
              <option value="">Select organization</option>
              {orgs.map((org) => (
                <option key={org.organization_id} value={org.organization_id}>
                  {org.organizations?.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Menu name</label>
            <input
              className="input"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Dinner Menu"
            />
          </div>
          <div>
            <label className="label">Upload menu <span className="font-normal text-slate-400">(optional PDF or image)</span></label>
            <input className="input" type="file" accept="application/pdf,image/png,image/jpeg,image/webp" onChange={(event) => setFile(event.target.files?.[0] || null)} />
            <p className="mt-1.5 text-xs text-slate-500">The file will be included on the public menu page.</p>
          </div>
          <div>
            <label className="label">Existing menu link <span className="font-normal text-slate-400">(optional)</span></label>
            <input className="input" type="url" value={externalUrl} onChange={(event) => setExternalUrl(event.target.value)} placeholder="https://yourrestaurant.com/menu" />
            <p className="mt-1.5 text-xs text-slate-500">Connectora will wrap this in your Connectora menu URL for QR codes and NFC cards.</p>
          </div>
          <div>
            <label className="label">Public slug</label>
            <input
              className="input"
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              placeholder="restaurant-dinner"
            />
          </div>
          {message && (
            <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
              {message}
            </p>
          )}
          <button
            onClick={create}
            disabled={busy}
            className="btn-primary gap-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={16} /> {busy ? "Creating…" : "Create menu"}
          </button>
        </div>
      </div>
      <div className="card p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">Your menus</h2>
            <p className="mt-1 text-sm text-slate-500">
              Open the public link for any menu you have created.
            </p>
          </div>
          <button
            onClick={loadMenus}
            disabled={loadingMenus}
            className="btn-secondary gap-2 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loadingMenus ? "animate-spin" : ""}
            />{" "}
            Refresh
          </button>
        </div>
        <div className="mt-5 space-y-3">
          {loadingMenus ? (
            <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
              Loading menus…
            </p>
          ) : menus.length ? (
            menus.map((menu) => (
              <div
                key={menu.id}
                className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-bold">{menu.name}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {menu.organizations?.name} · /m/{menu.slug}
                  </p>
                </div>
                <MenuActions slug={menu.slug} />
              </div>
            ))
          ) : (
            <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
              No menus created yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
