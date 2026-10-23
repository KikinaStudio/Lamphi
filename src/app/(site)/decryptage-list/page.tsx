import type { Metadata } from "next";
import { PostListPage } from "@/components/post-pages";

// Page en cache, régénérée au plus toutes les 5 minutes et dès qu'un contenu change dans le back-office.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Décryptages",
  description: "Plongez dans nos décryptages pour analyser les dernières avancées et actualités médicales.",
};

export default function DecryptagesPage() {
  return (
    <PostListPage
      categories={["decryptage"]}
      eyebrow="Analyses"
      title="Décryptages"
      intro="Plongez dans nos décryptages pour analyser les dernières avancées et actualités médicales, avec l'éclairage des leaders du secteur."
    />
  );
}
