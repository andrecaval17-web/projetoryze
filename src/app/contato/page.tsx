import type { Metadata } from "next";
import { Mail, MapPin, Clock } from "lucide-react";
import { PageHero } from "@/components/sections/page-hero";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contato — Ryze",
  description: "Fale com um consultor da Ryze sobre consultoria de RH, produtos de IA ou oportunidades para candidatos.",
};

const info = [
  { icon: Mail, label: "contato@ryze.com.br" },
  { icon: Clock, label: "Seg. a sex., 9h às 18h" },
  { icon: MapPin, label: "Atendimento em todo o Brasil" },
];

export default function ContatoPage() {
  return (
    <>
      <PageHero
        eyebrow="Contato"
        title="Vamos conversar"
        subtitle="Conte o que sua empresa precisa (ou o que você busca, se é candidato) e um consultor da Ryze responde em breve."
      />

      <section className="mx-auto max-w-5xl px-5 py-16 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <h2 className="font-display text-heading-lg font-semibold text-fg">
              Outros canais
            </h2>
            <ul className="mt-5 flex flex-col gap-4">
              {info.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-3 text-body-md text-fg-muted">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-bg-surface-2 text-accent-600 dark:text-accent-400">
                    <Icon className="h-4 w-4" />
                  </span>
                  {label}
                </li>
              ))}
            </ul>
            <p className="mt-8 text-body-sm text-fg-muted">
              Se você é candidato buscando vaga e não quer preencher este
              formulário, conheça direto{" "}
              <a href="/para-candidatos" className="font-medium text-accent-600 underline dark:text-accent-400">
                os planos para candidatos
              </a>
              .
            </p>
          </div>

          <div className="rounded-xl border border-border bg-bg-surface p-6 sm:p-8">
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
