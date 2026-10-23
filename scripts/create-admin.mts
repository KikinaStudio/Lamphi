/*
  Crée (ou promeut) un compte administrateur.

    npm run create-admin -- --email prenom.nom@amphi-sante.com --first-name Prénom --last-name Nom

  Le compte reçoit un e-mail pour choisir son mot de passe. Variables lues dans .env.local :
  NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY, NEXT_PUBLIC_SITE_URL.
*/
import { existsSync } from "node:fs";
import { parseArgs } from "node:util";
import { createClient } from "@supabase/supabase-js";
import { slugify } from "../src/lib/format";

const { values: args } = parseArgs({
  options: {
    email: { type: "string" },
    "first-name": { type: "string" },
    "last-name": { type: "string" },
  },
});

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const email = args.email?.trim().toLowerCase();
const firstName = args["first-name"]?.trim() ?? "";
const lastName = args["last-name"]?.trim() ?? "";

if (!url || !key) throw new Error("NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SECRET_KEY doivent être définies dans .env.local.");
if (!email) throw new Error("Indiquez --email");

const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

let userId: string;
const { data: invited } = await client.auth.admin.inviteUserByEmail(email, {
  redirectTo: `${siteUrl}/nouveau-mot-de-passe?bienvenue=1`,
});
if (invited?.user) {
  userId = invited.user.id;
  console.log(`✔ Invitation envoyée à ${email}`);
} else {
  const { data: existingId } = await client.rpc("find_auth_user_id", { p_email: email });
  if (!existingId) throw new Error(`Impossible de créer le compte ${email}.`);
  userId = existingId as string;
  await client.auth.resetPasswordForEmail(email, { redirectTo: `${siteUrl}/nouveau-mot-de-passe` });
  console.log(`✔ Compte existant : lien de mot de passe envoyé à ${email}`);
}

const { data: profile } = await client.from("profiles").select("id").eq("id", userId).maybeSingle();
const { error } = profile
  ? await client.from("profiles").update({ role: "admin", status: "active" }).eq("id", userId)
  : await client.from("profiles").insert({
      id: userId,
      email,
      slug: slugify(`${firstName} ${lastName}`) || slugify(email),
      first_name: firstName,
      last_name: lastName,
      role: "admin",
    });
if (error) throw new Error(error.message);
console.log(`✔ ${email} est administrateur. Back-office : ${siteUrl}/admin`);
