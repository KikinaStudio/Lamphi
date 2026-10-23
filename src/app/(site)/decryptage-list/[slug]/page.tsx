import { PostDetailPage, postMetadata } from "@/components/post-pages";

// Page en cache, régénérée au plus toutes les 5 minutes et dès qu'un contenu change dans le back-office.
export const revalidate = 300;

// Aucune page générée au build : chaque article est rendu à sa première visite puis mis en cache.
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: PageProps<"/decryptage-list/[slug]">) {
  return postMetadata((await params).slug, ["decryptage"]);
}

export default async function DecryptagePage({ params }: PageProps<"/decryptage-list/[slug]">) {
  return (
    <PostDetailPage
      slug={(await params).slug}
      categories={["decryptage"]}
      backHref="/decryptage-list"
      backLabel="Tous les décryptages"
    />
  );
}
