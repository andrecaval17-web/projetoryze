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

export const metadata: Metadata = {
  title: "Ryze HR Cultura — Gestão de Pessoas em Tempo Real — Ryze",
  description:
    "Escuta contínua no WhatsApp, diagnóstico de causa-raiz e um mentor com IA ao lado de cada líder — engajamento e cultura medidos ciclo a ciclo, com a tecnologia Flecha.",
};

const CONTATO_ESPECIALISTA = "/contato?produto=cultura&intencao=especialista";
const CONTATO_DEMONSTRACAO = "/contato?produto=cultura&intencao=demonstracao";

export default function CulturaPage() {
  return (
    <>
      <DarkHero
        eyebrow="Ryze HR · Gestão de pessoas em tempo real"
        title={
          <>
            O problema de pessoas virou um problema <span className="text-gradient-ryze">de caixa</span>.
          </>
        }
        subtitle="O Brasil lidera o ranking mundial de rotatividade, o engajamento global está no menor nível desde 2020 — e cada saída evitável custa até dois salários anuais. A pergunta não é mais se a sua empresa pode investir em gestão de pessoas. É quanto ela está perdendo por não investir direito."
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
        title="O momento do RH brasileiro"
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
              "Uma foto tirada 1 ou 2 vezes por ano. Mostra a média, não a causa — e quando o relatório fica pronto, o momento já passou. Quem responde e não vê nada mudar confia menos: a foto sem ação piora o clima.",
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

      <p className="mx-auto max-w-2xl px-5 py-14 text-center font-display text-heading-sm italic text-fg lg:px-8">
        &ldquo;Empresas coletam dados, geram relatórios, apresentam gráficos — mas não constroem planos. Se o
        colaborador percebe que falou e nada mudou, o clima piora.&rdquo;
        <span className="mt-3 block text-body-sm not-italic text-fg-muted">
          — consenso das principais análises de mercado sobre pesquisa de clima
        </span>
      </p>

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
                  { label: "Diagnóstico", description: "A IA cruza padrões e aponta a causa-raiz" },
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
            <div className="rounded-lg border border-border bg-bg p-6 text-body-sm text-fg-muted">
              <strong className="font-semibold text-fg">E por que a Ryze em cultura:</strong> a tecnologia mede a
              aderência cultural — mas transformar esse dado em cultura viva exige método. É a especialidade da
              Ryze: diagnóstico, estruturação e comunicação de cultura, com resultados comprovados em campo — de
              selos GPTW e Great People Mental Health a operações onde 88% dos colaboradores reconhecem a cultura no
              dia a dia após um ano de trabalho estruturado.
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

      <section className="px-5 py-16 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <p className="text-label font-semibold uppercase tracking-wider text-accent-600 dark:text-accent-400">
            Por trás da tecnologia
          </p>
          <h2 className="mt-2 font-display text-display-md font-semibold text-fg">
            A metodologia que já foi 3x nº 1 do GPTW, agora com a Ryze
          </h2>
          <div className="mt-6 flex flex-col gap-4 text-body-md text-fg-muted">
            <p>
              A tecnologia por trás do filme é a Flecha, e seu fundador, <strong className="text-fg">Edem Moulin</strong>,
              construiu a metodologia ao longo de mais de 25 anos como executivo de RH — foi o principal vetor que
              levou uma multinacional da 42ª à 1ª posição no ranking GPTW, mantida por três anos consecutivos, com
              recordes de produtividade.
            </p>
            <p>
              Como fundador da Flecha, Edem se junta à Ryze HR nessa parceria para levar a escuta contínua às
              empresas — unindo a tecnologia dele à experiência da Ryze em transformar RH em resultado de negócio.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-bg-surface px-5 py-16 lg:px-8">
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
        subtitle="A Ryze HR implementa a escuta contínua na sua empresa — do diagnóstico à execução com os times, ciclo após ciclo, com resultado medido em engajamento, retenção e caixa."
        primaryLabel="Falar com um especialista"
        primaryHref={CONTATO_ESPECIALISTA}
        secondaryLabel="Agendar demonstração"
        secondaryHref={CONTATO_DEMONSTRACAO}
      />
    </>
  );
}
