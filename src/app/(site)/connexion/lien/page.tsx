import type { Metadata } from "next";
import { safeNextPath } from "@/lib/redirect";

export const metadata: Metadata = { title: "Confirmer", robots: { index: false } };

const TITLES: Record<string, string> = {
  invite: "Bienvenue à L'Amphi",
  recovery: "Choisir un nouveau mot de passe",
};

export default async function ConfirmLinkPage({ searchParams }: PageProps<"/connexion/lien">) {
  const params = await searchParams;
  const value = (key: string) => (typeof params[key] === "string" ? (params[key] as string) : "");
  const type = value("type");

  return (
    <section className="container-page flex justify-center py-20 sm:py-28">
      <div className="w-full max-w-md text-center">
        <p className="eyebrow">Espace membre</p>
        <h1 className="mt-3 text-4xl">{TITLES[type] ?? "Connexion à L'Amphi"}</h1>
        <p className="mt-4 text-muted">Cliquez sur le bouton ci-dessous pour continuer vers votre espace membre.</p>
        <form action="/auth/confirm" method="post" className="mt-8">
          <input type="hidden" name="token_hash" value={value("token_hash")} />
          <input type="hidden" name="type" value={type} />
          <input type="hidden" name="next" value={safeNextPath(value("next"))} />
          <button type="submit" className="btn btn-primary w-full">
            Continuer
          </button>
        </form>
      </div>
    </section>
  );
}
