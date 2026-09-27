"use client";

import { ChangeEvent, useState } from "react";
import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";

const fields = [
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
] as const;

type Person = Record<string, any>;
type Card = {
  id: string;
  card_uid: string;
  label: string | null;
  status: string;
  person_id: string | null;
};
export default function PersonProfileForm({
  person,
  organizationId,
  initialCards,
}: {
  person: Person;
  organizationId: string;
  initialCards: Card[];
}) {
  const [form, setForm] = useState<Person>(person);
  const [links, setLinks] = useState<{ title: string; url: string }[]>(
    person.link_items || [],
  );
  const [cards, setCards] = useState(initialCards);
  const [cardId, setCardId] = useState("");
  const [saving, setSaving] = useState(false);
  const [cardBusy, setCardBusy] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  function set(key: string, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }
  async function save() {
    setSaving(true);
    setMessage("");
    const editable = Object.fromEntries(
      fields.map(([key]) => [key, form[key] || null]),
    );
    editable.full_name = form.full_name || "";
    editable.avatar_url = form.avatar_url || null;
    editable.cover_image_url = form.cover_image_url || null;
    editable.link_items = links.filter(
      (link) => link.title.trim() && link.url.trim(),
    );
    const { error } = await createClient()
      .from("people")
      .update(editable)
      .eq("id", person.id)
      .eq("organization_id", organizationId);
    setMessage(error ? error.message : "Profile saved successfully.");
    setSaving(false);
  }
  async function assignCard() {
    if (!cardId) return;
    setCardBusy(true);
    setMessage("");
    const { error } = await createClient()
      .from("nfc_cards")
      .update({
        person_id: person.id,
        profile_id: person.profile_id || null,
        destination_type: "profile",
      })
      .eq("id", cardId)
      .eq("organization_id", organizationId);
    if (error) setMessage(error.message);
    else {
      setCards((current) =>
        current.map((card) =>
          card.id === cardId ? { ...card, person_id: person.id } : card,
        ),
      );
      setCardId("");
      setMessage("Card assigned.");
    }
    setCardBusy(false);
  }
  async function unassignCard(card: Card) {
    setCardBusy(true);
    setMessage("");
    const { error } = await createClient()
      .from("nfc_cards")
      .update({
        person_id: null,
        profile_id: null,
        destination_type: "organization",
      })
      .eq("id", card.id)
      .eq("organization_id", organizationId);
    if (error) setMessage(error.message);
    else {
      setCards((current) =>
        current.map((item) =>
          item.id === card.id ? { ...item, person_id: null } : item,
        ),
      );
      setMessage("Card unassigned.");
    }
    setCardBusy(false);
  }
  async function uploadImage(
    field: "avatar_url" | "cover_image_url",
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/"))
      return setMessage("Please choose an image file.");
    if (file.size > 5 * 1024 * 1024)
      return setMessage("Images must be 5 MB or smaller.");
    setUploading(field);
    setMessage("");
    const {
      data: { user },
    } = await createClient().auth.getUser();
    if (!user) {
      setMessage("Please log in again before uploading an image.");
      setUploading(null);
      return;
    }
    const extension =
      file.name
        .split(".")
        .pop()
        ?.replace(/[^a-z0-9]/gi, "") || "jpg";
    const path = `${user.id}/organization-people/${person.id}/${field}-${Date.now()}.${extension}`;
    const storage = createClient().storage.from("profile-media");
    const { error } = await storage.upload(path, file, {
      contentType: file.type,
      upsert: false,
    });
    if (error) setMessage(error.message);
    else {
      const { data } = storage.getPublicUrl(path);
      set(field, data.publicUrl);
      setMessage("Image uploaded. Save changes to publish it.");
    }
    setUploading(null);
  }
  const publicPath = `/p/${form.username || form.id}`;
  return (
    <main className="min-h-screen py-10">
      <div className="container-page">
        <Link
          href={`/organization/${organizationId}/people`}
          className="text-sm font-semibold text-coral-600"
        >
          ← People
        </Link>
        <div className="mt-5 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-coral-600">
              ORGANIZATION PROFILE
            </p>
            <h1 className="mt-1 text-3xl font-black">
              {form.full_name || "Edit profile"}
            </h1>
            <p className="mt-2 text-slate-500">
              Complete this person’s Connectora identity and card destination.
            </p>
          </div>
          <Link href={publicPath} target="_blank" className="btn-secondary">
            Preview profile
          </Link>
        </div>
        <div className="mt-8 card p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            {fields.map(([key, label, type]) => (
              <div className={key === "bio" ? "sm:col-span-2" : ""} key={key}>
                <label className="label">{label}</label>
                {type === "textarea" ? (
                  <textarea
                    className="input min-h-28"
                    value={String(form[key] || "")}
                    onChange={(event) => set(key, event.target.value)}
                  />
                ) : (
                  <input
                    className="input"
                    type={type}
                    value={String(form[key] || "")}
                    onChange={(event) => set(key, event.target.value)}
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
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <button onClick={save} disabled={saving} className="btn-primary">
              {saving ? "Saving…" : "Save profile"}
            </button>
            {message && (
              <span className="text-sm text-slate-600">{message}</span>
            )}
          </div>
          <div className="mt-8 border-t pt-6">
            <h2 className="text-xl font-bold">Featured links</h2>
            <p className="mt-1 text-sm text-slate-500">
              Add the links this person wants to share first.
            </p>
            <div className="mt-4 space-y-3">
              {links.map((link, index) => (
                <div
                  key={index}
                  className="grid gap-3 sm:grid-cols-[.8fr_1.2fr_auto]"
                >
                  <input
                    className="input"
                    value={link.title}
                    placeholder="Button title"
                    onChange={(event) =>
                      setLinks((current) =>
                        current.map((item, i) =>
                          i === index
                            ? { ...item, title: event.target.value }
                            : item,
                        ),
                      )
                    }
                  />
                  <input
                    className="input"
                    value={link.url}
                    placeholder="https://example.com"
                    onChange={(event) =>
                      setLinks((current) =>
                        current.map((item, i) =>
                          i === index
                            ? { ...item, url: event.target.value }
                            : item,
                        ),
                      )
                    }
                  />
                  <button
                    type="button"
                    className="text-sm font-semibold text-red-600"
                    onClick={() =>
                      setLinks((current) =>
                        current.filter((_, i) => i !== index),
                      )
                    }
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="btn-secondary mt-4"
              onClick={() =>
                setLinks((current) => [...current, { title: "", url: "" }])
              }
            >
              Add link
            </button>
          </div>
        </div>
        <section className="mt-6 card p-6">
          <h2 className="text-xl font-bold">Cards</h2>
          <p className="mt-1 text-sm text-slate-500">
            Assign or remove cards for {form.full_name || "this person"}.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <select
              className="input"
              value={cardId}
              onChange={(event) => setCardId(event.target.value)}
            >
              <option value="">Select an available card</option>
              {cards
                .filter(
                  (card) => !card.person_id || card.person_id === person.id,
                )
                .map((card) => (
                  <option key={card.id} value={card.id}>
                    {card.label || card.card_uid}
                    {card.person_id === person.id ? " (assigned)" : ""}
                  </option>
                ))}
            </select>
            <button
              onClick={assignCard}
              disabled={cardBusy || !cardId}
              className="btn-primary whitespace-nowrap disabled:opacity-50"
            >
              {cardBusy ? "Saving…" : "Assign card"}
            </button>
          </div>
          <div className="mt-4 space-y-2">
            {cards
              .filter((card) => card.person_id === person.id)
              .map((card) => (
                <div
                  key={card.id}
                  className="flex items-center justify-between rounded-xl border p-3"
                >
                  <div>
                    <p className="font-semibold">
                      {card.label || card.card_uid}
                    </p>
                    <p className="text-xs text-slate-500">
                      {card.card_uid} · {card.status}
                    </p>
                  </div>
                  <button
                    onClick={() => unassignCard(card)}
                    disabled={cardBusy}
                    className="text-sm font-semibold text-red-600 disabled:opacity-50"
                  >
                    Unassign
                  </button>
                </div>
              ))}
            {!cards.some((card) => card.person_id === person.id) && (
              <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                No cards assigned yet.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function ImageField({
  label,
  value,
  uploading,
  onChange,
  onUpload,
}: {
  label: string;
  value: string;
  uploading: boolean;
  onChange: (value: string) => void;
  onUpload: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <input
        className="input"
        type="url"
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Paste a public image URL"
      />
      <input
        className="mt-3 block w-full text-sm text-slate-600"
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        onChange={onUpload}
        disabled={uploading}
      />
      {uploading && (
        <p className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-coral-700">
          <LoaderCircle className="animate-spin" size={14} /> Uploading image…
        </p>
      )}
    </div>
  );
}
