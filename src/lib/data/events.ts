import "server-only";
import { demoEvents } from "../demo";
import { isSupabaseConfigured } from "../supabase/config";
import { createPublicClient } from "../supabase/public";
import { createClient } from "../supabase/server";
import type { ClubEvent, EventRegistration } from "../types";

export async function listEvents({ upcoming, limit = 50 }: { upcoming: boolean; limit?: number }) {
  const now = new Date().toISOString();

  if (!isSupabaseConfigured) {
    return demoEvents
      .filter((event) => (upcoming ? event.starts_at >= now : event.starts_at < now))
      .sort((a, b) => (upcoming ? 1 : -1) * a.starts_at.localeCompare(b.starts_at))
      .slice(0, limit);
  }

  let query = createPublicClient().from("events").select("*").eq("status", "published");
  query = upcoming
    ? query.gte("starts_at", now).order("starts_at", { ascending: true })
    : query.lt("starts_at", now).order("starts_at", { ascending: false });
  const { data, error } = await query.limit(limit);
  if (error) throw error;
  return (data ?? []) as ClubEvent[];
}

export async function getEventBySlug(slug: string) {
  if (!isSupabaseConfigured) return demoEvents.find((event) => event.slug === slug) ?? null;

  const { data, error } = await createPublicClient().from("events").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data as ClubEvent | null;
}

// Inscriptions à venir du membre connecté (espace membre, rendu à chaque visite).
export async function listMyRegistrations(profileId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("event_registrations")
    .select("status, events!inner(*)")
    .eq("profile_id", profileId)
    .neq("status", "cancelled")
    .gte("events.starts_at", new Date().toISOString())
    .order("created_at", { ascending: false });
  return ((data ?? []) as unknown as { status: EventRegistration["status"]; events: ClubEvent }[]).sort((a, b) =>
    a.events.starts_at.localeCompare(b.events.starts_at),
  );
}
