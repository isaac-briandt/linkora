"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Building2, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";

type Organization = {
  id: string;
  name: string;
  type: string;
  description: string | null;
  logo_url: string | null;
  created_by: string | null;
};

export default function OrganizationCard({
  organization,
  role,
  canDelete,
}: {
  organization: Organization;
  role: string;
  canDelete: boolean;
}) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function deleteOrganization() {
    const confirmed = window.confirm(
      `Delete “${organization.name}”? This permanently removes its people, menus, attendance records, and events. Its assigned cards will be unlinked. This cannot be undone.`,
    );
    if (!confirmed) return;

    setDeleting(true);
    setError("");
    const client = createClient();
    const { data, error: deleteError } = await client
      .from("organizations")
      .delete()
      .eq("id", organization.id)
      .select("id");

    if (deleteError || !data?.length) {
      setError(
        deleteError?.message ||
          "You do not have permission to delete this organization.",
      );
      setDeleting(false);
      return;
    }

    // Logos uploaded through organization creation live in this owner's folder.
    if (organization.logo_url) {
      try {
        const url = new URL(organization.logo_url);
        const marker = "/storage/v1/object/public/profile-media/";
        const markerIndex = url.pathname.indexOf(marker);
        if (markerIndex >= 0) {
          const storagePath = decodeURIComponent(
            url.pathname.slice(markerIndex + marker.length),
          );
          await client.storage.from("profile-media").remove([storagePath]);
        }
      } catch {
        // The organization is already deleted; an invalid logo URL is ignored.
      }
    }

    router.refresh();
  }

  return (
    <article className="card flex flex-col p-6 transition hover:-translate-y-0.5">
      <Link
        href={`/organization/${organization.id}`}
        className="flex-1 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-coral-500"
      >
        <div className="flex items-start justify-between gap-3">
          {organization.logo_url ? (
            <Image
              src={organization.logo_url}
              alt={`${organization.name} logo`}
              width={56}
              height={56}
              unoptimized
              className="h-14 w-14 rounded-xl border border-slate-200 bg-white object-contain p-1"
            />
          ) : (
            <div className="rounded-xl bg-coral-50 p-3 text-coral-700">
              <Building2 />
            </div>
          )}
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold">
            {role}
          </span>
        </div>
        <h2 className="mt-5 text-xl font-black">{organization.name}</h2>
        <p className="mt-1 text-xs font-bold uppercase tracking-wider text-coral-600">
          {organization.type}
        </p>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">
          {organization.description ||
            "Organization workspace powered by Connectora."}
        </p>
        <div className="mt-5 flex items-center gap-2 text-sm font-bold text-coral-600">
          Open workspace <ArrowRight size={15} />
        </div>
      </Link>
      {canDelete && (
        <div className="mt-4 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={deleteOrganization}
            disabled={deleting}
            className="btn-secondary gap-2 text-red-700 hover:bg-red-50 disabled:opacity-50"
          >
            <Trash2 size={15} />{" "}
            {deleting ? "Deleting…" : "Delete organization"}
          </button>
          {error && (
            <p role="alert" className="mt-2 text-sm text-red-600">
              {error}
            </p>
          )}
        </div>
      )}
    </article>
  );
}
