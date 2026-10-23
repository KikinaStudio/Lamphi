"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FormMessage } from "@/components/ui";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";
import type { FormState, RegistrationStatus } from "@/lib/types";

type Viewer = { isMember: boolean; status: RegistrationStatus | null; seatsLeft: number | null };

const GUEST: Viewer = { isMember: false, status: null, seatsLeft: null };

// État du visiteur pour cet événement, lu dans son navigateur (la page elle-même est en cache).
async function loadViewer(eventId: string): Promise<Viewer> {
  const supabase = createClient();
  const [{ data: session }, { data: seatsLeft }] = await Promise.all([
    supabase.auth.getSession(),
    supabase.rpc("event_seats_left", { p_event_id: eventId }),
  ]);
  const userId = session.session?.user.id;
  if (!userId) return { ...GUEST, seatsLeft: (seatsLeft as number | null) ?? null };

  const [{ data: profile }, { data: registration }] = await Promise.all([
    supabase.from("profiles").select("status").eq("id", userId).maybeSingle(),
    supabase.from("event_registrations").select("status").eq("event_id", eventId).eq("profile_id", userId).maybeSingle(),
  ]);
  return {
    isMember: profile?.status === "active",
    status: (registration?.status as RegistrationStatus | undefined) ?? null,
    seatsLeft: (seatsLeft as number | null) ?? null,
  };
}

// L'inscription passe par des fonctions SQL qui vérifient elles-mêmes que le compte est un membre actif.
export function RegistrationBox({
  eventId,
  eventPath,
  isPast,
  registrationOpen,
}: {
  eventId: string;
  eventPath: string;
  isPast: boolean;
  registrationOpen: boolean;
}) {
  const [viewer, setViewer] = useState<Viewer | null>(isSupabaseConfigured ? null : GUEST);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<FormState>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;
    loadViewer(eventId).then((loaded) => {
      if (!cancelled) setViewer(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  async function register(formData: FormData) {
    setPending(true);
    const note = String(formData.get("note") ?? "").trim();
    const { data, error } = await createClient().rpc("register_for_event", { p_event_id: eventId, p_note: note || null });
    setPending(false);
    setMessage(
      error
        ? { ok: false, message: error.message }
        : {
            ok: true,
            message:
              data === "waitlist"
                ? "Ce dîner est complet : vous êtes inscrit(e) sur liste d'attente. Nous vous préviendrons si une place se libère."
                : "Votre inscription est confirmée. À très bientôt !",
          },
    );
    setViewer(await loadViewer(eventId));
  }

  async function cancel() {
    setPending(true);
    const { error } = await createClient().rpc("cancel_event_registration", { p_event_id: eventId });
    setPending(false);
    setMessage(error ? { ok: false, message: error.message } : { ok: true, message: "Votre inscription a bien été annulée." });
    setViewer(await loadViewer(eventId));
  }

  const isRegistered = viewer?.status === "registered" || viewer?.status === "waitlist";

  return (
    <div className="card p-6">
      <h2 className="text-2xl">Inscription</h2>

      {isPast ? (
        <p className="mt-3 text-muted">Cet événement a eu lieu. Les membres retrouvent la galerie photos sur cette page.</p>
      ) : !registrationOpen ? (
        <p className="mt-3 text-muted">Les inscriptions ne sont pas ouvertes pour le moment.</p>
      ) : viewer === null ? (
        <div aria-busy className="mt-4 h-11 animate-pulse rounded-full bg-line" />
      ) : !viewer.isMember ? (
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
          <p
            className={`mt-3 rounded-lg px-4 py-3 text-sm ${
              viewer.status === "registered" ? "bg-success/10 text-success" : "bg-accent-soft text-accent-strong"
            }`}
          >
            {viewer.status === "registered" ? "Vous êtes inscrit(e) à ce dîner." : "Vous êtes sur liste d'attente."}
          </p>
          <form action={cancel} className="mt-4">
            <button type="submit" className="btn btn-outline w-full" disabled={pending}>
              {pending ? "Annulation…" : "Annuler mon inscription"}
            </button>
          </form>
        </>
      ) : (
        <form action={register} className="mt-4 space-y-4">
          {viewer.seatsLeft !== null && (
            <p className="text-sm text-muted">
              {viewer.seatsLeft > 0
                ? `${viewer.seatsLeft} place${viewer.seatsLeft > 1 ? "s" : ""} restante${viewer.seatsLeft > 1 ? "s" : ""}`
                : "Complet — inscription possible sur liste d'attente"}
            </p>
          )}
          <div>
            <label htmlFor="note" className="field-label">
              Message (facultatif)
            </label>
            <textarea id="note" name="note" rows={2} maxLength={500} className="field-input" placeholder="Régime alimentaire, accompagnant…" />
          </div>
          <button type="submit" className="btn btn-accent w-full" disabled={pending}>
            {pending ? "Inscription…" : viewer.seatsLeft === 0 ? "Rejoindre la liste d'attente" : "Je m'inscris"}
          </button>
        </form>
      )}

      {message && (
        <div className="mt-4">
          <FormMessage state={message} />
        </div>
      )}
    </div>
  );
}
