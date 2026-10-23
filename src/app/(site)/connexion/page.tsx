import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getViewer, isActiveMember } from "@/lib/auth";
import { safeNextPath } from "@/lib/redirect";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Connexion", robots: { index: false } };

const ERRORS: Record<string, string> = {
  lien: "Ce lien a expiré ou a déjà été utilisé. Demandez-en un nouveau ci-dessous.",
};

export default async function LoginPage({ searchParams }: PageProps<"/connexion">) {
  const params = await searchParams;
  const next = safeNextPath(params.next);
  const error = typeof params.erreur === "string" ? ERRORS[params.erreur] : undefined;

  const viewer = await getViewer();
  if (isActiveMember(viewer)) redirect(next);

  return (
    <section className="container-page flex justify-center py-16 sm:py-24">
      <div className="w-full max-w-md">
        <p className="eyebrow text-center">Espace membre</p>
        <h1 className="mt-3 text-center text-4xl">Connexion</h1>
        <p className="mt-3 text-center text-muted">Connectez-vous pour accéder aux différents contenus de l&apos;Amphi.</p>
        <div className="card mt-8 p-6 sm:p-8">
          {error && <p className="mb-5 rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger">{error}</p>}
          <LoginForm next={next} />
        </div>
        <p className="mt-6 text-center text-sm text-muted">
          Pas encore membre ?{" "}
          <Link href="/devenir-membre" className="font-semibold text-accent-strong hover:underline">
            Demander une adhésion
          </Link>
        </p>
      </div>
    </section>
  );
}
