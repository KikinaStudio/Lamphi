import type { Metadata } from "next";
import Link from "next/link";
import { EventCard } from "@/components/event-card";
import { PostGrid } from "@/components/post-card";
import { EmptyState, SectionHeading } from "@/components/ui";
import { requireMember } from "@/lib/auth";
import { eventPath } from "@/lib/content";
import { listEvents, listMyRegistrations } from "@/lib/data/events";
import { countMembers } from "@/lib/data/members";
import { listRecentPosts } from "@/lib/data/posts";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Espace membre", robots: { index: false } };

export default async function MemberHomePage() {
  const { profile } = await requireMember("/espace-membre");
  const [registrations, upcoming, posts, memberCount] = await Promise.all([
    listMyRegistrations(profile.id),
    listEvents({ upcoming: true, limit: 4 }),
    listRecentPosts(3),
    countMembers(),
  ]);

  const registeredIds = new Set(registrations.map((registration) => registration.events.id));
  const otherEvents = upcoming.filter((event) => !registeredIds.has(event.id));
  const profileIncomplete = !profile.photo_url || !profile.job_title || !profile.company || !profile.bio;

  return (
    <>
      <section className="border-b border-line">
        <div className="container-page py-12">
          <p className="eyebrow">Espace membre</p>
          <h1 className="mt-3 text-4xl sm:text-5xl">Bonjour {profile.first_name}</h1>
          <p className="mt-3 text-muted">
            Bienvenue dans votre espace. {memberCount > 0 && `${memberCount} membres font aujourd'hui partie du club.`}
          </p>
          {profileIncomplete && (
            <div className="mt-6 flex flex-col gap-3 rounded-xl bg-accent-soft px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-ink-soft">
                Complétez votre profil (photo, fonction, biographie) pour que les autres membres puissent vous retrouver
                dans l&apos;annuaire.
              </p>
              <Link href="/espace-membre/profil" className="btn btn-primary btn-sm shrink-0">
                Compléter mon profil
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="container-page grid gap-6 py-10 sm:grid-cols-3">
        <Shortcut href="/annuaire-des-membres" title="Annuaire des membres" text="Retrouvez les dirigeants du club." />
        <Shortcut href="/evenements-de-amphi" title="Dîners & soirées" text="Inscrivez-vous aux prochains rendez-vous." />
        <Shortcut href="/espace-membre/profil" title="Mon profil" text="Photo, coordonnées, visibilité." />
      </section>

      <section className="container-page pb-14">
        <SectionHeading title="Mes inscriptions" />
        {registrations.length > 0 ? (
          <ul className="divide-y divide-line rounded-xl border border-line bg-surface">
            {registrations.map(({ status, events: event }) => (
              <li key={event.id}>
                <Link href={eventPath(event)} className="flex flex-col gap-1 px-5 py-4 hover:bg-paper sm:flex-row sm:items-center sm:justify-between">
                  <span>
                    <span className="block font-serif text-lg">{event.title}</span>
                    <span className="text-sm text-muted first-letter:uppercase">{formatDateTime(event.starts_at)}</span>
                  </span>
                  <span className={`badge ${status === "registered" ? "bg-success/10 text-success" : "bg-accent-soft text-accent-strong"}`}>
                    {status === "registered" ? "Inscrit(e)" : "Liste d'attente"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState>Vous n&apos;êtes inscrit(e) à aucun événement à venir.</EmptyState>
        )}
      </section>

      {otherEvents.length > 0 && (
        <section className="border-t border-line bg-surface py-14">
          <div className="container-page">
            <SectionHeading title="Prochains événements" href="/evenements-de-amphi" />
            <div className="grid gap-6 lg:grid-cols-2">
              {otherEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        </section>
      )}

      {posts.length > 0 && (
        <section className="container-page py-14">
          <SectionHeading title="Dernières publications" href="/decryptage-list" />
          <PostGrid posts={posts} />
        </section>
      )}
    </>
  );
}

function Shortcut({ href, title, text }: { href: string; title: string; text: string }) {
  return (
    <Link href={href} className="card group p-6 transition hover:border-accent">
      <h2 className="text-xl group-hover:text-accent-strong">{title}</h2>
      <p className="mt-1 text-sm text-muted">{text}</p>
    </Link>
  );
}
