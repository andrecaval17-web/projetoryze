import type { Metadata } from "next";
import Link from "next/link";
import { LayoutDashboard, MessagesSquare, History } from "lucide-react";
import { DarkHero } from "@/components/sections/dark-hero";
import { ResultsBand } from "@/components/sections/results-band";
import { PainGrid } from "@/components/sections/pain-grid";
import { ComparisonColumns } from "@/components/sections/comparison-columns";
import { RoiCalculator } from "@/components/sections/roi-calculator";
import { CaseResults } from "@/components/sections/case-results";
import { DualCtaBand } from "@/components/sections/dual-cta-band";
import { FoldStepIndicator } from "@/components/brand/fold-step-indicator";
import { Button } from "@/components/ui/button";
import { buildPageMetadata } from "@/lib/seo";
import { buildContactWhatsappHref, buildDemoWhatsappHref } from "@/lib/whatsapp-number";

export const metadata: Metadata = buildPageMetadata({
  title: "Pesquisa de Clima Organizacional e eNPS — Ryze HR Cultura",
  description:
    "Pesquisa de clima organizacional, eNPS e engajamento de colaboradores: escuta contínua no WhatsApp, diagnóstico de causa-raiz e um mentor de IA para cada líder.",
  path: "/produtos/cultura",
});

const CONTATO_ESPECIALISTA = buildContactWhatsappHref("a pesquisa de clima organizacional da Ryze");
const CONTATO_DEMONSTRACAO = buildDemoWhatsappHref("a pesquisa de clima organizacional da Ryze");

