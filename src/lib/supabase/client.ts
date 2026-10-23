import { createBrowserClient } from "@supabase/ssr";
import { supabasePublishableKey, supabaseUrl } from "./config";

// Client navigateur : envoi d'images vers le stockage, définition du mot de passe.
export function createClient() {
  return createBrowserClient(supabaseUrl, supabasePublishableKey);
}
