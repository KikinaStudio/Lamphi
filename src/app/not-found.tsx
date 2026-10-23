import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import SiteNotFound from "./(site)/not-found";

// Adresse inconnue : même page 404 que dans le site, avec l'en-tête et le pied de page.
export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <SiteNotFound />
      </main>
      <Footer />
    </>
  );
}
