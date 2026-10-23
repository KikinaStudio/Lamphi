"use server";

import { revalidatePath } from "next/cache";
import { requireMember } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { FormState } from "@/lib/types";

export async function registerForEvent(
  eventId: string,
  eventPath: string,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireMember(eventPath);
  const supabase = await createClient();
  const note = String(formData.get("note") ?? "").trim();

  const { data, error } = await supabase.rpc("register_for_event", { p_event_id: eventId, p_note: note || null });
  if (error) return { ok: false, message: error.message };

  revalidatePath(eventPath);
  revalidatePath("/espace-membre");
  return {
    ok: true,
    message:
      data === "waitlist"
        ? "Ce dîner est complet : vous êtes inscrit(e) sur liste d'attente. Nous vous préviendrons si une place se libère."
        : "Votre inscription est confirmée. À très bientôt !",
  };
}

export async function cancelRegistration(eventId: string, eventPath: string): Promise<FormState> {
  await requireMember(eventPath);
  const supabase = await createClient();

  const { error } = await supabase.rpc("cancel_event_registration", { p_event_id: eventId });
  if (error) return { ok: false, message: error.message };

  revalidatePath(eventPath);
  revalidatePath("/espace-membre");
  return { ok: true, message: "Votre inscription a bien été annulée." };
}
