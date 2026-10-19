import type { Metadata } from "next";
import { Award, Cpu, Timer, Target, Layers, ShieldCheck, MessageCircle, Check } from "lucide-react";
import { ServicePageTemplate } from "@/components/sections/service-page-template";
import { PageHero } from "@/components/sections/page-hero";
import { Faq, type FaqItem } from "@/components/sections/faq";
import { Button } from "@/components/ui/button";
import { WhatsappClickLink } from "@/components/whatsapp/whatsapp-click-link";
import { RecruitmentLeadForm } from "./lead-form";
import { buildPageMetadata } from "@/lib/seo";
import { buildContactWhatsappHref } from "@/lib/whatsapp-number";
import { JOBS_CONDUCTED_TEXT, GUARANTEE_TEXT } from "@/lib/recruitment-content";

const WHATSAPP_HREF = buildContactWhatsappHref("Recrutamento e Seleção");

const WHATS_INCLUDED_ITEMS = [
  "Divulgação da vaga e atração de candidatos",
  "Triagem dos currículos com apoio de inteligência artificial",
  "Entrevistas conduzidas por recrutadores experientes",
  "Lista final com os finalistas, em até 15 dias",
];

const faqData: { question: string; answer: string }[] = [
  {
    question: "Em quanto tempo recebo os candidatos finalistas?",
    answer: "Em até 15 dias. A maioria das vagas que conduzimos foi fechada em menos de duas semanas.",
  },
  {
    question: "O que acontece se o profissional sair logo depois de contratado?",
    answer: "Se isso ocorrer nos primeiros 60 dias, a reposição é gratuita.",
  },
  {
    question: "Para quais tipos de vaga vocês atendem?",
    answer: "Para vagas administrativas, financeiras, comerciais, operacionais e de RH, em vários níveis.",
  },
  {
    question: "Quanto custa o serviço de recrutamento e seleção?",
    answer:
      "Cobramos um percentual sobre o salário da vaga. O percentual varia conforme o nível da posição e a quantidade de vagas abertas ao mesmo tempo. Depois de entender sua necessidade, enviamos a proposta.",
  },
  {
    question: "Vocês atendem empresas de fora do Espírito Santo?",
    answer: "Sim, atendemos empresas em todo o Brasil.",
  },
  {
    question: "Como começo?",
    answer: "Preencha o formulário desta página com o cargo que precisa contratar. Nosso time comercial entra em contato com você.",
  },
];

const faqItems: FaqItem[] = faqData;

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqData.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  })),
};

export const metadata: Metadata = buildPageMetadata({
  title: "Recrutamento e Seleção — Ryze Consultoria",
  description:
    "Recrutadores com mais de 10 anos de experiência e tecnologia no processo: candidatos finalistas em até 15 dias, de vagas operacionais a estratégicas.",
  path: "/consultoria/recrutamento-e-selecao",
});

