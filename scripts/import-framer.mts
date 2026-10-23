/*
  Import des contenus et des membres exportés depuis le CMS de Framer (fichiers CSV).

  Dans Framer : CMS > ouvrir la collection > menu « … » > Export CSV.

  Exemples :
    npm run import:framer -- --file decryptages.csv --type posts --category decryptage
    npm run import:framer -- --file decryptages.csv --type posts --category decryptage --apply --copy-images
    npm run import:framer -- --file annuaire.csv --type members --apply

  Sans --apply, rien n'est écrit : le script affiche ce qu'il ferait (colonnes reconnues, aperçu).
  Les variables NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SECRET_KEY sont lues dans .env.local.
*/
import { existsSync, readFileSync } from "node:fs";
import { parseArgs } from "node:util";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import Papa from "papaparse";
import { slugify } from "../src/lib/format";
import { sanitizeRichText, stripHtml } from "../src/lib/sanitize";

const CATEGORIES = ["decryptage", "tribune", "interview", "actu", "agenda"] as const;
type Category = (typeof CATEGORIES)[number];

// Noms de colonnes reconnus automatiquement (comparaison sans accents ni majuscules).
const POST_COLUMNS: Record<string, string[]> = {
  title: ["title", "titre", "name", "nom"],
  slug: ["slug"],
  excerpt: ["excerpt", "resume", "description", "chapo", "subtitle", "sous-titre", "sous titre", "intro", "accroche"],
  content: ["content", "contenu", "body", "texte", "text", "article", "corps"],
  cover: ["image", "cover", "couverture", "thumbnail", "miniature", "visuel", "photo", "image de couverture"],
  date: ["date", "published", "publication", "date de publication", "published at", "publie le"],
  video: ["video", "youtube", "lien video", "video url", "url video"],
  author: ["author", "auteur", "signature", "interviewe", "invite"],
  authorTitle: ["author title", "fonction", "poste", "titre auteur", "entreprise"],
  eventDate: ["event date", "date evenement", "date de l'evenement", "quand"],
  location: ["location", "lieu", "ville", "adresse"],
  link: ["link", "lien", "url", "site", "site web", "website"],
  members: ["members only", "reserve aux membres", "membres", "prive", "private"],
};

const MEMBER_COLUMNS: Record<string, string[]> = {
  email: ["email", "e-mail", "mail", "adresse email", "adresse e-mail"],
  firstName: ["first name", "prenom", "firstname"],
  lastName: ["last name", "nom de famille", "lastname", "nom"],
  fullName: ["name", "full name", "nom complet", "title", "titre"],
  jobTitle: ["job", "job title", "fonction", "poste", "role"],
  company: ["company", "entreprise", "organisation", "societe", "structure"],
  sector: ["sector", "secteur", "categorie", "category", "tag"],
  phone: ["phone", "telephone", "tel", "mobile"],
  linkedin: ["linkedin", "linkedin url", "profil linkedin"],
  website: ["website", "site", "site web"],
  bio: ["bio", "biographie", "presentation", "description", "about"],
  photo: ["photo", "image", "avatar", "portrait", "picture"],
  slug: ["slug"],
};

const { values: args } = parseArgs({
  options: {
    file: { type: "string" },
    type: { type: "string" },
    category: { type: "string" },
    map: { type: "string" },
    visibility: { type: "string" },
    apply: { type: "boolean", default: false },
    "copy-images": { type: "boolean", default: false },
    "send-links": { type: "boolean", default: false },
  },
});

function fail(message: string): never {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
}

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[_]+/g, " ")
    .trim();

function detectColumns(headers: string[], known: Record<string, string[]>) {
  const overrides = Object.fromEntries(
    (args.map ?? "")
      .split(",")
      .filter(Boolean)
      .map((pair) => pair.split("=").map((part) => part.trim())),
  );
  const mapping: Record<string, string | undefined> = {};
  const used = new Set<string>();
  for (const [field, synonyms] of Object.entries(known)) {
    if (overrides[field]) {
      if (!headers.includes(overrides[field])) fail(`Colonne « ${overrides[field]} » introuvable dans le fichier.`);
      mapping[field] = overrides[field];
      used.add(overrides[field]);
      continue;
    }
    mapping[field] = headers.find((header) => !used.has(header) && synonyms.includes(normalize(header)));
    if (mapping[field]) used.add(mapping[field]!);
  }
  return mapping;
}

