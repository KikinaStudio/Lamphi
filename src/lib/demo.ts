import type { ClubEvent, Partner, PostTeaser } from "./types";

// Contenus d'exemple affichés tant que Supabase n'est pas configuré (aperçu du design).
// Ils disparaissent automatiquement dès que les variables NEXT_PUBLIC_SUPABASE_* sont définies.

const daysFromNow = (days: number, hour = 20) => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  date.setUTCHours(hour - 2, 0, 0, 0);
  return date.toISOString();
};

const teaser = (partial: Partial<PostTeaser> & Pick<PostTeaser, "id" | "slug" | "category" | "title">): PostTeaser => ({
  excerpt: null,
  cover_url: null,
  video_url: null,
  author_name: null,
  author_title: null,
  event_date: null,
  location: null,
  external_url: null,
  visibility: "public",
  published_at: daysFromNow(-7),
  ...partial,
});

export const demoPosts: PostTeaser[] = [
  teaser({
    id: "demo-1",
    slug: "desinformation-en-sante-l-etat-lance-un-observatoire",
    category: "decryptage",
    title: "Désinformation en santé : l'État lance un Observatoire pour rétablir la confiance",
    excerpt: "Trois experts missionnés pour proposer des réponses à la désinformation sanitaire.",
    published_at: daysFromNow(-3),
  }),
  teaser({
    id: "demo-2",
    slug: "le-medef-devoile-ses-propositions",
    category: "decryptage",
    title: "Le MEDEF dévoile ses propositions pour refonder le système de santé français",
    excerpt: "Un décryptage exclusif sur les impacts pour le monde de la santé.",
    visibility: "members",
    published_at: daysFromNow(-10),
  }),
  teaser({
    id: "demo-3",
    slug: "feminisation-de-la-medecine",
    category: "decryptage",
    title: "Féminisation de la médecine : la profession a changé de visage",
    excerpt: "Ce que la démographie médicale dit de l'organisation des soins de demain.",
    published_at: daysFromNow(-14),
  }),
  teaser({
    id: "demo-4",
    slug: "tribune-imagerie-medicale",
    category: "tribune",
    title: "Partager l'expertise médicale, partout et en temps réel",
    excerpt: "Une tribune de membre publiée dans La Plume de l'Amphi.",
    author_name: "Emilie Mercadal",
    author_title: "Rofim",
    published_at: daysFromNow(-5),
  }),
  teaser({
    id: "demo-5",
    slug: "interview-ia-europeenne-en-sante",
    category: "interview",
    title: "L'IA européenne en santé : entretien avec Antoine Tesnière",
    excerpt: "Souveraineté, données et usages cliniques : les enjeux d'une IA européenne.",
    author_name: "Antoine Tesnière",
    published_at: daysFromNow(-9),
  }),
  teaser({
    id: "demo-6",
    slug: "soiree-de-lancement",
    category: "actu",
    title: "Soirée de lancement de L'Amphi aux Serres d'Auteuil",
    excerpt: "Retour en images sur la soirée de lancement du club.",
    published_at: daysFromNow(-20),
  }),
  teaser({
    id: "demo-7",
    slug: "digital-hopital-lab",
    category: "agenda",
    title: "Digital Hôpital Lab",
    excerpt: "Le rendez-vous de la transformation numérique des établissements de santé.",
    event_date: daysFromNow(30).slice(0, 10),
    location: "Paris",
  }),
];

export const demoEvents: ClubEvent[] = [
  {
    id: "demo-e1",
    slug: "diner-prevention-nutrition-activite-physique",
    title: "Prévention, nutrition et activité physique",
    excerpt: "Un dîner-débat consacré à la prévention par le sport et l'alimentation.",
    content_html: "<p>Inscriptions réservées en priorité aux membres de L'Amphi.</p>",
    cover_url: null,
    starts_at: daysFromNow(18),
    ends_at: null,
    location: "Lagardère Paris Racing",
    address: "Paris 16e",
    capacity: 60,
    registration_open: true,
    status: "published",
    created_at: daysFromNow(-30),
    updated_at: daysFromNow(-30),
  },
  {
    id: "demo-e2",
    slug: "cancer-les-raisons-d-esperer",
    title: "Cancer : les raisons d'espérer",
    excerpt: "Une soirée avec des cliniciens et des chercheurs autour des avancées thérapeutiques.",
    content_html: "",
    cover_url: null,
    starts_at: daysFromNow(46),
    ends_at: null,
    location: "Paris",
    address: null,
    capacity: null,
    registration_open: true,
    status: "published",
    created_at: daysFromNow(-30),
    updated_at: daysFromNow(-30),
  },
  {
    id: "demo-e3",
    slug: "medecine-le-futur-est-deja-la",
    title: "Médecine, le futur est déjà là",
    excerpt: "Dîner autour de l'innovation médicale.",
    content_html: "",
    cover_url: null,
    starts_at: daysFromNow(-40),
    ends_at: null,
    location: "Paris",
    address: null,
    capacity: null,
    registration_open: false,
    status: "published",
    created_at: daysFromNow(-80),
    updated_at: daysFromNow(-80),
  },
];

export const demoPartners: Partner[] = [
  { id: "demo-p1", name: "Festival de la Communication Santé", logo_url: null, website_url: null, position: 0, created_at: "" },
  { id: "demo-p2", name: "Benta Lyon", logo_url: null, website_url: null, position: 1, created_at: "" },
];
