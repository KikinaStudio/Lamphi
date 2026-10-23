import "server-only";
import { site } from "@/content/site";

// E-mails transactionnels hors Supabase Auth (notification de candidature, refus…).
// Envoyés via Resend si RESEND_API_KEY est définie ; sinon ignorés sans erreur.
export async function sendEmail({ to, subject, html }: { to: string | string[]; subject: string; html: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM ?? `${site.name} <${site.contactEmail}>`,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
      }),
    });
    if (!response.ok) console.error("Envoi d'e-mail refusé", response.status, await response.text());
    return response.ok;
  } catch (error) {
    console.error("Envoi d'e-mail impossible", error);
    return false;
  }
}

export function adminNotificationEmails() {
  return (process.env.ADMIN_NOTIFICATION_EMAIL ?? "")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);
}

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
