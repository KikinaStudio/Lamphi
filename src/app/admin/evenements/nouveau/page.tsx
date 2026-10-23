import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { AdminHeader, BackLink } from "../../ui";
import { EventForm } from "../event-form";

export const metadata: Metadata = { title: "Nouvel événement" };

export default async function NewEventPage() {
  await requireAdmin("/admin/evenements/nouveau");
  return (
    <>
      <BackLink href="/admin/evenements">Événements</BackLink>
      <AdminHeader title="Nouvel événement" />
      <EventForm />
    </>
  );
}
