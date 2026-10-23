"use client";

import { useActionState } from "react";
import { FormMessage } from "@/components/ui";
import type { FormState } from "@/lib/types";
import { requestPasswordReset } from "../connexion/actions";

export function ResetForm() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(requestPasswordReset, null);
  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="email" className="field-label">
          E-mail
        </label>
        <input id="email" name="email" type="email" autoComplete="email" required className="field-input" />
      </div>
      <FormMessage state={state} />
      <button type="submit" className="btn btn-primary w-full" disabled={pending}>
        {pending ? "Envoi…" : "Recevoir le lien"}
      </button>
    </form>
  );
}
