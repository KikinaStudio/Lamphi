import { PostDetailPage, postMetadata } from "@/components/post-pages";

export async function generateMetadata({ params }: PageProps<"/videos-club-list/[slug]">) {
  return postMetadata((await params).slug, ["actu"]);
}

export default async function ActuPage({ params }: PageProps<"/videos-club-list/[slug]">) {
  return (
    <PostDetailPage
      slug={(await params).slug}
      categories={["actu"]}
      backHref="/videos-club-list"
      backLabel="Toutes les actus du club"
    />
  );
}
