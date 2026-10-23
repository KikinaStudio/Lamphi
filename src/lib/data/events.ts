import "server-only";
import { demoEvents } from "../demo";
import { isSupabaseConfigured } from "../supabase/config";
import { createClient } from "../supabase/server";
import type { ClubEvent, EventPhoto, EventRegistration } from "../types";

export async function listEvents({ upcoming, limit = 50 }: { upcoming: boolean; limit?: number }) {
  const now = new Date().toISOString();

  if (!isSupabaseConfigured) {
    return demoEvents
      .filter((event) => (upcoming ? event.starts_at >= now : event.starts_at < now))
      .sort((a, b) => (upcoming ? 1 : -1) * a.starts_at.localeCompare(b.starts_at))
      .slice(0, limit);
  }

  const supabase = await createClient();
  let query = supabase.from("events").select("*").eq("status", "published");
  query = upcoming
    ? query.gte("starts_at", now).order("starts_at", { ascending: true })
    : query.lt("starts_at", now).order("starts_at", { ascending: false });
  const { data, error } = await query.limit(limit);
  if (error) throw error;
  return (data ?? []) as ClubEvent[];
}

export async function getEventBySlug(slug: string) {
  if (!isSupabaseConfigured) return demoEvents.find((event) => event.slug === slug) ?? null;

  const supabase = await createClient();
  const { data } = await supabase.from("events").select("*").eq("slug", slug).maybeSingle();
  return data as ClubEvent | null;
}

export async function getSeatsLeft(eventId: string) {
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const { data } = await supabase.rpc("event_seats_left", { p_event_id: eventId });
  return (data as number | null) ?? null;
}

// Inscription du membre connecté (la RLS ne renvoie que la sienne).
export async function getMyRegistration(eventId: string, profileId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("event_registrations")
    .select("*")
    .eq("event_id", eventId)
    .eq("profile_id", profileId)
    .maybeSingle();
  return data as EventRegistration | null;
}

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

// Galerie : la RLS ne renvoie rien aux non-membres.
export async function listEventPhotos(eventId: string) {
  if (!isSupabaseConfigured) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("event_photos")
    .select("*")
    .eq("event_id", eventId)
    .order("position")
    .order("created_at");
  return (data ?? []) as EventPhoto[];
}
