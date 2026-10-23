"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { FormMessage } from "@/components/ui";
import type { FormState } from "@/lib/types";
import { sendMagicLink, signIn } from "./actions";

export function LoginForm({ next }: { next: string }) {
  const [mode, setMode] = useState<"password" | "link">("password");
  const [passwordState, passwordAction, signingIn] = useActionState<FormState, FormData>(signIn, null);
  const [linkState, linkAction, sendingLink] = useActionState<FormState, FormData>(sendMagicLink, null);

  if (mode === "link") {
    return (
      <form action={linkAction} className="space-y-5">
        <input type="hidden" name="next" value={next} />
        <div>
          <label htmlFor="email" className="field-label">
            E-mail
          </label>
          <input id="email" name="email" type="email" autoComplete="email" required className="field-input" />
        </div>
        <FormMessage state={linkState} />
        <button type="submit" className="btn btn-primary w-full" disabled={sendingLink}>
          {sendingLink ? "Envoi…" : "Recevoir un lien de connexion"}
        </button>
        <button type="button" onClick={() => setMode("password")} className="w-full text-sm text-accent-strong hover:underline">
          Me connecter avec mon mot de passe
        </button>
      </form>
    );
  }

  return (
    <form action={passwordAction} className="space-y-5">
      <input type="hidden" name="next" value={next} />
      <div>
        <label htmlFor="email" className="field-label">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={passwordState?.values?.email}
          className="field-input"
        />
      </div>
      <div>
        <div className="flex items-baseline justify-between">
          <label htmlFor="password" className="field-label">
            Mot de passe
          </label>
          <Link href="/mot-de-passe-oublie" className="text-xs text-accent-strong hover:underline">
            Mot de passe oublié ?
          </Link>
        </div>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="field-input" />
      </div>
      <FormMessage state={passwordState} />
      <button type="submit" className="btn btn-primary w-full" disabled={signingIn}>
        {signingIn ? "Connexion…" : "Se connecter"}
      </button>
      <button type="button" onClick={() => setMode("link")} className="w-full text-sm text-accent-strong hover:underline">
        Recevoir un lien de connexion par e-mail
      </button>
    </form>
  );
}
