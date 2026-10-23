import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    // Les images sont servies telles quelles depuis Supabase Storage :
    // pas d'optimisation à la volée, donc pas de quota d'hébergeur à surveiller.
    unoptimized: true,
  },
  experimental: {
    serverActions: {
      // Le contenu HTML d'un long article peut dépasser la limite par défaut (1 Mo).
      bodySizeLimit: "4mb",
    },
  },
  async redirects() {
    return [
      // Anciennes adresses du site Framer
      { source: "/ev%C3%A8nements-de-l-amphi/:slug", destination: "/evenements-de-amphi/:slug", permanent: true },
      { source: "/decryptages", destination: "/decryptage-list", permanent: true },
      { source: "/actus", destination: "/videos-club-list", permanent: true },
      { source: "/annuaire", destination: "/annuaire-des-membres", permanent: true },
    ];
  },
};

export default nextConfig;
