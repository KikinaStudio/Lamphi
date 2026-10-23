import "server-only";
import { createClient } from "../supabase/server";
import type { DirectoryMember } from "../types";

// Filtre « contient » sur plusieurs colonnes. La valeur est entre guillemets pour que
// les caractères réservés de PostgREST (virgule, point, parenthèses) restent du texte.
export function searchFilter(columns: string[], query: string) {
  const term = query.replace(/["\\%*]/g, " ").trim();
  return columns.map((column) => `${column}.ilike."%${term}%"`).join(",");
}

export async function listDirectory({ query, sector }: { query?: string; sector?: string }) {
  const supabase = await createClient();
  let request = supabase.from("member_directory").select("*").order("last_name").order("first_name");

  if (sector) request = request.eq("sector", sector);
  if (query) {
    request = request.or(searchFilter(["first_name", "last_name", "company", "job_title"], query));
  }

  const { data, error } = await request;
  if (error) throw error;
  return (data ?? []) as DirectoryMember[];
}

export async function getDirectoryMember(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("member_directory").select("*").eq("slug", slug).maybeSingle();
  return data as DirectoryMember | null;
}

export async function countMembers() {
  const supabase = await createClient();
  const { count } = await supabase.from("member_directory").select("id", { count: "exact", head: true });
  return count ?? 0;
}
