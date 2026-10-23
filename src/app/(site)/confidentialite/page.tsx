import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { site } from "@/content/site";

export const metadata: Metadata = { title: "Politique de confidentialité", robots: { index: false } };

export default function PrivacyPage() {
  return (
    <>
      <PageHeader title="Politique de confidentialité" />
      <section className="container-page max-w-3xl space-y-8 py-14 leading-relaxed text-ink-soft">
        <div>
          <h2 className="text-2xl text-ink">Données collectées</h2>
          <p className="mt-2">
            Lors d&apos;une demande d&apos;adhésion, nous collectons vos nom, prénom, e-mail, téléphone, organisation,
            fonction et les informations que vous choisissez de partager. Elles servent exclusivement à l&apos;examen de
            votre candidature par le comité de sélection.
          </p>
        </div>
        <div>
          <h2 className="text-2xl text-ink">Annuaire des membres</h2>
          <p className="mt-2">
            Le profil d&apos;un membre n&apos;est visible que des autres membres connectés. Chaque membre choisit depuis
            son espace d&apos;afficher ou non son e-mail et son téléphone, et peut modifier son profil à tout moment.
          </p>
        </div>
        <div>
          <h2 className="text-2xl text-ink">Vos droits</h2>
          <p className="mt-2">
            Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification et de suppression de vos
            données. Écrivez-nous à{" "}
            <a href={`mailto:${site.contactEmail}`} className="underline">{site.contactEmail}</a>.
          </p>
        </div>
        <div>
          <h2 className="text-2xl text-ink">Cookies</h2>
          <p className="mt-2">
            Ce site n&apos;utilise que les cookies strictement nécessaires à la connexion à l&apos;espace membre. Aucun
            cookie publicitaire ni de mesure d&apos;audience n&apos;est déposé.
          </p>
        </div>
      </section>
    </>
  );
}
