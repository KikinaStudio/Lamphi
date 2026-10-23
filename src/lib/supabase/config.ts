// Variables publiques : lues côté serveur et intégrées au bundle navigateur.
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

// Clé « publishable » (nouveau format) ou ancienne clé « anon » : les deux fonctionnent.
export const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

// Sans Supabase configuré, le site tourne en mode démo (contenus d'exemple, pas de comptes).
export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

export const MEDIA_BUCKET = "media";
