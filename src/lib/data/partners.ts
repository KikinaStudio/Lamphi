import "server-only";
import { demoPartners } from "../demo";
import { isSupabaseConfigured } from "../supabase/config";
import { createPublicClient } from "../supabase/public";
import type { Partner } from "../types";

export async function listPartners() {
  if (!isSupabaseConfigured) return demoPartners;
  const { data, error } = await createPublicClient().from("partners").select("*").order("position").order("name");
  if (error) throw error;
  return (data ?? []) as Partner[];
}
