import type { Metadata } from "next";
import Link from "next/link";
import { CalendarIcon, PinIcon } from "@/components/icons";
import { PostGrid } from "@/components/post-card";
import { EmptyState, PageHeader, Pagination, SectionHeading } from "@/components/ui";
import { postPath } from "@/lib/content";
import { listPostTeasers, listUpcomingAgenda } from "@/lib/data/posts";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "La Plume",
  description: "Tribunes, interviews et regards d'experts : les membres de L'Amphi partagent leur expertise et leur vision.",
};

const PAGE_SIZE = 12;

export default async function LaPlumePage({ searchParams }: PageProps<"/la-plume">) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const [{ posts, total }, agenda] = await Promise.all([
    listPostTeasers({ categories: ["tribune", "interview"], limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE }),
    listUpcomingAgenda(),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="La Plume de l'Amphi"
        title="Tribunes, interviews et regards d'experts"
        intro="L'espace où les membres du club partagent leur expertise et leur vision des grands enjeux de la santé."
      />
      <section className="container-page py-14">
        {posts.length > 0 ? <PostGrid posts={posts} /> : <EmptyState>Les premières tribunes arrivent bientôt.</EmptyState>}
        <Pagination page={page} totalPages={Math.ceil(total / PAGE_SIZE)} basePath="/la-plume" />
      </section>

      <section id="agenda" className="scroll-mt-24 border-t border-line bg-surface py-16">
        <div className="container-page">
          <SectionHeading eyebrow="À ne pas manquer" title="Agenda" />
          {agenda.length > 0 ? (
            <ul className="divide-y divide-line border-y border-line">
              {agenda.map((item) => (
                <li key={item.id}>
                  <Link href={postPath(item)} className="group flex flex-col gap-2 py-5 sm:flex-row sm:items-center sm:gap-8">
                    <span className="flex w-48 shrink-0 items-center gap-2 text-sm font-semibold text-accent-strong">
                      <CalendarIcon /> {formatDate(item.event_date)}
                    </span>
                    <span className="flex-1 font-serif text-xl group-hover:text-accent-strong">{item.title}</span>
                    {item.location && (
                      <span className="flex items-center gap-1.5 text-sm text-muted">
                        <PinIcon /> {item.location}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted">Aucun rendez-vous à venir pour le moment.</p>
          )}
        </div>
      </section>
    </>
  );
}
