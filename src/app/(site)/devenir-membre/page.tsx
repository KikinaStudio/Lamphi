import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { benefits, eligibility } from "@/content/site";
import { ApplicationForm } from "./application-form";

export const metadata: Metadata = {
  title: "Devenir membre",
  description:
    "L'Amphi réunit une communauté restreinte et prestigieuse de dirigeants de la santé. Déposez votre demande d'adhésion.",
};

const steps = [
  { title: "Votre candidature", text: "Remplissez le formulaire ci-dessous en quelques minutes." },
  { title: "Le comité de sélection", text: "Chaque candidature fait l'objet d'un examen attentif par un comité dédié." },
  { title: "Bienvenue au club", text: "Vous recevez une invitation par e-mail pour créer votre accès à l'espace membre." },
];

export default function JoinPage() {
  return (
    <>
      <PageHeader
        eyebrow="Devenir membre"
        title="Rejoindre une communauté restreinte et prestigieuse"
        intro="L'Amphi vise à réunir une communauté composée exclusivement de dirigeants influents du secteur de la santé."
      />

      <section className="container-page grid gap-12 py-14 lg:grid-cols-[1fr_1.3fr]">
        <div className="space-y-10">
          <div>
            <h2 className="text-2xl">Qui peut adhérer ?</h2>
            <p className="mt-3 leading-relaxed text-muted">{eligibility.intro}</p>
            <ul className="mt-5 space-y-3 text-sm text-ink-soft">
              {eligibility.groups.map((group) => (
                <li key={group.title}>
                  <strong className="text-ink">{group.title} :</strong> {group.items.join(", ")}.
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-2xl">Votre adhésion comprend</h2>
            <ul className="mt-4 space-y-2 text-ink-soft">
              {benefits.map((benefit) => (
                <li key={benefit.title} className="flex gap-3">
                  <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  {benefit.title}
                </li>
              ))}
            </ul>
          </div>

          <ol className="space-y-5">
            {steps.map((step, index) => (
              <li key={step.title} className="flex gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink font-serif text-paper">
                  {index + 1}
                </span>
                <div>
                  <h3 className="text-lg">{step.title}</h3>
                  <p className="text-sm text-muted">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="card p-6 sm:p-8">
          <h2 className="text-2xl">Demander une adhésion</h2>
          <p className="mb-6 mt-2 text-sm text-muted">Les champs marqués d&apos;un * sont obligatoires.</p>
          <ApplicationForm />
        </div>
      </section>
    </>
  );
}
