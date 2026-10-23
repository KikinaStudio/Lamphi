"use client";

import Link from "next/link";
import { useActionState } from "react";
import { FormMessage } from "@/components/ui";
import type { FormState, RegistrationStatus } from "@/lib/types";
import { cancelRegistration, registerForEvent } from "./actions";

export function RegistrationBox({
  eventId,
  eventPath,
  isPast,
  registrationOpen,
  seatsLeft,
  isMember,
  status,
}: {
  eventId: string;
  eventPath: string;
  isPast: boolean;
  registrationOpen: boolean;
  seatsLeft: number | null;
  isMember: boolean;
  status: RegistrationStatus | null;
}) {
  const [registerState, registerAction, registering] = useActionState<FormState, FormData>(
    registerForEvent.bind(null, eventId, eventPath),
    null,
  );
  const [cancelState, cancelAction, cancelling] = useActionState<FormState, FormData>(
    cancelRegistration.bind(null, eventId, eventPath),
    null,
  );
  const state = cancelState ?? registerState;
  const isRegistered = status === "registered" || status === "waitlist";

  return (
    <div className="card p-6">
      <h2 className="text-2xl">Inscription</h2>

      {isPast ? (
        <p className="mt-3 text-muted">Cet événement a eu lieu. Les membres retrouvent la galerie photos sur cette page.</p>
      ) : !registrationOpen ? (
        <p className="mt-3 text-muted">Les inscriptions ne sont pas ouvertes pour le moment.</p>
      ) : !isMember ? (
        <>
          <p className="mt-3 text-muted">
            Les inscriptions sont réservées en priorité aux membres de L&apos;Amphi : quatre dîners sont inclus dans
            l&apos;adhésion.
          </p>
          <div className="mt-5 flex flex-col gap-3">
            <Link href={`/connexion?next=${encodeURIComponent(eventPath)}`} className="btn btn-primary">
              Je suis membre, je me connecte
            </Link>
            <Link href="/devenir-membre" className="btn btn-outline">
              Devenir membre
            </Link>
          </div>
        </>
      ) : isRegistered ? (
        <>
          <p className={`mt-3 rounded-lg px-4 py-3 text-sm ${status === "registered" ? "bg-success/10 text-success" : "bg-accent-soft text-accent-strong"}`}>
            {status === "registered" ? "Vous êtes inscrit(e) à ce dîner." : "Vous êtes sur liste d'attente."}
          </p>
          <form action={cancelAction} className="mt-4">
            <button type="submit" className="btn btn-outline w-full" disabled={cancelling}>
              {cancelling ? "Annulation…" : "Annuler mon inscription"}
            </button>
          </form>
        </>
      ) : (
        <form action={registerAction} className="mt-4 space-y-4">
          {seatsLeft !== null && (
            <p className="text-sm text-muted">
              {seatsLeft > 0
                ? `${seatsLeft} place${seatsLeft > 1 ? "s" : ""} restante${seatsLeft > 1 ? "s" : ""}`
                : "Complet — inscription possible sur liste d'attente"}
            </p>
          )}
          <div>
            <label htmlFor="note" className="field-label">
              Message (facultatif)
            </label>
            <textarea id="note" name="note" rows={2} maxLength={500} className="field-input" placeholder="Régime alimentaire, accompagnant…" />
          </div>
          <button type="submit" className="btn btn-accent w-full" disabled={registering}>
            {registering ? "Inscription…" : seatsLeft === 0 ? "Rejoindre la liste d'attente" : "Je m'inscris"}
          </button>
        </form>
      )}

      {state && (
        <div className="mt-4">
          <FormMessage state={state} />
        </div>
      )}
    </div>
  );
}
