"use client";

import { useActionState } from "react";
import { FormMessage } from "@/components/ui";
import type { FormState } from "@/lib/types";
import { resendAccessEmail } from "../actions";

export function ResendAccessButton({ email, id }: { email: string; id: string }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(() => resendAccessEmail(email, id), null);
  return (
    <form action={formAction} className="space-y-3">
      <button type="submit" className="btn btn-outline btn-sm w-full" disabled={pending}>
        {pending ? "Envoi…" : "Envoyer un lien de mot de passe"}
      </button>
      <FormMessage state={state} />
    </form>
  );
}
