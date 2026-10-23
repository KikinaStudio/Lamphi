import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Uniquement les pages réservées : les pages publiques, en cache, ne déclenchent aucun calcul.
  // Ailleurs, la session est rafraîchie par le navigateur (et par les actions serveur si besoin).
  matcher: ["/espace-membre/:path*", "/annuaire-des-membres/:path*", "/admin/:path*"],
};
