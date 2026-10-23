import type { Metadata } from "next";
import Link from "next/link";
import { Avatar, EmptyState } from "@/components/ui";
import { sectors } from "@/content/site";
import { requireMember } from "@/lib/auth";
import { memberPath } from "@/lib/content";
import { listDirectory } from "@/lib/data/members";
import { fullName, initials } from "@/lib/format";

export const metadata: Metadata = { title: "Annuaire des membres", robots: { index: false } };

export default async function DirectoryPage({ searchParams }: PageProps<"/annuaire-des-membres">) {
  await requireMember("/annuaire-des-membres");
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.slice(0, 100) : "";
  const sector = typeof params.secteur === "string" ? params.secteur : "";
  const members = await listDirectory({ query, sector });

  return (
    <>
      <section className="border-b border-line">
        <div className="container-page py-12">
          <p className="eyebrow">Réservé aux membres</p>
          <h1 className="mt-3 text-4xl sm:text-5xl">Annuaire des membres</h1>
          <form className="mt-8 flex flex-col gap-3 sm:flex-row" role="search">
            <label className="sr-only" htmlFor="q">
              Rechercher
            </label>
            <input id="q" name="q" defaultValue={query} placeholder="Nom, organisation, fonction…" className="field-input sm:max-w-sm" />
            <label className="sr-only" htmlFor="secteur">
              Secteur
            </label>
            <select id="secteur" name="secteur" defaultValue={sector} className="field-input sm:max-w-xs">
              <option value="">Tous les secteurs</option>
              {sectors.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <button type="submit" className="btn btn-primary">
              Rechercher
            </button>
            {(query || sector) && (
              <Link href="/annuaire-des-membres" className="btn btn-outline">
                Effacer
              </Link>
            )}
          </form>
        </div>
      </section>

      <section className="container-page py-12">
        <p className="mb-6 text-sm text-muted">
          {members.length} membre{members.length > 1 ? "s" : ""}
        </p>
        {members.length > 0 ? (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((member) => (
              <li key={member.id}>
                <Link href={memberPath(member)} className="card flex h-full items-center gap-4 p-5 transition hover:border-accent">
                  <Avatar name={fullName(member)} initials={initials(member)} url={member.photo_url} />
                  <span className="min-w-0">
                    <span className="block truncate font-serif text-lg">{fullName(member)}</span>
                    {member.job_title && <span className="block truncate text-sm text-ink-soft">{member.job_title}</span>}
                    {member.company && <span className="block truncate text-sm font-semibold text-accent-strong">{member.company}</span>}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState>Aucun membre ne correspond à votre recherche.</EmptyState>
        )}
      </section>
    </>
  );
}
