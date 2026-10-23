import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { site } from "@/content/site";

export const metadata: Metadata = { title: "Mentions légales", robots: { index: false } };

// Complétez les informations entre crochets avant la mise en ligne.
export default function LegalPage() {
  return (
    <>
      <PageHeader title="Mentions légales" />
      <section className="container-page max-w-3xl space-y-8 py-14 leading-relaxed text-ink-soft">
        <div>
          <h2 className="text-2xl text-ink">Éditeur du site</h2>
          <p className="mt-2">
            {site.name} — [raison sociale, forme juridique, capital]
            <br />
            [Adresse du siège social]
            <br />
            [RCS / SIRET]
            <br />
            Directeur de la publication : [nom]
            <br />
            Contact : <a href={`mailto:${site.contactEmail}`} className="underline">{site.contactEmail}</a>
          </p>
        </div>
        <div>
          <h2 className="text-2xl text-ink">Hébergement</h2>
          <p className="mt-2">
            Site : [Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis — ou votre hébergeur]
            <br />
            Données des membres : Supabase (région Union européenne choisie lors de la création du projet).
          </p>
        </div>
        <div>
          <h2 className="text-2xl text-ink">Propriété intellectuelle</h2>
          <p className="mt-2">
            L&apos;ensemble des contenus de ce site (textes, images, vidéos, logos) est protégé. Toute reproduction sans
            autorisation préalable est interdite.
          </p>
        </div>
      </section>
    </>
  );
}
