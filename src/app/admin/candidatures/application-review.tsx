"use client";

import { useActionState, useState } from "react";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { FormMessage } from "@/components/ui";
import type { FormState } from "@/lib/types";
import { approveApplication, deleteApplication, rejectApplication } from "./actions";

export function ApplicationReview({ id }: { id: string }) {
  const [decision, setDecision] = useState<"approve" | "reject" | null>(null);
  const [approveState, approveAction, approving] = useActionState<FormState, FormData>(approveApplication.bind(null, id), null);
  const [rejectState, rejectAction, rejecting] = useActionState<FormState, FormData>(rejectApplication.bind(null, id), null);
  const state = approveState ?? rejectState;

  if (state?.ok) {
    return (
      <div className="mt-5">
        <FormMessage state={state} />
      </div>
    );
  }

  return (
    <div className="mt-5 border-t border-line pt-5">
      {decision === null && (
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn btn-accent btn-sm" onClick={() => setDecision("approve")}>
            Accepter
          </button>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => setDecision("reject")}>
            Refuser
          </button>
          <ConfirmButton
            action={deleteApplication.bind(null, id)}
            message="Supprimer définitivement cette candidature (spam) ?"
            className="text-sm text-muted hover:text-danger"
            formClassName="ml-auto"
          >
            Supprimer (spam)
          </ConfirmButton>
        </div>
      )}

      {decision === "approve" && (
        <form action={approveAction} className="space-y-3">
          <p className="text-sm text-ink-soft">
            Le compte membre sera créé et une invitation envoyée à l&apos;adresse de la candidature pour choisir un mot de passe.
          </p>
          <textarea name="admin_notes" rows={2} placeholder="Note interne (facultatif)" className="field-input" />
          <div className="flex flex-wrap gap-2">
            <button type="submit" className="btn btn-accent btn-sm" disabled={approving}>
              {approving ? "Création du compte…" : "Confirmer et envoyer l'invitation"}
            </button>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setDecision(null)}>
              Annuler
            </button>
          </div>
        </form>
      )}

      {decision === "reject" && (
        <form action={rejectAction} className="space-y-3">
          <textarea name="admin_notes" rows={2} placeholder="Motif (note interne, non envoyée)" className="field-input" />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="notify" className="h-4 w-4 accent-[var(--color-accent)]" />
            Prévenir le candidat par e-mail (message de refus courtois)
          </label>
          <div className="flex flex-wrap gap-2">
            <button type="submit" className="btn btn-danger btn-sm" disabled={rejecting}>
              {rejecting ? "Enregistrement…" : "Confirmer le refus"}
            </button>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setDecision(null)}>
              Annuler
            </button>
          </div>
        </form>
      )}

      {state && !state.ok && (
        <div className="mt-3">
          <FormMessage state={state} />
        </div>
      )}
    </div>
  );
}
