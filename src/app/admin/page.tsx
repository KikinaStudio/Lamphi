import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { Application } from "@/lib/types";
import { AdminHeader } from "./ui";

export default async function AdminDashboardPage() {
  await requireAdmin();
  const supabase = await createClient();
  const now = new Date().toISOString();

  const count = (query: PromiseLike<{ count: number | null }>) => query.then((result) => result.count ?? 0);
  const [pending, members, published, drafts, upcoming, latest] = await Promise.all([
    count(supabase.from("applications").select("id", { count: "exact", head: true }).eq("status", "pending")),
    count(supabase.from("profiles").select("id", { count: "exact", head: true }).eq("status", "active")),
    count(supabase.from("posts").select("id", { count: "exact", head: true }).eq("status", "published")),
    count(supabase.from("posts").select("id", { count: "exact", head: true }).eq("status", "draft")),
    count(supabase.from("events").select("id", { count: "exact", head: true }).eq("status", "published").gte("starts_at", now)),
    supabase
      .from("applications")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(5)
      .then((result) => (result.data ?? []) as Application[]),
  ]);

  const stats = [
    { label: "Candidatures en attente", value: pending, href: "/admin/candidatures" },
    { label: "Membres actifs", value: members, href: "/admin/membres" },
    { label: "Articles publiés", value: published, href: "/admin/articles" },
    { label: "Brouillons", value: drafts, href: "/admin/articles?statut=draft" },
    { label: "Événements à venir", value: upcoming, href: "/admin/evenements" },
  ];

  return (
    <>
      <AdminHeader
        title="Tableau de bord"
        actions={
          <>
            <Link href="/admin/articles/nouveau" className="btn btn-accent btn-sm">
              + Nouvel article
            </Link>
            <Link href="/admin/evenements/nouveau" className="btn btn-primary btn-sm">
              + Nouvel événement
            </Link>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="card p-5 transition hover:border-accent">
            <p className="font-serif text-4xl">{stat.value}</p>
            <p className="mt-1 text-sm text-muted">{stat.label}</p>
          </Link>
        ))}
      </div>

      <section className="mt-10">
        <h2 className="text-2xl">Dernières candidatures</h2>
        {latest.length > 0 ? (
          <ul className="card mt-4 divide-y divide-line">
            {latest.map((application) => (
              <li key={application.id} className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <span>
                  <span className="font-semibold">
                    {application.first_name} {application.last_name}
                  </span>
                  <span className="text-muted">
                    {" "}
                    — {application.job_title}, {application.company}
                  </span>
                </span>
                <span className="text-sm text-muted">{formatDate(application.created_at)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-muted">Aucune candidature en attente.</p>
        )}
        {latest.length > 0 && (
          <Link href="/admin/candidatures" className="btn btn-primary btn-sm mt-4">
            Examiner les candidatures
          </Link>
        )}
      </section>

      <section className="card mt-10 p-6">
        <h2 className="text-xl">Publier un contenu en 3 étapes</h2>
        <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-ink-soft">
          <li>
            <Link href="/admin/articles/nouveau" className="text-accent-strong underline">
              Nouvel article
            </Link>{" "}
            : choisissez la rubrique (Décryptage, Tribune, Interview, Actu du club, Agenda).
          </li>
          <li>Ajoutez un titre, une image de couverture et rédigez le texte (copier-coller depuis Word ou Google Docs possible).</li>
          <li>Choisissez « Publié » puis enregistrez : l&apos;article est en ligne immédiatement.</li>
        </ol>
      </section>
    </>
  );
}
