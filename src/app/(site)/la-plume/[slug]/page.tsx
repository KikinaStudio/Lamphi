import { PostDetailPage, postMetadata } from "@/components/post-pages";

export async function generateMetadata({ params }: PageProps<"/la-plume/[slug]">) {
  return postMetadata((await params).slug, ["tribune", "interview"]);
}

export default async function PlumeArticlePage({ params }: PageProps<"/la-plume/[slug]">) {
  return (
    <PostDetailPage
      slug={(await params).slug}
      categories={["tribune", "interview"]}
      backHref="/la-plume"
      backLabel="La Plume"
    />
  );
}
