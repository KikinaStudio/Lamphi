import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "./supabase/config";
import { createClient } from "./supabase/server";
import type { Profile } from "./types";

export type Viewer = {
  userId: string;
  email: string;
  profile: Profile | null;
};

export type Member = Viewer & { profile: Profile };

// Utilisateur connecté (ou null), lu une seule fois par requête.
export const getViewer = cache(async (): Promise<Viewer | null> => {
  if (!isSupabaseConfigured) return null;

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) return null;

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", claims.sub).maybeSingle();

  return { userId: claims.sub, email: (claims.email as string | undefined) ?? "", profile: profile as Profile | null };
});

export function isActiveMember(viewer: Viewer | null): viewer is Member {
  return Boolean(viewer?.profile && viewer.profile.status === "active");
}

export function isAdmin(viewer: Viewer | null): viewer is Member {
  return isActiveMember(viewer) && viewer.profile.role === "admin";
}

// À appeler en tête de chaque page / action réservée aux membres.
export async function requireMember(next = "/espace-membre"): Promise<Member> {
  const viewer = await getViewer();
  if (!viewer) redirect(`/connexion?next=${encodeURIComponent(next)}`);
  if (!isActiveMember(viewer)) redirect("/acces-refuse");
  return viewer;
}

export async function requireAdmin(next = "/admin"): Promise<Member> {
  const viewer = await requireMember(next);
  if (viewer.profile.role !== "admin") redirect("/acces-refuse");
  return viewer;
}
