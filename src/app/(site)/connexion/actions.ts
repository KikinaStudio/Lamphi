"use server";

import { redirect } from "next/navigation";
import { safeNextPath } from "@/lib/redirect";
import { getSiteUrl } from "@/lib/site-url";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { FormState } from "@/lib/types";
import { emailField } from "@/lib/validation";

const emailSchema = emailField();

export async function signIn(_previous: FormState, formData: FormData): Promise<FormState> {
  if (!isSupabaseConfigured) return { ok: false, message: "Mode démonstration : la connexion n'est pas disponible." };

  const email = emailSchema.safeParse(formData.get("email"));
  const password = String(formData.get("password") ?? "");
  const values = { email: String(formData.get("email") ?? "") };
  if (!email.success || !password) {
    return { ok: false, message: "Indiquez votre e-mail et votre mot de passe.", values };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: email.data, password });
  if (error) {
    return {
      ok: false,
      message:
        error.code === "invalid_credentials"
          ? "E-mail ou mot de passe incorrect."
          : "Connexion impossible pour le moment. Réessayez dans quelques instants.",
      values,
    };
  }

  redirect(safeNextPath(formData.get("next")));
}

// Lien de connexion par e-mail, sans mot de passe (uniquement pour les comptes existants).
export async function sendMagicLink(_previous: FormState, formData: FormData): Promise<FormState> {
  if (!isSupabaseConfigured) return { ok: false, message: "Mode démonstration : la connexion n'est pas disponible." };

  const email = emailSchema.safeParse(formData.get("email"));
  if (!email.success) return { ok: false, message: "Indiquez une adresse e-mail valide." };

  const next = safeNextPath(formData.get("next"));
  const supabase = await createClient();
  await supabase.auth.signInWithOtp({
    email: email.data,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: `${getSiteUrl()}/auth/confirm?next=${encodeURIComponent(next)}`,
    },
  });

  // Même réponse que le compte existe ou non.
  return { ok: true, message: "Si un compte membre existe pour cette adresse, un lien de connexion vient de vous être envoyé." };
}

export async function requestPasswordReset(_previous: FormState, formData: FormData): Promise<FormState> {
  if (!isSupabaseConfigured) return { ok: false, message: "Mode démonstration : indisponible." };

  const email = emailSchema.safeParse(formData.get("email"));
  if (!email.success) return { ok: false, message: "Indiquez une adresse e-mail valide." };

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email.data, {
    redirectTo: `${getSiteUrl()}/auth/confirm?next=/nouveau-mot-de-passe`,
  });

  return {
    ok: true,
    message: "Si un compte membre existe pour cette adresse, vous allez recevoir un lien pour choisir un nouveau mot de passe.",
  };
}