export default function CulturaPage() {
  return (
    <>
      <DarkHero
        eyebrow="Ryze HR · Pesquisa de clima e engajamento com IA"
        title={
          <>
            O problema de clima e engajamento virou um problema <span className="text-gradient-ryze">de caixa</span>.
          </>
        }
        subtitle="O Brasil lidera o ranking mundial de rotatividade, o engajamento global está no menor nível desde 2020 — e cada saída evitável custa até dois salários anuais. A pergunta não é mais se a sua empresa pode investir em pesquisa de clima organizacional e engajamento. É quanto ela está perdendo por não investir direito."
        primaryCta={
          <Button asChild size="lg">
            <a href={CONTATO_ESPECIALISTA} target="_blank" rel="noopener noreferrer">
              Falar com um especialista
            </a>
          </Button>
        }
        secondaryCta={
          <Button asChild size="lg" variant="secondary">
            <a href={CONTATO_DEMONSTRACAO} target="_blank" rel="noopener noreferrer">
              Agendar demonstração
            </a>
          </Button>
        }
      />

      <ResultsBand
        title="O momento do clima organizacional no Brasil"
        stats={[
          {
            value: "+56%",
            label: "de turnover vs. pré-pandemia — o maior do mundo. Em serviços e varejo, passa de 80%.",
            source: "Robert Half / CAGED",
          },
          {
            value: "50–200%",
            label: "do salário anual é o custo real de substituir um colaborador, até a produtividade plena",
            source: "SHRM · Gallup",
          },
          {
            value: "20%",
            label: "de engajamento — menor nível global desde 2020. Engajamento dos gestores caiu de 31% para 22% em 3 anos.",
            source: "Gallup, State of the Global Workplace 2026",
          },
        ]}
        note="Gartner e GPTW apontam as mesmas prioridades para 2026: desenvolver líderes e transformar cultura em desempenho. É exatamente isso que a Ryze entrega."
      />

      <PainGrid
        title="Sua empresa provavelmente já investe nas três frentes. E o problema continua."
        points={[
          {
            title: "Pesquisa de clima",
            description:
              "Uma foto tirada 1 ou 2 vezes por ano, muitas vezes resumida a um único número de eNPS. Mostra a média, não a causa — e quando o relatório fica pronto, o momento já passou. Quem responde e não vê nada mudar confia menos: a foto sem ação piora o clima.",
          },
          {
            title: "Treinamento de liderança",
            description:
              "Sala de aula, casos genéricos, conteúdo longe do momento em que o líder precisa. Semanas depois, quase tudo foi esquecido — o RH mede presença, não mudança de comportamento.",
          },
          {
            title: "Dashboards de RH",
            description:
              "Indicadores sobem e descem na tela, mas ninguém diz ao gestor o que fazer com eles. Dado sem direção não vira decisão.",
          },
        ]}
        calloutTitle="E a cultura?"
        calloutBody={
          <>
            Valores no mural, cultura no discurso — mas nenhum indicador que mostre se ela está sendo vivida na
            prática. Cada líder interpreta de um jeito, e ninguém mede.{" "}
            <strong className="font-semibold text-fg">
              Sem dado, a cultura muda conforme o gestor — e enfraquece enquanto a empresa cresce.
            </strong>
          </>
        }
      />

      <RoiCalculator
        eyebrow="Faça a conta"
        title="Quanto custa não fazer nada?"
        description={
          <>
            <p>
              Pegue uma empresa de 200 pessoas com salário médio de R$ 4.500 e turnover de 30% ao ano — abaixo da
              média de vários setores no Brasil. São 60 substituições por ano.
            </p>
            <p>
              Usando o piso conservador do custo de reposição (50% do salário anual, segundo a SHRM), a conta ao
              lado se paga sozinha: cada punhado de saídas evitadas já cobre o investimento em escuta contínua —
              sem contar produtividade, absenteísmo e falhas operacionais.
            </p>
          </>
        }
        punchline="Retenção deixou de ser tema de RH. É proteção de margem."
        rows={[
          { label: "Colaboradores", value: "200" },
          { label: "Salário médio mensal", value: "R$ 4.500" },
          { label: "Turnover anual (30%)", value: "60 saídas" },
          { label: "Custo por substituição (piso de 50%)", value: "R$ 27.000" },
        ]}
        totalRow={{ label: "Custo anual do turnover", value: "≈ R$ 1,6 milhão" }}
        disclaimer="Estimativa simplificada, baseada em premissas conservadoras — não é benchmark de mercado."
      />

      <ComparisonColumns
        eyebrow="A virada"
        title={
          <>
            Pesquisa de clima é uma foto. A Ryze entrega o filme — de clima{" "}
            <em className="not-italic text-accent-600 dark:text-accent-400">e de cultura</em>.
          </>
        }
        intro="Escuta contínua no WhatsApp do time, diagnóstico de causa-raiz e um mentor com IA ao lado de cada líder. E com dois placares rodando juntos: engajamento e aderência à cultura — porque cada ação tomada impacta os dois, e a ferramenta mostra exatamente como."
        leftLabel="A foto — o modelo atual"
        leftSub="Um retrato por ano"
        leftItems={[
          "1–2 aplicações anuais, desconectadas da rotina",
          "Sintoma, sem causa",
          "Cultura fora da medição — só no discurso",
          "Relatório vira slide, raramente vira ação",
        ]}
        rightLabel="O filme — Ryze + Flecha"
        rightSub="Uma história em tempo real"
        rightItems={[
          "Conversas contínuas via WhatsApp, com alta adesão",
          "Causa-raiz, preservando o anonimato",
          <>
            Cultura vira indicador: <strong className="font-semibold text-fg">aderência medida</strong> ciclo a
            ciclo
          </>,
          "Todo diagnóstico vira experimento — com impacto medido em engajamento e em cultura",
        ]}
        footnote="Empresas com escuta contínua têm 2,3x mais chance de contar com equipes engajadas — relatório de Employee Experience."
      />

      <section className="border-y border-border bg-bg-surface px-5 py-16 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <p className="text-label font-semibold uppercase tracking-wider text-accent-600 dark:text-accent-400">
            Como funciona
          </p>
          <h2 className="mt-2 font-display text-display-md font-semibold text-fg">
            Um ciclo simples que roda toda semana
          </h2>

          <div className="mt-12 overflow-x-auto pb-2">
            <div className="min-w-[40rem]">
              <FoldStepIndicator
                currentStep={4}
                steps={[
                  { label: "Escuta", description: "Conversas 1:1 e anônimas com cada colaborador, no WhatsApp" },
                  { label: "Diagnóstico", description: "A IA cruza padrões de clima organizacional e aponta a causa-raiz" },
                  { label: "Ação", description: "O mentor com IA treina o líder e firma um compromisso com prazo" },
                  { label: "Evolução", description: "O próximo ciclo mede se a ação funcionou" },
                ]}
              />
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-4">
            <div className="rounded-lg border border-border bg-bg p-6 text-body-sm text-fg-muted">
              <strong className="font-semibold text-fg">Por que o mentor importa tanto:</strong> segundo a Gallup,
              70% do engajamento de um time é explicado pelo gestor direto — e é justamente o gestor que está mais
              esgotado hoje. O mentor da Ryze acompanha cada líder no momento exato da decisão, com o contexto real
              do seu time — desenvolvimento de liderança embutido na rotina, a prioridade nº 1 apontada pelo GPTW
              para 2026.
            </div>
          </div>
        </div>
      </section>

      <CaseResults
        title="Resultados de quem já trocou a foto pelo filme"
        subtitle="Resultados medidos em programas com 100% da liderança envolvida."
        metrics={[
          { value: "+12pp", label: "Engajamento — média de aumento por líder" },
          { value: "−75%", label: "Turnover — redução nas saídas evitáveis" },
          { value: "−68%", label: "Absenteísmo — equipes mais presentes e envolvidas" },
          { value: "−40%", label: "Falhas operacionais — menos retrabalho, mais qualidade" },
          { value: "+60%", label: "Produtividade — equipes entregando mais, com foco" },
          { value: "+30%", label: "Faturamento — times mais alinhados e eficazes" },
        ]}
        note="Cliente real, ciclo a ciclo: engajamento sobe, falhas caem, produtividade acelera — isso é o filme."
        casesTitle="Empresas que já assistem ao próprio filme"
        cases={[
          { name: "Sicoob Credinor", result: "Melhora em 16 de 21 aspectos de engajamento", duration: "6 meses" },
          {
            name: "Proman Engenharia",
            result: "+8pp de engajamento vs. <1pp nos times fora do programa",
            duration: "3 meses",
          },
          { name: "Aura Lounge Bar", result: "+17pp engajamento e +9pp na margem líquida", duration: "6 meses" },
          { name: "Kentro Sistemas", result: "+9pp engajamento e +50% no faturamento mensal", duration: "3 meses" },
        ]}
      />

      <div className="mx-auto max-w-5xl px-5 pt-10 lg:px-8">
        <div className="rounded-lg border border-border bg-bg-surface p-6 text-body-sm text-fg-muted">
          <strong className="font-semibold text-fg">A tecnologia por trás desses resultados:</strong> a Flecha,
          criada por Edem Moulin ao longo de mais de 25 anos como executivo de RH — a mesma metodologia que levou
          uma multinacional da 42ª à 1ª posição no ranking GPTW, mantida por três anos consecutivos. Como fundador
          da Flecha, Edem se juntou à Ryze HR para trazer essa escuta contínua, o eNPS e o diagnóstico de clima
          organizacional para o seu time.
        </div>
      </div>

      <section className="px-5 py-16 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <p className="text-label font-semibold uppercase tracking-wider text-accent-600 dark:text-accent-400">
            Veja em ação
          </p>
          <h2 className="mt-2 font-display text-display-md font-semibold text-fg">
            Um painel, toda a organização — em tempo real
          </h2>

          <ul className="mt-8 flex flex-col rounded-xl border border-border bg-bg p-7">
            {[
              {
                icon: LayoutDashboard,
                text: "Visão geral e por área: engajamento, cultura, participação e execução das ações, sempre atualizados.",
              },
              {
                icon: MessagesSquare,
                text: "Sugestões de abordagem para cada liderança, prontas para virar conversa.",
              },
              {
                icon: History,
                text: "Um clique de profundidade: histórico completo de desafios e experimentos de qualquer área.",
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
        title="Sua empresa vai continuar tirando fotos — ou vai começar a assistir ao filme?"
        subtitle="A Ryze HR implementa a pesquisa de clima organizacional e a escuta contínua na sua empresa — do diagnóstico à execução com os times, ciclo após ciclo, com resultado medido em engajamento, retenção e caixa."
        primaryLabel="Falar com um especialista"
        primaryHref={CONTATO_ESPECIALISTA}
        secondaryLabel="Agendar demonstração"
        secondaryHref={CONTATO_DEMONSTRACAO}
      />
    </>
  );
}
