import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { AdminHeader, BackLink } from "../../ui";
import { InviteForm } from "./invite-form";

export const metadata: Metadata = { title: "Inviter un membre" };

export default async function InviteMemberPage() {
  await requireAdmin("/admin/membres/nouveau");
  return (
    <>
      <BackLink href="/admin/membres">Membres</BackLink>
      <AdminHeader
        title="Inviter un membre"
        description="Pour ajouter directement un membre sans passer par une candidature. Il reçoit un e-mail pour choisir son mot de passe."
      />
      <div className="card max-w-3xl p-6 sm:p-8">
        <InviteForm />
      </div>
    </>
  );
}
