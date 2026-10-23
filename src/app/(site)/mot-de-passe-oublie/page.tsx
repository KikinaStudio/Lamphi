import type { Metadata } from "next";
import Link from "next/link";
import { ResetForm } from "./reset-form";

export const metadata: Metadata = { title: "Mot de passe oublié", robots: { index: false } };

export default function ForgotPasswordPage() {
  return (
    <section className="container-page flex justify-center py-16 sm:py-24">
      <div className="w-full max-w-md">
        <h1 className="text-center text-4xl">Mot de passe oublié</h1>
        <p className="mt-3 text-center text-muted">
          Indiquez l&apos;e-mail de votre compte membre : nous vous enverrons un lien pour choisir un nouveau mot de passe.
        </p>
        <div className="card mt-8 p-6 sm:p-8">
          <ResetForm />
        </div>
        <p className="mt-6 text-center text-sm">
          <Link href="/connexion" className="text-accent-strong hover:underline">
            ← Retour à la connexion
          </Link>
        </p>
      </div>
    </section>
  );
}
