import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { requireAdmin } from "@/lib/auth";
import { eventPath } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { ClubEvent, EventPhoto, EventRegistration, Profile } from "@/lib/types";
import { AdminHeader, BackLink, StatusBadge } from "../../ui";
import { deleteEvent, deleteEventPhoto, setRegistrationStatus } from "../actions";
import { EventForm } from "../event-form";
import { PhotoUploader } from "./photo-uploader";

export const metadata: Metadata = { title: "Modifier l'événement" };

type RegistrationRow = EventRegistration & {
  profiles: Pick<Profile, "first_name" | "last_name" | "email" | "company" | "job_title"> | null;
};

const STATUS_LABELS = { registered: "Inscrit", waitlist: "Liste d'attente", cancelled: "Annulé" } as const;

export default async function EditEventPage({ params, searchParams }: PageProps<"/admin/evenements/[id]">) {
  const { id } = await params;
  await requireAdmin(`/admin/evenements/${id}`);
  const justCreated = (await searchParams).enregistre === "1";

  const supabase = await createClient();
  const [{ data: eventData }, { data: registrationsData }, { data: photosData }] = await Promise.all([
    supabase.from("events").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("event_registrations")
      .select("*, profiles(first_name, last_name, email, company, job_title)")
      .eq("event_id", id)
      .order("created_at"),
    supabase.from("event_photos").select("*").eq("event_id", id).order("position").order("created_at"),
  ]);
  const event = eventData as ClubEvent | null;
  if (!event) notFound();
  const registrations = (registrationsData ?? []) as RegistrationRow[];
  const photos = (photosData ?? []) as EventPhoto[];
  const registeredCount = registrations.filter((row) => row.status === "registered").length;

  return (
    <>
      <BackLink href="/admin/evenements">Événements</BackLink>
      <AdminHeader
        title={event.title}
        actions={
          <>
            <Link href={eventPath(event)} target="_blank" className="btn btn-outline btn-sm">
              Voir la page ↗
            </Link>
            <ConfirmButton action={deleteEvent.bind(null, event.id)} message="Supprimer cet événement, ses inscriptions et ses photos ?">
              Supprimer
            </ConfirmButton>
          </>
        }
      />
      {justCreated && <p className="mb-6 rounded-lg bg-success/10 px-4 py-3 text-sm text-success">Événement créé.</p>}

      <EventForm event={event} />

      <section className="mt-12">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-2xl">
            Inscriptions{" "}
            <span className="text-base text-muted">
              ({registeredCount}
              {event.capacity ? ` / ${event.capacity}` : ""} confirmées)
            </span>
          </h2>
          {registrations.length > 0 && (
            <a href={`/admin/evenements/${event.id}/inscriptions`} className="btn btn-outline btn-sm">
              Exporter (Excel / CSV)
            </a>
          )}
        </div>
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[44rem] text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-5 py-3 font-semibold">Membre</th>
                <th className="px-5 py-3 font-semibold">Message</th>
                <th className="px-5 py-3 font-semibold">Date</th>
                <th className="px-5 py-3 font-semibold">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {registrations.map((registration) => (
                <tr key={registration.id}>
                  <td className="px-5 py-3">
                    <Link href={`/admin/membres/${registration.profile_id}`} className="font-semibold hover:text-accent-strong">
                      {registration.profiles ? `${registration.profiles.first_name} ${registration.profiles.last_name}` : "—"}
                    </Link>
                    <span className="block text-xs text-muted">{registration.profiles?.company}</span>
                  </td>
                  <td className="px-5 py-3 text-ink-soft">{registration.note}</td>
                  <td className="px-5 py-3 text-muted">{formatDate(registration.created_at)}</td>
                  <td className="px-5 py-3">
                    <form action={setRegistrationStatus.bind(null, registration.id, event.id)} className="flex items-center gap-2">
                      <StatusBadge tone={registration.status === "registered" ? "success" : registration.status === "waitlist" ? "warning" : "muted"}>
                        {STATUS_LABELS[registration.status]}
                      </StatusBadge>
                      <select name="status" defaultValue={registration.status} className="field-input !w-auto !py-1 text-xs" aria-label="Changer le statut">
                        {Object.entries(STATUS_LABELS).map(([key, label]) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        ))}
                      </select>
                      <button type="submit" className="text-xs font-semibold text-accent-strong hover:underline">
                        OK
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {registrations.length === 0 && <p className="px-5 py-8 text-center text-muted">Aucune inscription pour le moment.</p>}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl">Galerie photos</h2>
        <p className="mt-1 text-sm text-muted">Visible uniquement par les membres connectés, sur la page de l&apos;événement.</p>
        <div className="mt-4">
          <PhotoUploader eventId={event.id} />
        </div>
        {photos.length > 0 && (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {photos.map((photo) => (
              <figure key={photo.id} className="group relative aspect-square overflow-hidden rounded-lg bg-line">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.url} alt="" className="h-full w-full object-cover" />
                <ConfirmButton
                  action={deleteEventPhoto.bind(null, photo.id, event.id)}
                  message="Retirer cette photo de la galerie ?"
                  className="absolute right-2 top-2 rounded-full bg-ink/80 px-2.5 py-1 text-xs text-paper opacity-0 transition group-hover:opacity-100 focus:opacity-100"
                >
                  Retirer
                </ConfirmButton>
              </figure>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
