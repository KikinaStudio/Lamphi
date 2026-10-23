import type { Metadata } from "next";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Partner } from "@/lib/types";
import { AdminHeader } from "../ui";
import { deletePartner } from "./actions";
import { PartnerForm } from "./partner-form";

export const metadata: Metadata = { title: "Partenaires" };

export default async function PartnersAdminPage() {
  await requireAdmin("/admin/partenaires");
  const supabase = await createClient();
  const { data } = await supabase.from("partners").select("*").order("position").order("name");
  const partners = (data ?? []) as Partner[];

  return (
    <>
      <AdminHeader title="Partenaires" description="Logos affichés en bas de la page d'accueil, dans l'ordre indiqué." />
      <section className="card p-6">
        <h2 className="mb-4 text-xl">Ajouter un partenaire</h2>
        {/* La clé change après chaque ajout : le formulaire repart à vide. */}
        <PartnerForm key={partners.length} nextPosition={partners.length} />
      </section>
      <div className="mt-6 space-y-4">
        {partners.map((partner) => (
          <section key={partner.id} className="card p-6">
            <PartnerForm partner={partner} />
            <ConfirmButton
              action={deletePartner.bind(null, partner.id)}
              message={`Retirer ${partner.name} des partenaires ?`}
              className="mt-3 text-sm text-muted hover:text-danger"
            >
              Retirer ce partenaire
            </ConfirmButton>
          </section>
        ))}
      </div>
    </>
  );
}
