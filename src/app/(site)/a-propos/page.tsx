import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui";
import { site, team } from "@/content/site";

export const metadata: Metadata = {
  title: "À propos",
  description: site.description,
};

export default function AboutPage() {
  return (
    <>
      <PageHeader eyebrow="À propos" title="Un espace privé et confidentiel pour les acteurs de santé" intro={site.description} />

      <section className="container-page grid gap-12 py-16 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-5 text-lg leading-relaxed text-ink-soft">
          <p>
            Fondé par Fabien Guez, cardiologue, médecin du sport et journaliste santé, L&apos;Amphi a été dévoilé le{" "}
            {site.founded}, lors d&apos;une soirée de lancement réunissant les principaux décideurs du secteur.
          </p>
          <p>
            Sa conviction : la santé française est un archipel. Laboratoires, assureurs, établissements, institutions,
            chercheurs et entrepreneurs travaillent trop souvent en silo. L&apos;Amphi décloisonne ces mondes pour
            construire un dialogue riche et impactant entre ceux qui décident.
          </p>
          <p>
            Dîners-débats, rencontres exclusives, décryptages et prises de parole : le club offre à ses membres un cadre
            confidentiel pour échanger, débattre et faire avancer les grands enjeux de santé.
          </p>
        </div>
        <aside className="card h-fit p-7">
          <p className="eyebrow">Nous écrire</p>
          <a href={`mailto:${site.contactEmail}`} className="mt-3 block font-serif text-xl hover:text-accent-strong">
            {site.contactEmail}
          </a>
          <Link href="/devenir-membre" className="btn btn-accent mt-6 w-full">
            Devenir membre
          </Link>
        </aside>
      </section>

      <section className="border-t border-line bg-surface py-16">
        <div className="container-page">
          <p className="eyebrow">L&apos;équipe</p>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {team.map((member) => (
              <div key={member.name} className="border-l-2 border-accent pl-5">
                <h2 className="text-2xl">{member.name}</h2>
                <p className="mt-1 text-sm font-semibold text-accent-strong">{member.role}</p>
                {member.detail && <p className="mt-2 text-sm text-muted">{member.detail}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
