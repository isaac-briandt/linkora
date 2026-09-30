import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://connectora.io";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    {
      url: new URL("/", siteUrl).toString(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: new URL("/contact", siteUrl).toString(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return entries;

  const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);
  const [{ data: profiles }, { data: menus }] = await Promise.all([
    supabase.from("profiles").select("username").limit(50000),
    supabase
      .from("menus")
      .select("slug,menu_external_url")
      .eq("active", true)
      .limit(50000),
  ]);

  for (const profile of profiles || []) {
    if (!profile.username) continue;
    entries.push({
      url: new URL(`/u/${encodeURIComponent(profile.username)}`, siteUrl).toString(),
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  for (const menu of menus || []) {
    if (!menu.slug || menu.menu_external_url) continue;
    entries.push({
      url: new URL(`/m/${encodeURIComponent(menu.slug)}`, siteUrl).toString(),
      changeFrequency: "weekly",
      priority: 0.6,
    });
  }

  return entries;
}
