import "server-only";
import { createClient } from "@supabase/supabase-js";
import { supabaseUrl } from "./config";

// Client « clé secrète » : contourne la RLS. À n'utiliser que dans des actions serveur
// qui ont déjà vérifié que l'utilisateur est administrateur (voir requireAdmin).
export function createAdminClient() {
  const secretKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !secretKey) {
    throw new Error("SUPABASE_SECRET_KEY n'est pas configurée : impossible d'inviter ou de gérer les comptes.");
  }
  return createClient(supabaseUrl, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
