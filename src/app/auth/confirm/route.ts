import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { safeNextPath } from "@/lib/redirect";
import { createClient } from "@/lib/supabase/server";

const OTP_TYPES: EmailOtpType[] = ["invite", "recovery", "email", "magiclink", "signup", "email_change"];

// Point d'arrivée des liens envoyés par e-mail (invitation, mot de passe, connexion).
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = safeNextPath(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    return redirectTo(request, error ? "/connexion?erreur=lien" : next);
  }

  if (tokenHash && type) {
    // Le jeton n'est pas consommé sur un simple GET : les antivirus de messagerie (Outlook,
    // Defender…) ouvrent les liens avant l'utilisateur. Une page demande de cliquer sur « Continuer ».
    const params = new URLSearchParams({ token_hash: tokenHash, type, next });
    return redirectTo(request, `/connexion/lien?${params}`);
  }

  return redirectTo(request, "/connexion?erreur=lien");
}

// Validation du lien après le clic sur « Continuer » (formulaire de /connexion/lien).
export async function POST(request: NextRequest) {
  const form = await request.formData();
  const tokenHash = String(form.get("token_hash") ?? "");
  const type = String(form.get("type") ?? "") as EmailOtpType;
  let next = safeNextPath(form.get("next"));

  if (!tokenHash || !OTP_TYPES.includes(type)) return redirectTo(request, "/connexion?erreur=lien");

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
  if (error) return redirectTo(request, "/connexion?erreur=lien");

  if (type === "invite") next = "/nouveau-mot-de-passe?bienvenue=1";
  if (type === "recovery") next = "/nouveau-mot-de-passe";
  return redirectTo(request, next);
}

function redirectTo(request: NextRequest, path: string) {
  // 303 : après un POST, le navigateur suit la redirection en GET.
  return NextResponse.redirect(new URL(path, request.nextUrl.origin), { status: 303 });
}
