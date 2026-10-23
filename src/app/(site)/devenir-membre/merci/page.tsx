import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Candidature envoyée", robots: { index: false } };

export default function ThanksPage() {
  return (
    <section className="container-page flex flex-col items-center py-28 text-center">
      <p className="eyebrow">Candidature envoyée</p>
      <h1 className="mt-4 max-w-2xl text-4xl sm:text-5xl">Merci, votre demande a bien été reçue</h1>
      <p className="mt-5 max-w-xl text-lg text-muted">
        Notre comité de sélection l&apos;examinera avec attention. Si elle est retenue, vous recevrez une invitation par
        e-mail pour créer votre accès à l&apos;espace membre.
      </p>
      <Link href="/" className="btn btn-primary mt-10">
        Retour à l&apos;accueil
      </Link>
    </section>
  );
}
