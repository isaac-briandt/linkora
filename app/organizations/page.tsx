import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import OrganizationCard from "./organization-card";
export default async function OrganizationsPage() {
  const s = await createClient();
  const {
    data: { user },
  } = await s.auth.getUser();
  if (!user) redirect("/login");
  const { data: members } = await s
    .from("organization_members")
    .select(
      "organization_id,role,organizations(id,name,slug,type,description,logo_url,created_by)",
    )
    .eq("profile_id", user.id);
  return (
    <main className="min-h-screen py-10">
      <div className="container-page">
        <Link
          href="/dashboard"
          className="text-sm font-semibold text-coral-600"
        >
          ← Dashboard
        </Link>
        <div className="mt-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-coral-600">
              ORGANIZATIONS
            </p>
            <h1 className="mt-1 text-4xl font-black">Your organizations</h1>
            <p className="mt-2 text-slate-500">
              Companies, schools, restaurants, hotels, events and communities
              managed in one place.
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/ai" className="btn-secondary gap-2">
              <Sparkles size={16} /> AI
            </Link>
            <Link href="/organizations/new" className="btn-primary gap-2">
              <Plus size={16} /> Create organization
            </Link>
          </div>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {members?.length ? (
            members.map((m: any) => {
              const organization = Array.isArray(m.organizations)
                ? m.organizations[0]
                : m.organizations;
              if (!organization) return null;
              return (
                <OrganizationCard
                  key={m.organization_id}
                  organization={organization}
                  role={m.role}
                  canDelete={organization.created_by === user.id}
                />
              );
            })
          ) : (
            <div className="card p-8 lg:col-span-3">
              <h2 className="text-xl font-bold">No organizations yet</h2>
              <p className="mt-2 text-slate-500">
                Create your first company, school, restaurant, hotel or event
                workspace.
              </p>
              <Link href="/organizations/new" className="btn-primary mt-5">
                Create organization
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
