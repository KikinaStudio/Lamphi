import type { Metadata } from "next";
import Link from "next/link";
import { CalendarIcon, PinIcon } from "@/components/icons";
import { LoadMorePosts } from "@/components/load-more-posts";
import { PostGrid } from "@/components/post-card";
import { POSTS_PAGE_SIZE } from "@/components/post-pages";
import { EmptyState, PageHeader, SectionHeading } from "@/components/ui";
import { postPath } from "@/lib/content";
import { listPostTeasers, listUpcomingAgenda } from "@/lib/data/posts";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "La Plume",
  description: "Tribunes, interviews et regards d'experts : les membres de L'Amphi partagent leur expertise et leur vision.",
};

// Page en cache, régénérée au plus toutes les 5 minutes et dès qu'un contenu change dans le back-office.
export const revalidate = 300;

export default async function LaPlumePage() {
  const [{ posts, total }, agenda] = await Promise.all([
    listPostTeasers({ categories: ["tribune", "interview"], limit: POSTS_PAGE_SIZE }),
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
        <LoadMorePosts categories={["tribune", "interview"]} offset={posts.length} total={total} pageSize={POSTS_PAGE_SIZE} showCategory />
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
