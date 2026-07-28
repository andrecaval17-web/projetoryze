import type { Metadata } from "next";
import {
  Search,
  Users2,
  LineChart,
  GraduationCap,
  Sparkles,
  BrainCircuit,
} from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { FoldArrow } from "@/components/brand/fold-arrow";
import { FoldDivider } from "@/components/brand/fold-divider";
import { FoldCorner } from "@/components/brand/fold-corner";
import { FoldStepIndicator } from "@/components/brand/fold-step-indicator";
import { FoldMesh } from "@/components/brand/fold-mesh";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ServiceCard } from "@/components/ui/service-card";
import { ProductCard } from "@/components/ui/product-card";
import { PricingCard } from "@/components/ui/pricing-card";
import { ContentCard } from "@/components/ui/content-card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export const metadata: Metadata = {
  title: "Design System — Ryze",
  robots: { index: false, follow: false },
};

const sections = [
  { id: "hero-preview", label: "Prévia do hero" },
  { id: "cores", label: "Cores" },
  { id: "tipografia", label: "Tipografia" },
  { id: "marca", label: "Motivo de marca" },
  { id: "botoes", label: "Botões" },
  { id: "badges", label: "Badges" },
  { id: "cards", label: "Cards" },
  { id: "formularios", label: "Formulários" },
];

function Section({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-32 py-16">
      <h2 className="font-display text-display-md font-semibold text-fg">{title}</h2>
      {description && <p className="mt-2 max-w-2xl text-body-md text-fg-muted">{description}</p>}
      <div className="mt-8">{children}</div>
    </section>
  );
}

function ColorSwatch({ name, varName, hex }: { name: string; varName: string; hex?: string }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-md border border-border">
      <div className="h-16 w-full" style={{ background: `var(${varName})` }} />
      <div className="bg-bg-surface px-3 py-2">
        <p className="text-body-sm font-medium text-fg">{name}</p>
        <p className="text-caption text-fg-muted">{hex ?? varName}</p>
      </div>
    </div>
  );
}

function TypeSample({
  className,
  token,
  sample,
}: {
  className: string;
  token: string;
  sample: string;
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-border py-5 last:border-none">
      <p className={`font-display text-fg ${className}`}>{sample}</p>
      <p className="text-caption text-fg-muted">{token}</p>
    </div>
  );
}

