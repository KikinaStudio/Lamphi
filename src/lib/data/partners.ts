import "server-only";
import { demoPartners } from "../demo";
import { isSupabaseConfigured } from "../supabase/config";
import { createClient } from "../supabase/server";
import type { Partner } from "../types";

export async function listPartners() {
  if (!isSupabaseConfigured) return demoPartners;
  const supabase = await createClient();
  const { data } = await supabase.from("partners").select("*").order("position").order("name");
  return (data ?? []) as Partner[];
}
