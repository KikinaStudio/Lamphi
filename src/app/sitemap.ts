import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { eventPath, postPath } from "@/lib/content";
import { isSupabaseConfigured, supabasePublishableKey, supabaseUrl } from "@/lib/supabase/config";
import { getSiteUrl } from "@/lib/site-url";
import type { ClubEvent, PostTeaser } from "@/lib/types";

// Régénéré au plus toutes les heures.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const staticPages = ["", "/le-club", "/a-propos", "/devenir-membre", "/decryptage-list", "/la-plume", "/videos-club-list", "/evenements-de-amphi"];
  const entries: MetadataRoute.Sitemap = staticPages.map((path) => ({ url: `${base}${path}` }));

  if (!isSupabaseConfigured) return entries;

  // Client anonyme sans cookies : uniquement ce qui est public.
  const supabase = createClient(supabaseUrl, supabasePublishableKey, { auth: { persistSession: false } });
  const [{ data: posts }, { data: events }] = await Promise.all([
    supabase.from("post_teasers").select("slug, category, published_at"),
    supabase.from("events").select("slug, updated_at"),
  ]);

  for (const post of (posts ?? []) as Pick<PostTeaser, "slug" | "category" | "published_at">[]) {
    entries.push({ url: `${base}${postPath(post)}`, lastModified: post.published_at ?? undefined });
  }
  for (const event of (events ?? []) as Pick<ClubEvent, "slug" | "updated_at">[]) {
    entries.push({ url: `${base}${eventPath(event)}`, lastModified: event.updated_at });
  }
  return entries;
}
