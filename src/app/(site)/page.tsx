import Image from "next/image";
import Link from "next/link";
import { EventCard } from "@/components/event-card";
import { PostGrid } from "@/components/post-card";
import { SectionHeading } from "@/components/ui";
import { benefits, site, team } from "@/content/site";
import { listEvents } from "@/lib/data/events";
import { listPartners } from "@/lib/data/partners";
import { listRecentPosts } from "@/lib/data/posts";

export default async function HomePage() {
  const [events, decryptages, plume, actus, partners] = await Promise.all([
    listEvents({ upcoming: true, limit: 2 }),
    listRecentPosts(3, ["decryptage"]),
    listRecentPosts(3, ["tribune", "interview"]),
    listRecentPosts(3, ["actu"]),
    listPartners(),
  ]);

  return (
    <>
      {/* Accroche */}
      <section className="relative overflow-hidden bg-ink text-paper">
        <div
          aria-hidden
          className="absolute inset-0 opacity-30 [background:radial-gradient(60rem_30rem_at_85%_-10%,var(--color-accent),transparent_60%)]"
        />
        <div className="container-page relative py-24 sm:py-32">
          <p className="eyebrow !text-accent-soft">{site.tagline}</p>
          <h1 className="mt-5 max-w-4xl text-5xl leading-[1.05] sm:text-7xl">
            Là où les leaders de la santé se retrouvent.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-relaxed text-paper/75">{site.description}</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/devenir-membre" className="btn btn-accent">
              Demander une adhésion
            </Link>
            <Link href="/le-club" className="btn btn-outline text-paper">
              Découvrir le club
            </Link>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="container-page grid gap-10 py-20 md:grid-cols-2 md:gap-16">
        <div>
          <p className="eyebrow">Notre ambition</p>
          <h2 className="mt-3 text-3xl leading-tight sm:text-4xl">
            Décloisonner la santé pour construire un dialogue riche et impactant.
          </h2>
        </div>
        <div className="space-y-4 text-lg leading-relaxed text-ink-soft">
          <p>
            Industriels, assureurs, établissements, institutions, chercheurs et entrepreneurs : L&apos;Amphi réunit
            une communauté restreinte et prestigieuse, composée exclusivement de dirigeants influents du secteur.
          </p>
          <p>
            Au fil de dîners-débats et de rencontres exclusives, le club crée des passerelles et invite à penser
            ensemble les solutions de demain.
          </p>
        </div>
      </section>

      {/* Prochains événements */}
      <section className="border-t border-line bg-surface py-20">
        <div className="container-page">
          <SectionHeading eyebrow="Agenda du club" title="Les événements de l'Amphi" href="/evenements-de-amphi" />
          {events.length > 0 ? (
            <div className="grid gap-6 lg:grid-cols-2">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <p className="text-muted">Les prochains rendez-vous seront annoncés très bientôt.</p>
          )}
        </div>
      </section>

      {/* Décryptages */}
      {decryptages.length > 0 && (
        <section className="container-page py-20">
          <SectionHeading eyebrow="Analyses" title="Décryptages" href="/decryptage-list" />
          <PostGrid posts={decryptages} showCategory={false} />
        </section>
      )}

      {/* La Plume */}
      {plume.length > 0 && (
        <section className="border-t border-line py-20">
          <div className="container-page">
            <SectionHeading eyebrow="Tribunes & interviews" title="La Plume de l'Amphi" href="/la-plume" />
            <PostGrid posts={plume} />
          </div>
        </section>
      )}

      {/* Actus du club */}
      {actus.length > 0 && (
        <section className="bg-ink py-20 text-paper">
          <div className="container-page [&_h3]:text-paper [&_p]:text-paper/70">
            <SectionHeading eyebrow="En vidéo" title="Actus du club" href="/videos-club-list" />
            <PostGrid posts={actus} showCategory={false} />
          </div>
        </section>
      )}

      {/* Avantages */}
      <section className="container-page py-20">
        <SectionHeading eyebrow="Être membre" title="Ce que vous offre le club" href="/le-club" linkLabel="En savoir plus" />
        <div className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit) => (
            <div key={benefit.title} className="bg-surface p-7">
              <h3 className="text-xl">{benefit.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{benefit.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Partenaires */}
      {partners.length > 0 && (
        <section className="border-t border-line py-16">
          <div className="container-page">
            <p className="eyebrow text-center">Nos partenaires</p>
            <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-8">
              {partners.map((partner) => {
                const content = partner.logo_url ? (
                  <Image
                    src={partner.logo_url}
                    alt={partner.name}
                    width={160}
                    height={64}
                    className="h-12 w-auto object-contain opacity-80 grayscale transition hover:opacity-100 hover:grayscale-0"
                  />
                ) : (
                  <span className="font-serif text-lg text-ink-soft">{partner.name}</span>
                );
                return (
                  <li key={partner.id}>
                    {partner.website_url ? (
                      <a href={partner.website_url} target="_blank" rel="noopener noreferrer">
                        {content}
                      </a>
                    ) : (
                      content
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}

      {/* Équipe */}
      <section className="border-t border-line bg-surface py-20">
        <div className="container-page">
          <SectionHeading eyebrow="L'équipe" title="Ceux qui font l'Amphi" />
          <div className="grid gap-6 sm:grid-cols-3">
            {team.map((member) => (
              <div key={member.name} className="border-l-2 border-accent pl-5">
                <h3 className="text-2xl">{member.name}</h3>
                <p className="mt-1 text-sm font-semibold text-accent-strong">{member.role}</p>
                {member.detail && <p className="mt-2 text-sm text-muted">{member.detail}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <JoinBanner />
    </>
  );
}

function JoinBanner() {
  return (
    <section className="container-page py-20">
      <div className="rounded-3xl bg-accent-soft px-6 py-14 text-center sm:px-12">
        <h2 className="mx-auto max-w-2xl text-3xl sm:text-4xl">Rejoindre le cercle des décideurs de la santé</h2>
        <p className="mx-auto mt-4 max-w-xl text-ink-soft">
          Chaque candidature fait l&apos;objet d&apos;un examen attentif par un comité de sélection dédié.
        </p>
        <Link href="/devenir-membre" className="btn btn-primary mt-8">
          Demander une adhésion
        </Link>
      </div>
    </section>
  );
}
