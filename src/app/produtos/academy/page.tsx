import type { Metadata } from "next";
import Link from "next/link";
import { FileStack, ClipboardList, MessageCircleQuestion } from "lucide-react";
import { DarkHero } from "@/components/sections/dark-hero";
import { ResultsBand } from "@/components/sections/results-band";
import { PainGrid } from "@/components/sections/pain-grid";
import { ComparisonColumns } from "@/components/sections/comparison-columns";
import { RoiCalculator } from "@/components/sections/roi-calculator";
import { DualCtaBand } from "@/components/sections/dual-cta-band";
import { FoldStepIndicator } from "@/components/brand/fold-step-indicator";
import { Button } from "@/components/ui/button";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Ryze Academy — Educação Corporativa com IA — Ryze",
  description:
    "A universidade corporativa que responde: trilhas com vídeo, documento e uma IA treinada no conteúdo real da sua empresa, respondendo dúvidas 24/7.",
  path: "/produtos/academy",
});

const CONTATO_ESPECIALISTA = "/contato?produto=academy&intencao=especialista";
const CONTATO_DEMONSTRACAO = "/contato?produto=academy&intencao=demonstracao";

export default function AcademyPage() {
  return (
    <>
      <DarkHero
        eyebrow="Ryze Academy · Educação corporativa com IA"
        title={
          <>
            A universidade corporativa que <span className="text-gradient-ryze">responde</span>. Literalmente.
          </>
        }
        subtitle="Sua empresa já produz conhecimento todos os dias — em vídeos, documentos, treinamentos presenciais. O problema é que ele se perde. A Ryze Academy centraliza tudo numa plataforma onde cada colaborador aprende no seu ritmo e tira dúvidas com uma IA treinada no conteúdo real da sua empresa."
        primaryCta={
          <Button asChild size="lg">
            <Link href={CONTATO_ESPECIALISTA}>Falar com um especialista</Link>
          </Button>
        }
        secondaryCta={
          <Button asChild size="lg" variant="secondary">
            <Link href={CONTATO_DEMONSTRACAO}>Agendar demonstração</Link>
          </Button>
        }
      />

      <ResultsBand
        title="Treinar já não é o problema. Reter o que foi treinado, sim."
        subtitle="O momento do T&D brasileiro, em três números."
        stats={[
          {
            value: "89%",
            label: "já investem em capacitação — a pergunta virou 'com que retorno'",
            source: "Panorama do Treinamento no Brasil 2024/2025",
          },
          {
            value: "87%",
            label: "do aprendizado se perde em 30 dias sem reforço",
            source: "Pesquisas de retenção de aprendizagem · ATD",
          },
          {
            value: "3,3x",
            label: "mais chance de permanecer — mas só 48% sentem apoio real no crescimento",
            source: "Deloitte",
          },
        ]}
      />

      <PainGrid
        title="Os mesmos três gargalos, empresa após empresa"
        points={[
          {
            title: "Conteúdo espalhado",
            description:
              "PowerPoint, PDF solto, grupo de WhatsApp — ninguém sabe quem viu, quem entendeu, quem nunca abriu.",
          },
          {
            title: "Presencial em papel",
            description: "Sala reservada, lista de presença numa folha que some na gaveta.",
          },
          {
            title: "Dúvida sem resposta",
            description:
              "O colaborador assiste uma vez, esquece, e a dúvida no meio do trabalho interrompe o gestor — de novo.",
          },
        ]}
        calloutTitle="O ponto cego"
        calloutBody={
          <>
            Quando alguém sai da empresa, <strong className="font-semibold text-fg">o conhecimento vai junto</strong>.
            Processos que só o veterano sabia não ficam registrados em lugar nenhum. Cada saída reinicia o relógio
            do zero.
          </>
        }
      />

      <ComparisonColumns
        eyebrow="A virada"
        title={
          <>
            Conteúdo parado é arquivo. A Ryze Academy entrega{" "}
            <em className="not-italic text-accent-600 dark:text-accent-400">conhecimento vivo</em>.
          </>
        }
        intro="A diferença central: numa plataforma comum, o vídeo termina e a dúvida fica com o colaborador. Na Ryze Academy, uma IA treinada no conteúdo da própria empresa responde durante a aula ou a qualquer momento depois — com a fonte citada, seja um vídeo ou um documento interno."
        leftLabel="O arquivo — modelo atual"
        leftSub="Conteúdo parado"
        leftItems={[
          "Vídeos e PDFs espalhados, sem trilha nem ordem",
          "Dúvida do colaborador fica sem resposta ou interrompe o gestor",
          "Presencial registrado em papel, sem prova de presença",
          "Relatório de treinamento = planilha manual",
        ]}
        rightLabel="O conhecimento vivo — Ryze Academy"
        rightSub="Aprende, pergunta, comprova"
        rightItems={[
          "Trilhas por área, com vídeo, documento e quiz gerado por IA no mesmo lugar",
          <>
            <strong className="font-semibold text-fg">IA responde dúvidas 24/7</strong>, citando a fonte real do
            conteúdo
          </>,
          <>
            Presencial com convocação automática e{" "}
            <strong className="font-semibold text-fg">presença confirmada por QR code</strong>
          </>,
          "Progresso, presença e homem-hora viram indicador em tempo real",
        ]}
      />

      <section className="border-y border-border bg-bg-surface px-5 py-16 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <p className="text-label font-semibold uppercase tracking-wider text-accent-600 dark:text-accent-400">
            Como funciona
          </p>
          <h2 className="mt-2 font-display text-display-md font-semibold text-fg">
            Do conteúdo ao indicador, em quatro passos
          </h2>

          <div className="mt-12 overflow-x-auto pb-2">
            <div className="min-w-[40rem]">
              <FoldStepIndicator
                currentStep={4}
                steps={[
                  { label: "Monte", description: "Suba vídeos e documentos — viram base da IA automaticamente" },
                  { label: "Distribua", description: "Trilhas, prazos e convocação de presencial, com convite de agenda" },
                  { label: "Acompanhe", description: "Veja quem está progredindo, em tempo real" },
                  { label: "Comprove", description: "Números prontos pra diretoria ou auditoria" },
                ]}
              />
            </div>
          </div>

          <div className="mt-8 rounded-lg border border-border bg-bg p-6 text-body-sm text-fg-muted">
            <strong className="font-semibold text-fg">Por que o presencial entra na mesma plataforma:</strong> NRs e
            integrações continuam acontecendo na sala — a diferença é que não viram mais papel perdido. Um único
            histórico, online e presencial.
          </div>
        </div>
      </section>

      <RoiCalculator
        eyebrow="Faça a conta"
        title="Quanto custa treinar no improviso?"
        description={
          <>
            <p>
              Uma empresa de 200 pessoas, salário médio de R$ 4.500, 60 contratações por ano. Onboarding
              desestruturado atrasa a produtividade plena em <strong className="text-fg">6 a 8 meses</strong> — boa
              parte é o novato caçando informação que ninguém centralizou.
            </p>
            <p>
              Encurtar isso em <strong className="text-fg">1 mês por contratação</strong>, com trilhas estruturadas
              e IA respondendo na hora, já devolve o valor ao lado — todo ano.
            </p>
          </>
        }
        punchline="Conhecimento estruturado deixou de ser custo de RH. É produtividade antecipada."
        rows={[
          { label: "Colaboradores", value: "200" },
          { label: "Salário médio mensal", value: "R$ 4.500" },
          { label: "Contratações por ano", value: "60" },
          { label: "Produtividade antecipada", value: "1 mês/contratação" },
        ]}
        totalRow={{ label: "Valor recuperado por ano", value: "≈ R$ 270 mil" }}
        disclaimer="Estimativa simplificada, baseada em premissas conservadoras — não é benchmark de mercado."
      />

      <section className="px-5 py-16 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <p className="text-label font-semibold uppercase tracking-wider text-accent-600 dark:text-accent-400">
            Veja em ação
          </p>
          <h2 className="mt-2 font-display text-display-md font-semibold text-fg">
            A prova está na plataforma rodando, não num slide
          </h2>

          <ul className="mt-8 flex flex-col rounded-xl border border-border bg-bg-surface p-7">
            {[
              {
                icon: MessageCircleQuestion,
                text: "O colaborador em ação: assistindo a aula e perguntando pra IA — resposta baseada no conteúdo real, na hora.",
              },
              {
                icon: ClipboardList,
                text: "O presencial sem papel: da convocação por e-mail ao QR code de presença projetado na sala.",
              },
              {
                icon: FileStack,
                text: "Os números aparecendo ao vivo: não numa planilha depois — na tela, na hora.",
              },
            ].map(({ icon: Icon, text }, i) => (
              <li
                key={i}
                className="flex items-start gap-3.5 border-b border-dashed border-border py-4 first:pt-0 last:border-0 last:pb-0"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-bg-surface-2 text-accent-600 dark:text-accent-400">
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <p className="text-body-md text-fg">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <DualCtaBand
        title="Quer ver a Ryze Academy rodando no seu RH?"
        subtitle="Fale com um especialista ou agende uma demonstração ao vivo da plataforma."
        primaryLabel="Falar com um especialista"
        primaryHref={CONTATO_ESPECIALISTA}
        secondaryLabel="Agendar demonstração"
        secondaryHref={CONTATO_DEMONSTRACAO}
      />
    </>
  );
}
