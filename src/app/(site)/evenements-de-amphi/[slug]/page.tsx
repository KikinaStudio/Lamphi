import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarIcon, PinIcon } from "@/components/icons";
import { RichText } from "@/components/rich-text";
import { getViewer, isActiveMember } from "@/lib/auth";
import { decodeSlug, eventPath } from "@/lib/content";
import { getEventBySlug, getMyRegistration, getSeatsLeft, listEventPhotos } from "@/lib/data/events";
import { formatDateTime, formatTime } from "@/lib/format";
import { RegistrationBox } from "./registration-box";

export async function generateMetadata({ params }: PageProps<"/evenements-de-amphi/[slug]">): Promise<Metadata> {
  const event = await getEventBySlug(decodeSlug((await params).slug));
  if (!event) return {};
  return {
    title: event.title,
    description: event.excerpt ?? undefined,
    openGraph: { title: event.title, images: event.cover_url ? [event.cover_url] : undefined },
  };
}

export default async function EventPage({ params }: PageProps<"/evenements-de-amphi/[slug]">) {
  const event = await getEventBySlug(decodeSlug((await params).slug));
  if (!event) notFound();

  const viewer = await getViewer();
  const member = isActiveMember(viewer) ? viewer : null;
  const isPast = new Date(event.starts_at) < new Date();

  const [seatsLeft, registration, photos] = await Promise.all([
    getSeatsLeft(event.id),
    member ? getMyRegistration(event.id, member.userId) : null,
    member ? listEventPhotos(event.id) : [],
  ]);

  return (
    <article>
      <header className="bg-ink text-paper">
        <div className="container-page grid gap-10 py-14 sm:py-20 lg:grid-cols-[1.5fr_1fr] lg:items-end">
          <div>
            <Link href="/evenements-de-amphi" className="text-sm font-medium text-accent-soft hover:underline">
              ← Tous les événements
            </Link>
            <p className="eyebrow mt-8 !text-accent-soft">{isPast ? "Événement passé" : "Prochain dîner de l'Amphi"}</p>
            <h1 className="mt-4 text-4xl leading-tight sm:text-5xl">{event.title}</h1>
            {event.excerpt && <p className="mt-5 text-lg leading-relaxed text-paper/75">{event.excerpt}</p>}
          </div>
          <ul className="space-y-3 text-paper/85">
            <li className="flex items-start gap-3">
              <CalendarIcon />
              <span className="first-letter:uppercase">
                {formatDateTime(event.starts_at)}
                {event.ends_at && ` – ${formatTime(event.ends_at)}`}
              </span>
            </li>
            {(event.location || event.address) && (
              <li className="flex items-start gap-3">
                <PinIcon />
                <span>
                  {event.location}
                  {event.address && <span className="block text-sm text-paper/60">{event.address}</span>}
                </span>
              </li>
            )}
          </ul>
        </div>
      </header>

      <div className="container-page grid gap-12 py-14 lg:grid-cols-[1.5fr_1fr]">
        <div>
          {event.cover_url && (
            <div className="relative mb-10 aspect-[16/9] overflow-hidden rounded-2xl">
              <Image src={event.cover_url} alt="" fill sizes="(min-width: 1024px) 60vw, 100vw" className="object-cover" priority />
            </div>
          )}
          <RichText html={event.content_html} />

          {photos.length > 0 && (
            <section className="mt-14">
              <h2 className="text-3xl">Galerie photos</h2>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {photos.map((photo) => (
                  <a key={photo.id} href={photo.url} target="_blank" rel="noopener noreferrer" className="relative block aspect-square overflow-hidden rounded-lg">
                    <Image src={photo.url} alt={photo.caption ?? ""} fill sizes="(min-width: 640px) 33vw, 50vw" className="object-cover transition hover:scale-105" />
                  </a>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <RegistrationBox
            eventId={event.id}
            eventPath={eventPath(event)}
            isPast={isPast}
            registrationOpen={event.registration_open}
            seatsLeft={seatsLeft}
            isMember={Boolean(member)}
            status={registration?.status ?? null}
          />
        </aside>
      </div>
    </article>
  );
}
