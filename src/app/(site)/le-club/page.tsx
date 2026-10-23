import type { Metadata } from "next";
import Link from "next/link";
import { EventCard } from "@/components/event-card";
import { PageHeader, SectionHeading } from "@/components/ui";
import { benefits, eligibility } from "@/content/site";
import { listEvents } from "@/lib/data/events";

// Page en cache, régénérée au plus toutes les 5 minutes et dès qu'un contenu change dans le back-office.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Le Club",
  description: "Un réseau de personnalités influentes du secteur de la santé : dîners, rencontres et échanges stratégiques.",
};

export default async function ClubPage() {
  const events = await listEvents({ upcoming: true, limit: 4 });

  return (
    <>
      <PageHeader
        eyebrow="Le Club"
        title="Un réseau de personnalités influentes du secteur de la santé"
        intro="L'Amphi rassemble une communauté restreinte et prestigieuse, composée exclusivement de dirigeants influents. Un lieu pour créer des passerelles et réfléchir ensemble aux solutions de demain."
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/devenir-membre" className="btn btn-accent">
            Demander une adhésion
          </Link>
          <Link href="/a-propos" className="btn btn-outline">
            Notre histoire
          </Link>
        </div>
      </PageHeader>

      <section className="container-page py-16">
        <SectionHeading eyebrow="Avantages" title="L'adhésion comprend" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit, index) => (
            <div key={benefit.title} className="card p-7">
              <span className="font-serif text-3xl text-accent">{String(index + 1).padStart(2, "0")}</span>
              <h3 className="mt-3 text-xl">{benefit.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{benefit.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-surface py-16">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_2fr]">
          <div>
            <p className="eyebrow">Qui peut nous rejoindre ?</p>
            <h2 className="mt-3 text-3xl">Les décideurs de la santé</h2>
            <p className="mt-4 leading-relaxed text-muted">{eligibility.intro}</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {eligibility.groups.map((group) => (
              <div key={group.title}>
                <h3 className="text-xl">{group.title}</h3>
                <ul className="mt-3 space-y-2 text-sm text-ink-soft">
                  {group.items.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <SectionHeading eyebrow="Agenda" title="Les événements de l'Amphi" href="/evenements-de-amphi" />
        {events.length > 0 ? (
          <div className="grid gap-6 lg:grid-cols-2">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <p className="text-muted">Les prochains rendez-vous seront annoncés très bientôt.</p>
        )}
      </section>
    </>
  );
}
