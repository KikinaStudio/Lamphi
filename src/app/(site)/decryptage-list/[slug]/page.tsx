import { PostDetailPage, postMetadata } from "@/components/post-pages";

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
