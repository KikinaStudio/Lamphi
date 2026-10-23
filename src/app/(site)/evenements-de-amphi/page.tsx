import type { Metadata } from "next";
import { EventCard } from "@/components/event-card";
import { EmptyState, PageHeader, SectionHeading } from "@/components/ui";
import { listEvents } from "@/lib/data/events";

export const metadata: Metadata = {
  title: "Les événements de l'Amphi",
  description: "Dîners-débats et soirées thématiques réservés en priorité aux membres de L'Amphi.",
};

export default async function EventsPage() {
  const [upcoming, past] = await Promise.all([listEvents({ upcoming: true }), listEvents({ upcoming: false, limit: 12 })]);

  return (
    <>
      <PageHeader
        eyebrow="Agenda du club"
        title="Les événements de l'Amphi"
        intro="Dîners-débats, soirées thématiques et rencontres exclusives. Les inscriptions sont réservées en priorité aux membres : quatre dîners sont inclus dans l'adhésion."
      />
      <section className="container-page py-14">
        <SectionHeading title="À venir" />
        {upcoming.length > 0 ? (
          <div className="grid gap-6 lg:grid-cols-2">
            {upcoming.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <EmptyState>Les prochains rendez-vous seront annoncés très bientôt.</EmptyState>
        )}
      </section>
      {past.length > 0 && (
        <section className="border-t border-line bg-surface py-14">
          <div className="container-page">
            <SectionHeading title="Ils ont eu lieu" />
            <div className="grid gap-6 lg:grid-cols-2">
              {past.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