function loadCsv(path: string) {
  if (!existsSync(path)) fail(`Fichier introuvable : ${path}`);
  const parsed = Papa.parse<Record<string, string>>(readFileSync(path, "utf8"), { header: true, skipEmptyLines: true });
  if (parsed.errors.length) console.warn("Avertissements de lecture CSV :", parsed.errors.slice(0, 3));
  return { rows: parsed.data, headers: parsed.meta.fields ?? [] };
}

function supabase() {
  if (existsSync(".env.local")) process.loadEnvFile(".env.local");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) fail("NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SECRET_KEY doivent être définies dans .env.local.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function parseDate(value: string | undefined) {
  if (!value) return null;
  const trimmed = value.trim();
  const french = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  const date = french ? new Date(`${french[3]}-${french[2].padStart(2, "0")}-${french[1].padStart(2, "0")}T12:00:00Z`) : new Date(trimmed);
  return Number.isNaN(date.getTime()) ? null : date;
}

const truthy = (value: string | undefined) => ["true", "oui", "yes", "1", "x", "vrai"].includes(normalize(value ?? ""));

// Copie une image hébergée chez Framer dans Supabase Storage (le site Framer pourra être supprimé).
const copiedImages = new Map<string, string>();
async function copyImage(client: SupabaseClient, url: string, folder: string) {
  if (!args["copy-images"] || !url.startsWith("http")) return url;
  if (copiedImages.has(url)) return copiedImages.get(url)!;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const contentType = response.headers.get("content-type") ?? "image/jpeg";
    const extension = contentType.split("/")[1]?.split(";")[0]?.replace("jpeg", "jpg").replace("svg+xml", "svg") ?? "jpg";
    const path = `imports/${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;
    const { error } = await client.storage
      .from("media")
      .upload(path, Buffer.from(await response.arrayBuffer()), { contentType, cacheControl: "31536000" });
    if (error) throw error;
    const publicUrl = client.storage.from("media").getPublicUrl(path).data.publicUrl;
    copiedImages.set(url, publicUrl);
    return publicUrl;
  } catch (error) {
    console.warn(`  ⚠ Image non copiée (${url}) : ${error instanceof Error ? error.message : error}`);
    return url;
  }
}

async function copyImagesInHtml(client: SupabaseClient, html: string, folder: string) {
  if (!args["copy-images"]) return html;
  let result = html;
  for (const [, src] of html.matchAll(/<img[^>]+src="([^"]+)"/g)) {
    result = result.replaceAll(src, await copyImage(client, src, folder));
  }
  return result;
}

async function importPosts() {
  const category = args.category as Category;
  if (!CATEGORIES.includes(category)) fail(`--category doit valoir : ${CATEGORIES.join(", ")}`);

  const { rows, headers } = loadCsv(args.file!);
  const columns = detectColumns(headers, POST_COLUMNS);
  console.log("\nColonnes reconnues :", columns);
  if (!columns.title) fail("Aucune colonne de titre reconnue. Indiquez-la avec --map title=NomDeLaColonne");

  const client = args.apply ? supabase() : null;
  let imported = 0;
  for (const row of rows) {
    const get = (field: string) => (columns[field] ? row[columns[field]!]?.trim() : undefined) || undefined;
    const title = get("title");
    if (!title) continue;

    const date = parseDate(get("date")) ?? new Date();
    const rawContent = get("content") ?? "";
    // Le slug Framer est conservé pour garder les mêmes adresses (référencement, liens existants).
    const slug = (get("slug") ?? slugify(title)).normalize("NFC");
    const record = {
      slug,
      category,
      title,
      excerpt: get("excerpt") ? stripHtml(get("excerpt")!).slice(0, 1000) : null,
      content_html: sanitizeRichText(rawContent.includes("<") ? rawContent : rawContent.split(/\n{2,}/).map((p) => `<p>${p}</p>`).join("")),
      cover_url: get("cover") ?? null,
      video_url: get("video") ?? null,
      author_name: get("author") ?? null,
      author_title: get("authorTitle") ?? null,
      event_date: category === "agenda" ? (parseDate(get("eventDate") ?? get("date"))?.toISOString().slice(0, 10) ?? null) : null,
      location: get("location") ?? null,
      external_url: get("link") ?? null,
      visibility: args.visibility === "members" || truthy(get("members")) ? "members" : "public",
      status: "published",
      published_at: date.toISOString(),
    };

    if (!client) {
      console.log(`• [aperçu] ${record.published_at.slice(0, 10)}  ${title}  →  /${slug}`);
      continue;
    }

    if (record.cover_url) record.cover_url = await copyImage(client, record.cover_url, "covers");
    record.content_html = await copyImagesInHtml(client, record.content_html, "articles");

    const { error } = await client.from("posts").upsert(record, { onConflict: "slug" });
    if (error) console.error(`✖ ${title} : ${error.message}`);
    else {
      imported += 1;
      console.log(`✔ ${title}`);
    }
  }
  console.log(args.apply ? `\n${imported} contenu(s) importé(s).` : "\nAperçu uniquement. Relancez avec --apply pour importer.");
}

async function importMembers() {
  const { rows, headers } = loadCsv(args.file!);
  const columns = detectColumns(headers, MEMBER_COLUMNS);
  console.log("\nColonnes reconnues :", columns);
  if (!columns.email) fail("Aucune colonne d'e-mail reconnue. Indiquez-la avec --map email=NomDeLaColonne");

  const client = args.apply ? supabase() : null;
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  let imported = 0;

  for (const row of rows) {
    const get = (field: string) => (columns[field] ? row[columns[field]!]?.trim() : undefined) || undefined;
    const email = get("email")?.toLowerCase();
    if (!email || !email.includes("@")) continue;

    let firstName = get("firstName") ?? "";
    let lastName = get("lastName") ?? "";
    if (!firstName && !lastName && get("fullName")) {
      const [first, ...rest] = get("fullName")!.split(/\s+/);
      firstName = first;
      lastName = rest.join(" ");
    }
    const slug = slugify(get("slug") ?? `${firstName} ${lastName}`) || slugify(email);

    if (!client) {
      console.log(`• [aperçu] ${firstName} ${lastName} <${email}> — ${get("company") ?? ""}  →  /annuaire-des-membres/${slug}`);
      continue;
    }

    // Compte confirmé sans mot de passe : aucun e-mail n'est envoyé à ce stade.
    let userId: string | undefined;
    const { data: created, error: createError } = await client.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { first_name: firstName, last_name: lastName },
    });
    if (created?.user) userId = created.user.id;
    else {
      const { data: existingId } = await client.rpc("find_auth_user_id", { p_email: email });
      userId = (existingId as string | null) ?? undefined;
      if (!userId) {
        console.error(`✖ ${email} : ${createError?.message}`);
        continue;
      }
    }

    const photo = get("photo") ? await copyImage(client, get("photo")!, `avatars/${userId}`) : null;
    const { error } = await client.from("profiles").upsert(
      {
        id: userId,
        email,
        slug,
        first_name: firstName,
        last_name: lastName,
        job_title: get("jobTitle") ?? null,
        company: get("company") ?? null,
        sector: get("sector") ?? null,
        phone: get("phone") ?? null,
        linkedin_url: get("linkedin") ?? null,
        website_url: get("website") ?? null,
        bio: get("bio") ? stripHtml(get("bio")!).slice(0, 3000) : null,
        photo_url: photo,
      },
      { onConflict: "id" },
    );
    if (error) {
      console.error(`✖ ${email} : ${error.message}${error.code === "23505" ? " (slug déjà utilisé)" : ""}`);
      continue;
    }

    if (args["send-links"]) {
      const { error: linkError } = await client.auth.resetPasswordForEmail(email, { redirectTo: `${siteUrl}/nouveau-mot-de-passe` });
      if (linkError) console.warn(`  ⚠ Lien non envoyé à ${email} : ${linkError.message}`);
    }

    imported += 1;
    console.log(`✔ ${firstName} ${lastName} <${email}>`);
  }

  console.log(
    args.apply
      ? `\n${imported} membre(s) importé(s).${args["send-links"] ? "" : " Ils pourront choisir leur mot de passe via « Mot de passe oublié » ou un lien envoyé depuis le back-office."}`
      : "\nAperçu uniquement. Relancez avec --apply pour importer.",
  );
}

if (!args.file) fail("Indiquez le fichier CSV avec --file chemin/vers/export.csv");
if (args.type === "posts") await importPosts();
else if (args.type === "members") await importMembers();
else fail("Indiquez --type posts ou --type members");
