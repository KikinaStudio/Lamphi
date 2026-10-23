import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/espace-membre", "/annuaire-des-membres", "/auth", "/connexion", "/nouveau-mot-de-passe"],
    },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
