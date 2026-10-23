import type { Metadata } from "next";
import { NewPasswordForm } from "./new-password-form";

export const metadata: Metadata = { title: "Choisir un mot de passe", robots: { index: false } };

export default async function NewPasswordPage({ searchParams }: PageProps<"/nouveau-mot-de-passe">) {
  const welcome = (await searchParams).bienvenue === "1";

  return (
    <section className="container-page flex justify-center py-16 sm:py-24">
      <div className="w-full max-w-md">
        <p className="eyebrow text-center">{welcome ? "Bienvenue au club" : "Espace membre"}</p>
        <h1 className="mt-3 text-center text-4xl">{welcome ? "Créez votre accès" : "Nouveau mot de passe"}</h1>
        <p className="mt-3 text-center text-muted">
          {welcome
            ? "Votre candidature a été acceptée. Choisissez un mot de passe pour accéder à l'espace membre."
            : "Choisissez un nouveau mot de passe pour votre compte."}
        </p>
        <div className="card mt-8 p-6 sm:p-8">
          <NewPasswordForm welcome={welcome} />
        </div>
      </div>
    </section>
  );
}