export default function RecrutamentoESelecaoPage() {
  return (
    <ServicePageTemplate
      eyebrow="Recrutamento e Seleção"
      title="Os candidatos certos, mais rápido que o mercado"
      subtitle="Recrutadores sêniores e tecnologia no processo para entregar finalistas qualificados em até 15 dias — de vagas operacionais a posições estratégicas."
      hero={
        <>
          <PageHero
            eyebrow="Recrutamento e Seleção"
            title="Os candidatos certos, mais rápido que o mercado"
            subtitle="Recrutadores sêniores e tecnologia no processo para entregar finalistas qualificados em até 15 dias — de vagas operacionais a posições estratégicas."
          >
            <Button asChild size="lg">
              <a href="#formulario-contato">Quero contratar mais rápido</a>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <WhatsappClickLink href={WHATSAPP_HREF} target="_blank" rel="noopener noreferrer" button="hero_secondary">
                <MessageCircle className="h-4 w-4" />
                Falar no WhatsApp
              </WhatsappClickLink>
            </Button>
          </PageHero>

          <section id="formulario-contato" className="border-b border-border bg-bg-surface px-5 py-16 lg:px-8">
            <div className="mx-auto max-w-xl">
              <h2 className="text-center font-display text-display-md font-semibold text-fg">
                Deixe seus dados que entramos em contato
              </h2>
              <p className="mt-2 text-center text-body-sm text-fg-muted">
                Preencha abaixo — nosso time comercial responde o mais rápido possível.
              </p>
              <div className="mt-8 rounded-xl border border-border bg-bg p-6 sm:p-8">
                <RecruitmentLeadForm />
              </div>
            </div>
          </section>
        </>
      }
      highlights={[
        { value: "+10 anos", label: "de experiência dos nossos recrutadores" },
        { value: "até 15 dias", label: "para apresentar candidatos finalistas" },
        { value: "operacional → estratégica", label: "cobrimos todos os níveis de vaga" },
      ]}
      painTitle="Contratar devagar e errado custa caro"
      painPoints={[
        "Vagas abertas por meses sobrecarregam o time e travam entregas.",
        "Contratações por urgência que não passam do período de experiência.",
        "Processos lentos e desorganizados afastam os melhores candidatos — que têm outras ofertas.",
        "Falta de critério objetivo para avaliar fit técnico e cultural.",
      ]}
      differentiatorsTitle="Como a Ryze entrega mais rápido e com mais assertividade"
      differentiators={[
        {
          icon: Award,
          title: "Recrutadores com +10 anos de experiência",
          description:
            "Profissionais sêniores que já conduziram centenas de processos — sabem ler além do currículo e reconhecer o candidato certo.",
        },
        {
          icon: Cpu,
          title: "Tecnologia e IA no processo",
          description:
            "Sourcing e triagem acelerados por IA para varrer mais candidatos em menos tempo. Ferramentas de IA chegam a reduzir o tempo de contratação em cerca de 40%.",
        },
        {
          icon: Timer,
          title: "Finalistas em até 15 dias",
          description:
            "Um funil enxuto e bem conduzido: você recebe uma shortlist de finalistas qualificados em até 15 dias, não em meses.",
        },
        {
          icon: Target,
          title: "Alta taxa de assertividade",
          description:
            "Seleção estruturada e baseada em competências, acompanhada por indicadores — para reduzir a chance de uma contratação que não vinga.",
        },
        {
          icon: Layers,
          title: "Do operacional ao estratégico",
          description:
            "Da linha de frente a posições de liderança e especialistas difíceis de encontrar — ajustamos o método ao nível e à urgência da vaga.",
        },
        {
          icon: ShieldCheck,
          title: "Processo justo e sem viés",
          description:
            "Critérios objetivos e consistentes para todos os candidatos, reduzindo viés inconsciente na triagem e nas entrevistas.",
        },
      ]}
      methodologyTitle="Como conduzimos o processo seletivo"
      methodologySteps={[
        { label: "Alinhamento", description: "Perfil da vaga e critérios" },
        { label: "Sourcing + IA", description: "Busca ativa e triagem" },
        { label: "Entrevistas", description: "Técnica e cultural" },
        { label: "Shortlist", description: "Finalistas em até 15 dias" },
        { label: "Contratação", description: "Proposta e acompanhamento" },
      ]}
      resultsTitle="Por que método e tecnologia importam"
      resultsSubtitle="Dados de mercado sobre o impacto de selecionar com estrutura e agilidade — a base da nossa forma de trabalhar."
      results={[
        {
          value: "~40%",
          label: "de redução no tempo de contratação com IA no processo de recrutamento",
          source: "impress.ai / benchmarks de mercado",
        },
        {
          value: "2,5x",
          label: "mais previsibilidade de desempenho com entrevistas estruturadas vs. não estruturadas",
          source: "SHRM",
        },
        {
          value: "até 30%",
          label: "do salário anual é o custo de uma contratação errada",
          source: "U.S. Department of Labor",
        },
      ]}
      beforeCta={
        <>
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

          <section className="mx-auto max-w-3xl px-5 py-16 lg:px-8">
            <h2 className="font-display text-display-md font-semibold text-fg">Vagas que já conduzimos</h2>
            <p className="mt-6 text-body-lg text-fg-muted">{JOBS_CONDUCTED_TEXT}</p>
          </section>

          <section className="border-y border-border bg-bg-surface px-5 py-16 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <h2 className="font-display text-display-md font-semibold text-fg">O que está incluído no processo</h2>
              <ul className="mt-6 flex flex-col gap-4">
                {WHATS_INCLUDED_ITEMS.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-body-lg text-fg-muted">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-accent-600 dark:text-accent-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="mx-auto max-w-3xl px-5 py-16 lg:px-8">
            <h2 className="font-display text-display-md font-semibold text-fg">Garantia de reposição</h2>
            <p className="mt-6 text-body-lg text-fg-muted">{GUARANTEE_TEXT}</p>
          </section>

          <section className="border-t border-border px-5 py-16 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-center font-display text-display-md font-semibold text-fg">
                Perguntas frequentes
              </h2>
              <div className="mt-10">
                <Faq items={faqItems} />
              </div>
            </div>
          </section>
        </>
      }
      ctaLabel="Pronto para contratar melhor e mais rápido?"
      ctaSubtitle="Fale com um especialista e receba finalistas qualificados em até 15 dias."
      ctaHref={WHATSAPP_HREF}
    />
  );
}
