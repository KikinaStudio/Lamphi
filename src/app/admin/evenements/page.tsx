import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { ClubEvent } from "@/lib/types";
import { AdminHeader, StatusBadge } from "../ui";

export const metadata: Metadata = { title: "Événements" };

export default async function EventsAdminPage() {
  await requireAdmin("/admin/evenements");
  const supabase = await createClient();
  const [{ data: eventsData }, { data: registrationsData }] = await Promise.all([
    supabase.from("events").select("*").order("starts_at", { ascending: false }),
    supabase.from("event_registrations").select("event_id, status").neq("status", "cancelled"),
  ]);
  const events = (eventsData ?? []) as ClubEvent[];
  const registrations = (registrationsData ?? []) as { event_id: string; status: string }[];
  const now = new Date().toISOString();

  return (
    <>
      <AdminHeader
        title="Événements"
        description="Dîners et soirées de l'Amphi, avec inscriptions des membres."
        actions={
          <Link href="/admin/evenements/nouveau" className="btn btn-accent btn-sm">
            + Nouvel événement
          </Link>
        }
      />
      <div className="card divide-y divide-line">
        {events.map((event) => {
          const registered = registrations.filter((row) => row.event_id === event.id && row.status === "registered").length;
          const waitlist = registrations.filter((row) => row.event_id === event.id && row.status === "waitlist").length;
          return (
            <Link key={event.id} href={`/admin/evenements/${event.id}`} className="flex flex-col gap-2 px-5 py-4 hover:bg-paper sm:flex-row sm:items-center sm:justify-between">
              <span>
                <span className="block font-semibold">{event.title}</span>
                <span className="text-xs text-muted first-letter:uppercase">{formatDateTime(event.starts_at)}</span>
              </span>
              <span className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-ink-soft">
                  {registered}
                  {event.capacity ? ` / ${event.capacity}` : ""} inscrit{registered > 1 ? "s" : ""}
                  {waitlist > 0 && ` · ${waitlist} en attente`}
                </span>
                {event.status === "draft" ? (
                  <StatusBadge tone="warning">Brouillon</StatusBadge>
                ) : event.starts_at < now ? (
                  <StatusBadge tone="muted">Passé</StatusBadge>
                ) : (
                  <StatusBadge tone="success">Publié</StatusBadge>
                )}
              </span>
            </Link>
          );
        })}
        {events.length === 0 && <p className="px-5 py-10 text-center text-muted">Aucun événement pour le moment.</p>}
      </div>
    </>
  );
}
