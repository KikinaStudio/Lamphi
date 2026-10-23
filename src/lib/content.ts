import type { PostCategory } from "./types";

// Les adresses reprennent celles du site Framer pour conserver le référencement.
export const POST_CATEGORIES: Record<
  PostCategory,
  { label: string; plural: string; basePath: string; description: string }
> = {
  decryptage: {
    label: "Décryptage",
    plural: "Décryptages",
    basePath: "/decryptage-list",
    description: "Analyse d'une actualité santé, avec ou sans vidéo.",
  },
  tribune: {
    label: "Tribune",
    plural: "Tribunes",
    basePath: "/la-plume",
    description: "Prise de parole d'un membre, publiée dans La Plume.",
  },
  interview: {
    label: "Interview",
    plural: "Interviews",
    basePath: "/la-plume",
    description: "Entretien avec un acteur de la santé, publié dans La Plume.",
  },
  actu: {
    label: "Actu du club",
    plural: "Actus du club",
    basePath: "/videos-club-list",
    description: "Vidéo ou reportage sur la vie du club.",
  },
  agenda: {
    label: "Agenda",
    plural: "Agenda",
    basePath: "/agenda-list",
    description: "Événement extérieur recommandé (salon, congrès…).",
  },
};

export const CATEGORY_ORDER: PostCategory[] = ["decryptage", "tribune", "interview", "actu", "agenda"];

export function postPath(post: { category: PostCategory; slug: string }) {
  return `${POST_CATEGORIES[post.category].basePath}/${encodeURIComponent(post.slug)}`;
}

export function eventPath(event: { slug: string }) {
  return `/evenements-de-amphi/${encodeURIComponent(event.slug)}`;
}

export function memberPath(member: { slug: string }) {
  return `/annuaire-des-membres/${encodeURIComponent(member.slug)}`;
}

// Les slugs importés de Framer contiennent des accents : on accepte les deux formes.
export function decodeSlug(slug: string) {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}
