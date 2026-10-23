"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";

// État de connexion lu dans le navigateur : l'en-tête ne rend pas les pages publiques
// dynamiques. Purement visuel — l'accès aux pages réservées est contrôlé côté serveur.
export function AccountLinks() {
  const [signedIn, setSignedIn] = useState(false);
  const pathname = usePathname();

  // Relu à chaque page : la connexion se fait côté serveur, sans événement dans le navigateur.
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;
    createClient()
      .auth.getSession()
      .then(({ data }) => {
        if (!cancelled) setSignedIn(Boolean(data.session));
      });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const { data } = createClient().auth.onAuthStateChange((_event, session) => setSignedIn(Boolean(session)));
    return () => data.subscription.unsubscribe();
  }, []);

  if (signedIn) {
    return (
      <Link href="/espace-membre" className="btn btn-primary btn-sm whitespace-nowrap">
        Espace membre
      </Link>
    );
  }
  return (
    <>
      <Link href="/connexion" className="hidden text-sm font-medium text-ink-soft hover:text-accent-strong sm:inline">
        Connexion
      </Link>
      {/* Sur petit écran, l'appel à l'action est dans le menu mobile. */}
      <Link href="/devenir-membre" className="btn btn-accent btn-sm hidden whitespace-nowrap sm:inline-flex">
        Devenir membre
      </Link>
    </>
  );
}
