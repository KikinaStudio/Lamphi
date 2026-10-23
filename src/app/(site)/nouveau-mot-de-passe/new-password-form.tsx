"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FormMessage } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";

const MIN_LENGTH = 8;

export function NewPasswordForm({ welcome }: { welcome: boolean }) {
  const router = useRouter();
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; message: string } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    async function init() {
      // Liens d'e-mail au format par défaut de Supabase : les jetons arrivent après le #.
      const hash = new URLSearchParams(window.location.hash.slice(1));
      const accessToken = hash.get("access_token");
      const refreshToken = hash.get("refresh_token");
      if (accessToken && refreshToken) {
        await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
      }
      const { data } = await supabase.auth.getUser();
      setHasSession(Boolean(data.user));
    }
    init();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirmation = String(form.get("confirmation") ?? "");

    if (password.length < MIN_LENGTH) {
      setMessage({ ok: false, message: `Le mot de passe doit contenir au moins ${MIN_LENGTH} caractères.` });
      return;
    }
    if (password !== confirmation) {
      setMessage({ ok: false, message: "Les deux mots de passe ne correspondent pas." });
      return;
    }

    setPending(true);
    const { error } = await createClient().auth.updateUser({ password });
    setPending(false);

    if (error) {
      setMessage({
        ok: false,
        message:
          error.code === "same_password"
            ? "Ce mot de passe est identique au précédent."
            : error.code === "weak_password"
              ? "Ce mot de passe est trop simple. Choisissez-en un plus long ou plus varié."
              : "Impossible d'enregistrer le mot de passe. Le lien a peut-être expiré.",
      });
      return;
    }

    router.push(welcome ? "/espace-membre/profil?bienvenue=1" : "/espace-membre");
    router.refresh();
  }

  if (hasSession === null) return <p className="text-center text-muted">Vérification du lien…</p>;

  if (!hasSession) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-muted">Ce lien a expiré ou a déjà été utilisé.</p>
        <Link href="/mot-de-passe-oublie" className="btn btn-primary">
          Recevoir un nouveau lien
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="password" className="field-label">
          Mot de passe
        </label>
        <input id="password" name="password" type="password" autoComplete="new-password" minLength={MIN_LENGTH} required className="field-input" />
        <p className="field-hint">{MIN_LENGTH} caractères minimum.</p>
      </div>
      <div>
        <label htmlFor="confirmation" className="field-label">
          Confirmez le mot de passe
        </label>
        <input id="confirmation" name="confirmation" type="password" autoComplete="new-password" required className="field-input" />
      </div>
      {message && <FormMessage state={message} />}
      <button type="submit" className="btn btn-primary w-full" disabled={pending}>
        {pending ? "Enregistrement…" : "Enregistrer et accéder à l'espace membre"}
      </button>
    </form>
  );
}
