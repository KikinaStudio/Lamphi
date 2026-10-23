// Textes fixes du site. Modifiez-les ici : ils sont repris sur toutes les pages.

export const site = {
  name: "L'Amphi",
  tagline: "Le club des leaders en santé",
  description:
    "L'Amphi est un espace unique, privé et confidentiel, dédié aux discussions stratégiques entre tous les acteurs de santé.",
  contactEmail: "contact@amphi-sante.com",
  // Lien vers la page LinkedIn du club (laisser vide pour masquer l'icône).
  linkedinUrl: "",
  founded: "9 décembre 2024, aux Serres d'Auteuil",
};

export const mainNav = [
  { href: "/le-club", label: "Le Club" },
  { href: "/decryptage-list", label: "Décryptages" },
  { href: "/la-plume", label: "La Plume" },
  { href: "/videos-club-list", label: "Actus du club" },
  { href: "/evenements-de-amphi", label: "Événements" },
  { href: "/a-propos", label: "À propos" },
];

export const memberNav = [
  { href: "/espace-membre", label: "Tableau de bord" },
  { href: "/annuaire-des-membres", label: "Annuaire" },
  { href: "/evenements-de-amphi", label: "Dîners & soirées" },
  { href: "/espace-membre/profil", label: "Mon profil" },
];

export const team = [
  { name: "Fabien Guez", role: "Fondateur", detail: "Cardiologue, médecin du sport et journaliste santé" },
  { name: "Delphine Sebah", role: "Responsable de la communication", detail: "" },
  { name: "Rémy Teston", role: "Directeur éditorial", detail: "" },
];

export const eligibility = {
  intro:
    "L'adhésion est strictement réservée aux Présidents, Directeurs Généraux, Comités Exécutifs, ou postes équivalents, disposant d'un pouvoir de décision global.",
  groups: [
    {
      title: "Entreprises",
      items: [
        "Laboratoires pharmaceutiques",
        "Mutuelles et assurances",
        "Medtechs",
        "Entreprises de biotechnologie",
        "Startups innovantes en santé",
        "Banques",
      ],
    },
    {
      title: "Institutions",
      items: ["Hôpitaux", "Agences de santé", "Instituts de recherche"],
    },
    {
      title: "Associations",
      items: ["Associations à but non lucratif en santé"],
    },
  ],
};

export const benefits = [
  {
    title: "4 dîners par an",
    text: "Des dîners-débats avec des personnalités de premier plan, dans la limite des places disponibles.",
  },
  {
    title: "L'annuaire des membres",
    text: "Retrouvez les dirigeants du club, leurs fonctions et leurs coordonnées.",
  },
  {
    title: "La programmation des événements",
    text: "Soirées thématiques, rencontres exclusives et invitations partenaires.",
  },
  {
    title: "La galerie photos des soirées",
    text: "Revivez chaque dîner en images, réservées aux membres.",
  },
  {
    title: "La Plume de l'Amphi",
    text: "Tribunes, interviews et regards d'experts : partagez votre expertise et votre vision.",
  },
  {
    title: "Les newsletters",
    text: "Décryptages exclusifs de l'actualité santé, réservés aux membres.",
  },
];

export const sectors = [
  "Industrie pharmaceutique",
  "Biotechnologie",
  "Medtech / dispositifs médicaux",
  "Mutuelle / assurance",
  "Établissement de santé public",
  "Établissement de santé privé",
  "Agence / institution publique",
  "Recherche",
  "Startup / e-santé",
  "Banque / finance",
  "Conseil / communication",
  "Association",
  "Autre",
];

export const organizationTypes = ["Entreprise", "Institution", "Association"];
