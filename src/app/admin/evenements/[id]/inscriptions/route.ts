import { NextResponse, type NextRequest } from "next/server";
import { getViewer, isAdmin } from "@/lib/auth";
import { formatDate, slugify } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { EventRegistration, Profile } from "@/lib/types";

const STATUS_LABELS = { registered: "Inscrit", waitlist: "Liste d'attente", cancelled: "Annulé" } as const;

// Export des inscriptions au format CSV (ouvrable dans Excel).
export async function GET(_request: NextRequest, { params }: RouteContext<"/admin/evenements/[id]/inscriptions">) {
  const viewer = await getViewer();
  if (!isAdmin(viewer)) return new NextResponse("Accès refusé", { status: 403 });

  const { id } = await params;
  const supabase = await createClient();
  const [{ data: event }, { data }] = await Promise.all([
    supabase.from("events").select("title, slug").eq("id", id).maybeSingle(),
    supabase
      .from("event_registrations")
      .select("*, profiles(first_name, last_name, email, phone, company, job_title)")
      .eq("event_id", id)
      .order("created_at"),
  ]);
  if (!event) return new NextResponse("Événement introuvable", { status: 404 });

  const rows = (data ?? []) as (EventRegistration & {
    profiles: Pick<Profile, "first_name" | "last_name" | "email" | "phone" | "company" | "job_title"> | null;
  })[];

  const header = ["Prénom", "Nom", "E-mail", "Téléphone", "Organisation", "Fonction", "Statut", "Message", "Date d'inscription"];
  const lines = rows.map((row) => [
    row.profiles?.first_name,
    row.profiles?.last_name,
    row.profiles?.email,
    row.profiles?.phone,
    row.profiles?.company,
    row.profiles?.job_title,
    STATUS_LABELS[row.status],
    row.note,
    formatDate(row.created_at),
  ]);

  // Point-virgule + BOM : format attendu par Excel en français.
  const csv = [header, ...lines].map((line) => line.map(csvCell).join(";")).join("\r\n");
  return new NextResponse(`﻿${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="inscriptions-${slugify(event.slug) || "evenement"}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}

function csvCell(value: string | null | undefined) {
  let text = (value ?? "").replace(/"/g, '""');
  // Empêche Excel d'interpréter une cellule comme une formule.
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text}"`;
}
