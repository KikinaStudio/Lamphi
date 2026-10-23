import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { ProfileForm } from "@/components/profile-form";
import { SubmitButton } from "@/components/submit-button";
import { requireAdmin } from "@/lib/auth";
import { memberPath } from "@/lib/content";
import { formatDate, fullName } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";
import { AdminHeader, BackLink, StatusBadge } from "../../ui";
import { deleteMember, setMemberAccess, updateMemberProfile } from "../actions";
import { ResendAccessButton } from "./member-actions";

export const metadata: Metadata = { title: "Fiche membre" };

export default async function MemberAdminPage({ params, searchParams }: PageProps<"/admin/membres/[id]">) {
  const { id } = await params;
  const { profile: me } = await requireAdmin(`/admin/membres/${id}`);
  const justInvited = (await searchParams).invite === "1";

  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
  const member = data as Profile | null;
  if (!member) notFound();
  const isMe = member.id === me.id;

  return (
    <>
      <BackLink href="/admin/membres">Membres</BackLink>
      <AdminHeader
        title={fullName(member) || member.email}
        description={
          <>
            Membre depuis le {formatDate(member.created_at)} ·{" "}
            <Link href={memberPath(member)} className="text-accent-strong hover:underline">
              Voir la fiche annuaire
            </Link>
          </>
        }
      />
      {justInvited && (
        <p className="mb-6 rounded-lg bg-success/10 px-4 py-3 text-sm text-success">
          Compte créé : l&apos;invitation a été envoyée à {member.email}.
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="card p-6 sm:p-8">
          <ProfileForm profile={member} action={updateMemberProfile.bind(null, member.id)} />
        </div>

        <div className="space-y-6">
          <section className="card space-y-4 p-6">
            <h2 className="text-xl">Accès</h2>
            <div className="flex gap-2">
              {member.status === "active" ? <StatusBadge tone="success">Actif</StatusBadge> : <StatusBadge tone="danger">Suspendu</StatusBadge>}
              <StatusBadge tone={member.role === "admin" ? "warning" : "muted"}>{member.role === "admin" ? "Administrateur" : "Membre"}</StatusBadge>
            </div>
            {isMe ? (
              <p className="text-sm text-muted">Vous ne pouvez pas modifier vos propres droits.</p>
            ) : (
              <div className="flex flex-col gap-2">
                <form action={setMemberAccess.bind(null, member.id)}>
                  <input type="hidden" name="status" value={member.status === "active" ? "suspended" : "active"} />
                  <SubmitButton className="btn btn-outline btn-sm w-full" pendingLabel="…">
                    {member.status === "active" ? "Suspendre l'accès" : "Réactiver l'accès"}
                  </SubmitButton>
                </form>
                <form action={setMemberAccess.bind(null, member.id)}>
                  <input type="hidden" name="role" value={member.role === "admin" ? "member" : "admin"} />
                  <SubmitButton className="btn btn-outline btn-sm w-full" pendingLabel="…">
                    {member.role === "admin" ? "Retirer les droits admin" : "Nommer administrateur"}
                  </SubmitButton>
                </form>
              </div>
            )}
            <p className="text-xs text-muted">
              Un membre suspendu ne peut plus accéder à l&apos;espace membre et n&apos;apparaît plus dans l&apos;annuaire.
            </p>
          </section>

          <section className="card space-y-3 p-6">
            <h2 className="text-xl">Connexion</h2>
            <p className="text-sm text-muted">Le membre n&apos;a pas reçu son invitation ou a perdu son mot de passe ?</p>
            <ResendAccessButton email={member.email} id={member.id} />
          </section>

          {!isMe && (
            <section className="card space-y-3 border-danger/30 p-6">
              <h2 className="text-xl">Supprimer</h2>
              <p className="text-sm text-muted">Supprime définitivement le compte, le profil et les inscriptions aux événements.</p>
              <ConfirmButton
                action={deleteMember.bind(null, member.id)}
                message={`Supprimer définitivement le compte de ${fullName(member)} ? Cette action est irréversible.`}
                className="btn btn-danger btn-sm w-full"
              >
                Supprimer le membre
              </ConfirmButton>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
