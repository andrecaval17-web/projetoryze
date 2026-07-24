import { UserRound, Building2 } from "lucide-react";
import { FoldArrow } from "@/components/brand/fold-arrow";
import { NeuralHero } from "@/components/brand/neural-hero";
import { AudienceCard } from "@/components/sections/audience-card";

/**
 * A primeira coisa que qualquer visitante vê em `/` — resolve a confusão de
 * misturar candidato e empresa na mesma home (ver histórico do projeto):
 * uma pergunta binária, cada resposta leva pra uma experiência já existente
 * e dedicada (/para-candidatos ou /empresas). Sem conteúdo novo aqui além da
 * própria pergunta — é só roteamento.
 */
export function AudienceGate() {
  return (
    <section className="dark relative flex min-h-[30rem] flex-col items-center justify-center overflow-hidden bg-bg px-5 py-14 text-center text-fg">
      <NeuralHero />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 55% 50% at 50% 45%, var(--bg) 30%, transparent 100%)",
        }}
        aria-hidden="true"
      />

      <div className="relative flex w-full flex-col items-center">
        <FoldArrow
          tone="gradient"
          className="h-14 w-11 animate-float drop-shadow-[0_0_24px_rgba(232,92,42,0.55)]"
        />

        {/* Tamanho fixo (não volta a crescer em telas largas) — achado #2 da
            auditoria de UX de 2026-07-22: os cards de escolha ficavam abaixo
            da dobra tanto em 1280x720 (breakpoint largo, viewport baixo)
            quanto no mobile, então uma versão "grande só a partir de sm" não
            resolvia o caso 1280x720. */}
        <h1 className="mt-4 max-w-2xl font-display text-display-xl font-semibold text-fg">
          Você é candidato ou empresa?
        </h1>
        <p className="mt-2 max-w-xl text-body-lg text-fg-muted">
          A Ryze une consultoria de RH e inteligência artificial. Escolha seu
          caminho pra começar.
        </p>

        <div className="mt-6 grid w-full max-w-3xl gap-5 sm:grid-cols-2 sm:gap-6">
          <AudienceCard
            icon={UserRound}
            title="Sou candidato"
            description="Currículo com IA de graça, vagas todos os dias no WhatsApp e ferramentas pra acelerar sua recolocação."
            ctaLabel="Começar de graça"
            href="/para-candidatos"
          />
          <AudienceCard
            icon={Building2}
            title="Sou empresa"
            description="Consultoria estratégica e produtos de inteligência artificial pra acelerar recrutamento, cultura e desenvolvimento."
            ctaLabel="Conhecer soluções para empresas"
            href="/empresas"
            tone="accent"
          />
        </div>
      </div>
    </section>
  );
}
