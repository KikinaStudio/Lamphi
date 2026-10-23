import type { Metadata } from "next";
import Link from "next/link";
import { Avatar } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { searchFilter } from "@/lib/data/members";
import { formatDate, fullName, initials } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";
import { AdminHeader, StatusBadge } from "../ui";

export const metadata: Metadata = { title: "Membres" };

export default async function MembersAdminPage({ searchParams }: PageProps<"/admin/membres">) {
  await requireAdmin("/admin/membres");
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim().slice(0, 100) : "";

  const supabase = await createClient();
  let request = supabase.from("profiles").select("*").order("last_name").order("first_name");
  if (query) {
    request = request.or(searchFilter(["first_name", "last_name", "company", "email"], query));
  }
  const { data } = await request;
  const members = (data ?? []) as Profile[];

  return (
    <>
      <AdminHeader
        title="Membres"
        description={`${members.length} compte${members.length > 1 ? "s" : ""}`}
        actions={
          <Link href="/admin/membres/nouveau" className="btn btn-accent btn-sm">
            + Inviter un membre
          </Link>
        }
      />
      <form className="mb-6 flex gap-2" role="search">
        <input name="q" defaultValue={query} placeholder="Nom, organisation, e-mail…" className="field-input max-w-sm" />
        <button className="btn btn-primary btn-sm">Rechercher</button>
      </form>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="border-b border-line text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-5 py-3 font-semibold">Membre</th>
              <th className="px-5 py-3 font-semibold">Organisation</th>
              <th className="px-5 py-3 font-semibold">Statut</th>
              <th className="px-5 py-3 font-semibold">Depuis</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {members.map((member) => (
              <tr key={member.id} className="hover:bg-paper">
                <td className="px-5 py-3">
                  <Link href={`/admin/membres/${member.id}`} className="flex items-center gap-3">
                    <Avatar name={fullName(member)} initials={initials(member)} url={member.photo_url} size={36} />
                    <span>
                      <span className="block font-semibold hover:text-accent-strong">{fullName(member) || member.email}</span>
                      <span className="block text-xs text-muted">{member.email}</span>
                    </span>
                  </Link>
                </td>
                <td className="px-5 py-3 text-ink-soft">
                  {member.company}
                  {member.job_title && <span className="block text-xs text-muted">{member.job_title}</span>}
                </td>
                <td className="space-x-1 px-5 py-3">
                  {member.status === "active" ? <StatusBadge tone="success">Actif</StatusBadge> : <StatusBadge tone="danger">Suspendu</StatusBadge>}
                  {member.role === "admin" && <StatusBadge tone="warning">Admin</StatusBadge>}
                </td>
                <td className="px-5 py-3 text-muted">{formatDate(member.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {members.length === 0 && <p className="px-5 py-10 text-center text-muted">Aucun membre trouvé.</p>}
      </div>
    </>
  );
}
