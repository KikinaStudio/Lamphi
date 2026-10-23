import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { Application, ApplicationStatus } from "@/lib/types";
import { AdminHeader, StatusBadge, Tabs } from "../ui";
import { ApplicationReview } from "./application-review";

export const metadata: Metadata = { title: "Candidatures" };

const STATUSES: { key: ApplicationStatus; label: string }[] = [
  { key: "pending", label: "En attente" },
  { key: "approved", label: "Acceptées" },
  { key: "rejected", label: "Refusées" },
];

export default async function ApplicationsPage({ searchParams }: PageProps<"/admin/candidatures">) {
  await requireAdmin("/admin/candidatures");
  const params = await searchParams;
  const status = STATUSES.find((item) => item.key === params.statut)?.key ?? "pending";

  const supabase = await createClient();
  const [{ data }, ...counts] = await Promise.all([
    supabase.from("applications").select("*").eq("status", status).order("created_at", { ascending: status === "pending" }),
    ...STATUSES.map((item) =>
      supabase.from("applications").select("id", { count: "exact", head: true }).eq("status", item.key),
    ),
  ]);
  const applications = (data ?? []) as Application[];

  return (
    <>
      <AdminHeader
        title="Candidatures"
        description="Accepter une candidature crée le compte du membre et lui envoie automatiquement l'e-mail d'invitation."
      />
      <Tabs
        current={status}
        tabs={STATUSES.map((item, index) => ({
          key: item.key,
          label: item.label,
          href: `/admin/candidatures?statut=${item.key}`,
          count: counts[index].count ?? 0,
        }))}
      />

      {applications.length === 0 ? (
        <p className="card px-6 py-10 text-center text-muted">Aucune candidature dans cette liste.</p>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <article key={application.id} className="card p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-2xl">
                    {application.first_name} {application.last_name}
                  </h2>
                  <p className="text-ink-soft">
                    {application.job_title} — <strong>{application.company}</strong>
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted">
                  {application.status === "approved" && <StatusBadge tone="success">Acceptée</StatusBadge>}
                  {application.status === "rejected" && <StatusBadge tone="danger">Refusée</StatusBadge>}
                  Reçue le {formatDate(application.created_at)}
                </div>
              </div>

              <dl className="mt-5 grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                <Detail label="E-mail">
                  <a href={`mailto:${application.email}`} className="text-accent-strong hover:underline">
                    {application.email}
                  </a>
                </Detail>
                <Detail label="Téléphone">{application.phone}</Detail>
                <Detail label="Type d'organisation">{application.organization_type}</Detail>
                <Detail label="Secteur">{application.sector}</Detail>
                <Detail label="Recommandé par">{application.referral}</Detail>
                <Detail label="LinkedIn">
                  {application.linkedin_url && (
                    <a href={application.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-accent-strong hover:underline">
                      Voir le profil
                    </a>
                  )}
                </Detail>
              </dl>

              {application.motivation && (
                <div className="mt-5 rounded-lg bg-paper p-4 text-sm leading-relaxed text-ink-soft">
                  <p className="mb-1 font-semibold text-ink">Motivation</p>
                  <p className="whitespace-pre-line">{application.motivation}</p>
                </div>
              )}

              {application.status === "pending" ? (
                <ApplicationReview id={application.id} />
              ) : (
                application.admin_notes && <p className="mt-4 text-sm text-muted">Note interne : {application.admin_notes}</p>
              )}
            </article>
          ))}
        </div>
      )}
    </>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-0.5">{children || "—"}</dd>
    </div>
  );
}
