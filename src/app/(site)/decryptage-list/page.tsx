import type { Metadata } from "next";
import { PostListPage } from "@/components/post-pages";

export const metadata: Metadata = {
  title: "Décryptages",
  description: "Plongez dans nos décryptages pour analyser les dernières avancées et actualités médicales.",
};

export default function DecryptagesPage({ searchParams }: PageProps<"/decryptage-list">) {
  return (
    <PostListPage
      categories={["decryptage"]}
      eyebrow="Analyses"
      title="Décryptages"
      intro="Plongez dans nos décryptages pour analyser les dernières avancées et actualités médicales, avec l'éclairage des leaders du secteur."
      basePath="/decryptage-list"
      searchParams={searchParams}
    />
  );
}
