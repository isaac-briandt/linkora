import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { Utensils } from "lucide-react";
import MenuAI from "./menu-ai";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const s = await createClient();
  const { data: menu } = await s
    .from("menus")
    .select("slug,name,description,menu_external_url,organizations(name)")
    .eq("slug", slug)
    .eq("active", true)
    .single();

  if (!menu) return { robots: { index: false, follow: false } };

  if (menu.menu_external_url) {
    try {
      const externalUrl = new URL(menu.menu_external_url);
      if (["http:", "https:"].includes(externalUrl.protocol)) {
        return { robots: { index: false, follow: false } };
      }
    } catch {
      // Invalid URLs do not redirect; the Connectora menu page remains public.
    }
  }

  const organization = menu.organizations as unknown as
    | { name: string }
    | { name: string }[]
    | null;
  const organizationName = Array.isArray(organization)
    ? organization[0]?.name
    : organization?.name;
  const title = organizationName
    ? `${menu.name} | ${organizationName}`
    : `${menu.name} | Digital Menu`;
  const description =
    menu.description?.replace(/\s+/g, " ").trim().slice(0, 160) ||
    `Explore the ${menu.name} digital menu${organizationName ? ` from ${organizationName}` : ""}, powered by Connectora.`;
  const canonical = `/m/${encodeURIComponent(menu.slug)}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical },
    twitter: { card: "summary", title, description },
  };
}

export default async function MenuPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const s = await createClient();
  const { data: menu } = await s
    .from("menus")
    .select("*, organizations(name,type)")
    .eq("slug", slug)
    .eq("active", true)
    .single();
  if (!menu) notFound();

  let externalUrl: URL | null = null;
  if (menu.menu_external_url) {
    try {
      const candidate = new URL(menu.menu_external_url);
      if (["http:", "https:"].includes(candidate.protocol))
        externalUrl = candidate;
    } catch {
      externalUrl = null;
    }
  }
  if (externalUrl) {
    await s.from("engagement_events").insert({
      event_type: "menu_view",
      organization_id: menu.organization_id,
      metadata: { menu_id: menu.id, source: "external_menu" },
    });
    redirect(externalUrl.toString());
  }

  const { data: sections } = await s
    .from("menu_sections")
    .select("*")
    .eq("menu_id", menu.id)
    .order("sort_order");
  const ids = (sections || []).map((section) => section.id);
  const { data: items } = ids.length
    ? await s
        .from("menu_items")
        .select("*")
        .in("section_id", ids)
        .eq("available", true)
        .order("sort_order")
    : { data: [] };
  await s.from("engagement_events").insert({
    event_type: "menu_view",
    organization_id: menu.organization_id,
    metadata: { menu_id: menu.id },
  });

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-coral-600 text-white">
            <Utensils />
          </div>
          <p className="mt-4 text-sm font-semibold uppercase tracking-wider text-coral-600">
            {menu.organizations?.name}
          </p>
          <h1 className="mt-1 text-4xl font-black">{menu.name}</h1>
          <p className="mt-3 text-slate-500">
            {menu.description || "Digital menu powered by Connectora."}
          </p>
        </div>
        {menu.menu_file_url && (
          <div className="card mt-8 overflow-hidden p-3">
            <a
              href={menu.menu_file_url}
              target="_blank"
              rel="noreferrer"
              className="btn-primary w-full"
            >
              Open uploaded menu
              {menu.menu_file_name ? ` · ${menu.menu_file_name}` : ""}
            </a>
            {menu.menu_file_url.match(/\.(png|jpe?g|webp)(\?|$)/i) && (
              <img
                src={menu.menu_file_url}
                alt={menu.menu_file_name || menu.name}
                className="mt-3 w-full rounded-xl"
              />
            )}
          </div>
        )}
        <MenuAI slug={slug} />
        <div className="mt-10 space-y-8">
          {sections?.map((section) => (
            <section key={section.id}>
              <h2 className="mb-3 text-xl font-black">{section.name}</h2>
              <div className="space-y-3">
                {items
                  ?.filter((item: any) => item.section_id === section.id)
                  .map((item: any) => (
                    <div
                      key={item.id}
                      className="card flex justify-between gap-4 p-5"
                    >
                      <div>
                        <h3 className="font-bold">{item.name}</h3>
                        <p className="mt-1 text-sm leading-6 text-slate-500">
                          {item.description || ""}
                        </p>
                      </div>
                      <div className="whitespace-nowrap font-black text-coral-700">
                        {item.price != null
                          ? `GH₵ ${Number(item.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                          : ""}
                      </div>
                    </div>
                  ))}
              </div>
            </section>
          ))}
        </div>
        <p className="mt-10 text-center text-xs text-slate-400">
          Powered by Connectora
        </p>
      </div>
    </main>
  );
}
