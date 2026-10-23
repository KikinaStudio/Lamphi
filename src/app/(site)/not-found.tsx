import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container-page flex flex-col items-center py-28 text-center">
      <p className="eyebrow">Erreur 404</p>
      <h1 className="mt-4 text-4xl sm:text-5xl">Cette page est introuvable</h1>
      <p className="mt-4 max-w-md text-muted">Elle a peut-être été déplacée ou n&apos;existe plus.</p>
      <Link href="/" className="btn btn-primary mt-8">
        Retour à l&apos;accueil
      </Link>
    </section>
  );
}
