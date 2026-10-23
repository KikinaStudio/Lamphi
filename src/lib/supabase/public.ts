import { createClient } from "@supabase/supabase-js";
import { supabasePublishableKey, supabaseUrl } from "./config";

// Client anonyme, sans cookies : il ne lit que ce qui est public. Les pages qui l'utilisent
// restent statiques et sont servies depuis le cache de l'hébergeur, sans calcul serveur
// à chaque visite (c'est ce qui permet de rester dans l'offre gratuite).
export function createPublicClient() {
  return createClient(supabaseUrl, supabasePublishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
