import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/content/site";
import { getViewer, isActiveMember } from "@/lib/auth";

export const metadata: Metadata = { title: "Accès réservé", robots: { index: false } };

export default async function AccessDeniedPage() {
  const viewer = await getViewer();
  const isMember = isActiveMember(viewer);

  return (
    <section className="container-page flex flex-col items-center py-28 text-center">
      <p className="eyebrow">Accès réservé</p>
      <h1 className="mt-4 max-w-2xl text-4xl sm:text-5xl">
        {isMember ? "Cette page est réservée à l'équipe du club" : "Cet espace est réservé aux membres de L'Amphi"}
      </h1>
      <p className="mt-5 max-w-xl text-lg text-muted">
        {viewer && !isMember
          ? `Votre compte n'est pas (ou plus) actif. Pour toute question, écrivez-nous à ${site.contactEmail}.`
          : isMember
            ? "Si vous pensez qu'il s'agit d'une erreur, contactez l'équipe du club."
            : "Connectez-vous pour accéder aux différents contenus de l'Amphi."}
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        {isMember ? (
          <Link href="/espace-membre" className="btn btn-primary">
            Retour à l&apos;espace membre
          </Link>
        ) : viewer ? (
          <form action="/auth/deconnexion" method="post">
            <button type="submit" className="btn btn-primary">
              Se déconnecter
            </button>
          </form>
        ) : (
          <Link href="/connexion" className="btn btn-primary">
            Se connecter
          </Link>
        )}
        {!isMember && (
          <Link href="/devenir-membre" className="btn btn-outline">
            Devenir membre
          </Link>
        )}
      </div>
    </section>
  );
}