export default function DesignSystemPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 pb-32 lg:px-8">
      <header className="border-b border-border py-14">
        <Badge variant="accent-soft">Fase 1 · Interno</Badge>
        <h1 className="mt-4 font-display text-display-xl font-semibold text-fg">
          Design System Ryze
        </h1>
        <p className="mt-3 max-w-2xl text-body-lg text-fg-muted">
          Paleta, tipografia e componentes base construídos a partir da
          identidade oficial da marca. Página interna — não indexada, não
          linkada na navegação pública.
        </p>
      </header>

      <nav
        aria-label="Seções do design system"
        className="sticky top-18 z-40 -mx-5 flex gap-1 overflow-x-auto border-b border-border bg-bg/95 px-5 py-3 backdrop-blur-sm lg:mx-0 lg:px-0"
      >
        {sections.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="shrink-0 rounded-md px-3 py-1.5 text-body-sm font-medium text-fg-muted transition-ryze hover:bg-bg-surface hover:text-fg"
          >
            {s.label}
          </a>
        ))}
      </nav>

      <section id="hero-preview" className="scroll-mt-32 py-16">
        <h2 className="font-display text-display-md font-semibold text-fg">
          Prévia do hero
        </h2>
        <p className="mt-2 max-w-2xl text-body-md text-fg-muted">
          Direção para a Home (Fase 2): o site continua claro, mas o hero
          assume o modo escuro da marca de propósito — é o tratamento mais
          forte que a Ryze tem, reservado para o momento em que precisa dizer
          &ldquo;isto é tecnologia&rdquo; antes da primeira frase ser lida.
        </p>

        {/* Forcing `.dark` on this subtree only — the rest of the page stays
            on the visitor's chosen theme. */}
        <div className="dark relative mt-8 flex min-h-[32rem] flex-col items-center justify-center overflow-hidden rounded-xl bg-bg px-6 py-20 text-center text-fg">
          <FoldMesh />
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-accent-500/25 to-transparent opacity-70"
            style={{ animation: "scan-line 6s linear infinite" }}
            aria-hidden="true"
          />

          <div className="relative flex flex-col items-center">
            <div className="relative">
              <FoldArrow tone="gradient" className="h-20 w-16 animate-float drop-shadow-[0_0_24px_rgba(232,92,42,0.55)]" />
            </div>

            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-accent-500/40 bg-accent-500/10 px-3 py-1">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-500" />
              </span>
              <span className="text-label font-medium uppercase tracking-wider text-accent-400">
                IA aplicada a RH · ativa agora
              </span>
            </div>

            <h3 className="mt-5 max-w-2xl font-display text-display-xl font-semibold text-fg">
              Recrutamento que{" "}
              <span className="text-gradient-ryze">pensa junto</span> com
              você
            </h3>
            <p className="mt-4 max-w-lg text-body-lg text-fg-muted">
              Consultoria de RH e inteligência artificial trabalhando lado a
              lado — do hunting à recolocação.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button size="lg">Falar com um consultor</Button>
              <Button size="lg" variant="ghost">
                Ver planos para candidatos
              </Button>
            </div>

            <dl className="mt-12 grid grid-cols-3 gap-8 border-t border-border pt-8">
              {[
                { value: "94%", label: "match de aderência à vaga" },
                { value: "10x", label: "mais rápido que triagem manual" },
                { value: "24/7", label: "IA analisando candidatos" },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col">
                  <dt className="font-display text-display-md font-semibold text-gradient-ryze">
                    {stat.value}
                  </dt>
                  <dd className="mt-1 max-w-[9rem] text-caption text-fg-muted">
                    {stat.label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <Section
        id="cores"
        title="Cores"
        description="Cinza-chumbo quente, papel e laranja metálico — a paleta oficial — mais a rampa neutra quente derivada dela para superfícies, bordas e estados."
      >
        <h3 className="mb-3 text-label font-semibold uppercase tracking-wide text-fg-muted">
          Marca
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <ColorSwatch name="Ink" varName="--ink" hex="#2E2C2A" />
          <ColorSwatch name="Ink muted" varName="--ink-muted" hex="#6B6864" />
          <ColorSwatch name="Paper" varName="--paper" hex="#F3F0EA" />
          <ColorSwatch name="Paper dark" varName="--paper-dark" hex="#17140F" />
        </div>

        <h3 className="mb-3 mt-8 text-label font-semibold uppercase tracking-wide text-fg-muted">
          Accent (laranja metálico)
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="col-span-2 flex flex-col overflow-hidden rounded-md border border-border sm:col-span-1">
            <div className="h-16 w-full bg-gradient-ryze" />
            <div className="bg-bg-surface px-3 py-2">
              <p className="text-body-sm font-medium text-fg">Gradiente</p>
              <p className="text-caption text-fg-muted">--gradient-ryze</p>
            </div>
          </div>
          <ColorSwatch name="Accent 400" varName="--accent-400" hex="#FF8A4C" />
          <ColorSwatch name="Accent 500" varName="--accent-500" hex="#E85C2A" />
          <ColorSwatch name="Accent 600" varName="--accent-600" hex="#A83E1D" />
        </div>

        <h3 className="mb-3 mt-8 text-label font-semibold uppercase tracking-wide text-fg-muted">
          Neutros (modo atual)
        </h3>
        <div className="grid grid-cols-5 gap-3 sm:grid-cols-10">
          {["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"].map((n) => (
            <div key={n} className="flex flex-col overflow-hidden rounded-md border border-border">
              <div className="h-12 w-full" style={{ background: `var(--neutral-${n})` }} />
              <p className="bg-bg-surface px-1.5 py-1 text-center text-caption text-fg-muted">{n}</p>
            </div>
          ))}
        </div>
      </Section>

      <FoldDivider />

      <Section
        id="tipografia"
        title="Tipografia"
        description="Space Grotesk (display, geométrica/condensada) para headlines e Inter para corpo de texto."
      >
        <div>
          <TypeSample className="text-display-2xl" token="text-display-2xl" sample="Consultoria em RH" />
          <TypeSample className="text-display-xl" token="text-display-xl" sample="IA aplicada a RH" />
          <TypeSample className="text-display-lg" token="text-display-lg" sample="Recrutamento com IA" />
          <TypeSample className="text-display-md" token="text-display-md" sample="Cultura organizacional" />
          <TypeSample className="text-heading-lg font-semibold" token="text-heading-lg" sample="Etapas do processo seletivo" />
          <TypeSample className="text-heading-md font-semibold" token="text-heading-md" sample="Título de card" />
          <TypeSample className="text-heading-sm font-semibold" token="text-heading-sm" sample="Título de post do blog" />
        </div>
        <div className="mt-2 font-body">
          <TypeSample className="text-body-lg font-body font-normal" token="text-body-lg" sample="Texto de corpo grande, usado em introduções e destaques." />
          <TypeSample className="text-body-md font-body font-normal" token="text-body-md" sample="Texto de corpo padrão, usado na maior parte do conteúdo." />
          <TypeSample className="text-body-sm font-body font-normal" token="text-body-sm" sample="Texto de corpo pequeno, usado em legendas e metadados." />
          <TypeSample className="text-label font-body font-medium" token="text-label" sample="RÓTULO DE CAMPO" />
          <TypeSample className="text-caption font-body font-normal" token="text-caption" sample="Legenda auxiliar, datas, contagens." />
        </div>
      </Section>

      <FoldDivider emphasis />

      <Section
        id="marca"
        title="Motivo de marca — dobra/faceta"
        description="A seta origami extraída da logo vira elemento assinatura: sempre representando avanço, progresso ou destaque de IA — nunca decoração gratuita."
      >
        <div className="mb-8 flex flex-col gap-6 rounded-lg border border-border bg-bg-surface p-8 sm:flex-row sm:items-center sm:justify-around">
          <Logo size="md" showTagline />
          <Logo size="lg" />
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="items-center text-center">
            <FoldArrow className="mx-auto h-16 w-12" tone="gradient" />
            <p className="mt-4 text-body-sm font-medium text-fg">FoldArrow — gradiente</p>
          </Card>
          <Card className="items-center text-center">
            <FoldArrow className="mx-auto h-16 w-12" tone="solid" />
            <p className="mt-4 text-body-sm font-medium text-fg">FoldArrow — sólida</p>
          </Card>
          <Card className="items-center text-center text-accent-600 dark:text-accent-400">
            <FoldArrow className="mx-auto h-16 w-12" tone="current" />
            <p className="mt-4 text-body-sm font-medium text-fg">FoldArrow — currentColor</p>
          </Card>
          <Card className="relative items-center overflow-hidden text-center">
            <FoldCorner />
            <Sparkles className="mx-auto mt-2 h-8 w-8 text-accent-500" />
            <p className="mt-4 text-body-sm font-medium text-fg">FoldCorner — destaque de IA</p>
          </Card>
        </div>

        <div className="mt-10">
          <p className="mb-3 text-body-sm font-medium text-fg">FoldDivider — com e sem ênfase</p>
          <FoldDivider className="mb-6" />
          <FoldDivider emphasis />
        </div>

        <div className="mt-12">
          <p className="mb-6 text-body-sm font-medium text-fg">
            FoldStepIndicator — etapas do processo seletivo
          </p>
          <FoldStepIndicator
            currentStep={1}
            steps={[
              { label: "Triagem", description: "Currículo e fit inicial" },
              { label: "Entrevista RH", description: "Alinhamento cultural" },
              { label: "Entrevista gestor", description: "Fit técnico" },
              { label: "Proposta", description: "Fechamento" },
            ]}
          />
        </div>
      </Section>

      <FoldDivider />

      <Section id="botoes" title="Botões" description="Primário (gradiente), secundário (sólido) e ghost — em três tamanhos.">
        <div className="flex flex-col gap-6">
          {(["primary", "secondary", "ghost"] as const).map((variant) => (
            <div key={variant} className="flex flex-wrap items-center gap-4">
              <span className="w-24 text-body-sm capitalize text-fg-muted">{variant}</span>
              <Button variant={variant} size="sm">Botão</Button>
              <Button variant={variant} size="md">Botão</Button>
              <Button variant={variant} size="lg">Botão</Button>
              <Button variant={variant} size="md" disabled>Desabilitado</Button>
              <Button variant={variant} size="md" loading>Carregando</Button>
            </div>
          ))}
        </div>
      </Section>

      <Section id="badges" title="Badges" description="Badges genéricos e badges de plano, com o plano recomendado em destaque.">
        <div className="mb-8 flex flex-wrap gap-3">
          <Badge variant="neutral">Neutral</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="accent">Accent</Badge>
          <Badge variant="accent-soft">Accent soft</Badge>
          <Badge variant="recommended">Recomendado</Badge>
          <Badge variant="dark">Dark</Badge>
        </div>
        <div className="flex flex-wrap gap-3">
          <Badge variant="neutral">Grátis</Badge>
          <Badge variant="recommended">Impulso · Recomendado</Badge>
          <Badge variant="dark">Mentoria</Badge>
        </div>
      </Section>

      <Section id="cards" title="Cards">
        <h3 className="mb-4 text-label font-semibold uppercase tracking-wide text-fg-muted">
          Service card (Consultoria)
        </h3>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <ServiceCard
            icon={Search}
            title="Recrutamento e Seleção"
            description="Encontramos e avaliamos os candidatos certos para a vaga certa."
            href="/consultoria/recrutamento-e-selecao"
          />
          <ServiceCard
            icon={Users2}
            title="Cultura Organizacional"
            description="Diagnóstico e construção de cultura alinhada à estratégia."
            href="/consultoria/cultura-organizacional"
          />
          <ServiceCard
            icon={LineChart}
            title="Cargos e Salários"
            description="Estrutura de cargos justa, competitiva e sustentável."
            href="/consultoria/cargos-e-salarios"
          />
        </div>

        <h3 className="mb-4 mt-10 text-label font-semibold uppercase tracking-wide text-fg-muted">
          Product card (Produtos de IA)
        </h3>
        <div className="grid gap-6 sm:grid-cols-2">
          <ProductCard
            icon={BrainCircuit}
            title="Cultura & Engajamento"
            description="Escuta contínua e mentor com IA para cada liderança."
            href="/produtos/cultura"
          />
          <ProductCard
            icon={GraduationCap}
            title="Ryze Academy"
            description="Trilhas de aprendizagem personalizadas para o seu time."
            href="/produtos/academy"
          />
        </div>

        <h3 className="mb-4 mt-10 text-label font-semibold uppercase tracking-wide text-fg-muted">
          Pricing card (Para Candidatos)
        </h3>
        <div className="grid gap-6 lg:grid-cols-3">
          <PricingCard
            name="Grátis"
            price="R$ 0"
            description="Para começar a busca com o pé direito."
            features={[
              "Currículo criado com IA",
              "Grupo de WhatsApp com vagas diárias",
            ]}
            ctaLabel="Começar grátis"
            ctaHref="/para-candidatos"
            footnote="Sem cartão de crédito"
          />
          <PricingCard
            name="Impulso"
            price="R$ 19,90"
            period="/mês"
            description="Currículo e entrevista otimizados por IA para cada vaga."
            features={[
              "Tudo do Grátis",
              "IA adapta o currículo para cada vaga",
              "Análise de LinkedIn com sugestões",
              "Simulador de entrevista com IA",
            ]}
            ctaLabel="Assinar Impulso"
            ctaHref="/para-candidatos/checkout?plano=impulso"
            recommended
          />
          <PricingCard
            name="Mentoria"
            price="R$ 49,90"
            period="/mês"
            description="Tudo do Impulso, com um consultor humano ao seu lado."
            features={[
              "Tudo do Impulso",
              "1 sessão mensal com consultor especializado",
              "Mentoria de carreira e simulação de entrevista",
            ]}
            ctaLabel="Assinar Mentoria"
            ctaHref="/para-candidatos/checkout?plano=mentoria"
          />
        </div>

        <h3 className="mb-4 mt-10 text-label font-semibold uppercase tracking-wide text-fg-muted">
          Content card (Blog) e card genérico
        </h3>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <ContentCard
            category="Carreira"
            date="12 jul 2026"
            title="Como usar IA para se destacar em processos seletivos"
            excerpt="Práticas simples para adaptar seu currículo e se preparar para entrevistas com apoio de inteligência artificial."
            href="/blog/ia-em-processos-seletivos"
          />
          <Card>
            <CardHeader>
              <CardTitle>Card genérico</CardTitle>
              <CardDescription>Bloco de conteúdo simples, sem CTA de link.</CardDescription>
            </CardHeader>
            <CardContent>Usado para conteúdo de apoio dentro de uma página.</CardContent>
            <CardFooter>
              <Button size="sm" variant="secondary">Ação</Button>
            </CardFooter>
          </Card>
        </div>
      </Section>

      <FoldDivider />

      <Section id="formularios" title="Formulários" description="Campos com foco visível em accent, estado de erro e checkbox customizado.">
        <div className="grid max-w-xl gap-5">
          <FormField label="Nome completo" htmlFor="nome" required>
            <Input id="nome" placeholder="Seu nome" />
          </FormField>
          <FormField label="E-mail" htmlFor="email" helperText="Usaremos apenas para contato." required>
            <Input id="email" type="email" placeholder="voce@email.com" />
          </FormField>
          <FormField label="E-mail inválido (exemplo de erro)" htmlFor="email-erro" error="Informe um e-mail válido.">
            <Input id="email-erro" type="email" invalid defaultValue="email-invalido" />
          </FormField>
          <FormField label="Área de interesse" htmlFor="area">
            <Select id="area" defaultValue="">
              <option value="" disabled>
                Selecione uma opção
              </option>
              <option value="consultoria">Consultoria</option>
              <option value="produtos">Produtos de IA</option>
              <option value="candidato">Sou candidato</option>
            </Select>
          </FormField>
          <FormField label="Mensagem" htmlFor="mensagem">
            <Textarea id="mensagem" placeholder="Como podemos ajudar?" />
          </FormField>
          <Checkbox id="termos" label="Concordo em receber comunicações da Ryze." />
        </div>
      </Section>
    </div>
  );
}
