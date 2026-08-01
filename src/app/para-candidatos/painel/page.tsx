import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FileText, MessageSquare, Lock, CalendarCheck, TrendingUp, Check } from "lucide-react";
import { getSupabaseServerClient, getCurrentUserPlan, getCurrentSubscription } from "@/lib/supabase/server";
import { normalizeResumeData } from "@/lib/resume-schema";
import { Badge } from "@/components/ui/badge";
import { LinkedinIcon } from "@/components/ui/social-icons";
import { GuidedJourney } from "@/components/painel/guided-journey";
import { FreePlanNudge } from "@/components/painel/free-plan-nudge";
import { getOnboardingJourney, pickCurrentJobApplication } from "@/lib/guided-flow";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { openBillingPortal } from "./actions";

export const metadata: Metadata = {
  title: "Sua área — Ryze",
  robots: { index: false, follow: false },
};

const tools = [
  {
    icon: FileText,
    title: "Currículo com IA",
    description: "Monte um currículo estruturado e baixe em PDF.",
    href: "/para-candidatos/painel/curriculo",
    // Recurso do plano Grátis também — os demais exigem plano pago.
    minPlan: "gratis" as const,
  },
  {
    icon: LinkedinIcon,
    title: "Análise de LinkedIn",
    description: "Envie o PDF do seu perfil e receba sugestões de melhoria.",
    href: "/para-candidatos/painel/linkedin",
    minPlan: "impulso" as const,
  },
  {
    icon: MessageSquare,
    title: "Simulação de entrevista",
    description: "Treine por voz com uma IA entrevistadora.",
    href: "/para-candidatos/painel/entrevista",
    minPlan: "impulso" as const,
  },
  {
    icon: CalendarCheck,
    title: "Sessão de Mentoria",
    description: "Agende sua sessão mensal de 30 minutos com um consultor.",
    href: "/para-candidatos/painel/mentoria",
    minPlan: "mentoria" as const,
  },
  {
    icon: TrendingUp,
    title: "Painel de evolução",
    description: "Acompanhe sua pontuação no LinkedIn e o que você já produziu.",
    href: "/para-candidatos/painel/evolucao",
    // Recurso Impulso+ — a própria página mostra o mesmo paywall das outras
    // ferramentas pagas pra quem tenta acessar direto pela URL (achado da
    // auditoria de UX de 2026-07-23; antes o card ficava aberto pro Grátis
    // e só o conteúdo interno vinha travado).
    minPlan: "impulso" as const,
  },
];

const planLabel: Record<string, string> = {
  gratis: "Grátis",
  impulso: "Impulso",
  mentoria: "Mentoria",
};

export default async function PainelPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/cadastro?plano=gratis");
  }

  const { data: profile } = await supabase
    .from("candidate_profiles")
    .select("profile_data, full_name")
    .eq("user_id", user.id)
    .maybeSingle();

  // Antes redirecionava direto pro "Preencher perfil" quando não havia
  // perfil ainda — o candidato Grátis nunca via o hub com os outros planos
  // a não ser que clicasse "Voltar". Pedido do cliente em 2026-07-28: a
  // primeira tela mostra todas as ferramentas/planos, com "Currículo com
  // IA" (Grátis) destacado como já disponível — ver highlightAvailable
  // abaixo — em vez de forçar direto pro formulário.
  const hasProfile = !!profile?.profile_data;
  const resumeData = hasProfile ? normalizeResumeData(profile.profile_data) : null;
  const displayName =
    resumeData?.nome ||
    profile?.full_name ||
    (user.user_metadata?.full_name as string | undefined) ||
    "Candidato";

  const plan = await getCurrentUserPlan() ?? "gratis";
  const isPaid = plan === "impulso" || plan === "mentoria";
  const planRank: Record<string, number> = { gratis: 0, impulso: 1, mentoria: 2 };

  // Guia de onboarding — só existe pro candidato pago (ver proposta em
  // HANDOFF.md). Nada aqui duplica o Painel de evolução: os "passos" são
  // derivados na hora das mesmas tabelas (job_applications, mentoring_
  // sessions), nunca gravados como progresso à parte.
  const subscription = isPaid ? await getCurrentSubscription() : null;
  let onboardingSteps: ReturnType<typeof getOnboardingJourney> = [];
  if (subscription) {
    const { data: jobApplications } = await supabase
      .from("job_applications")
      .select("id, linkedin_analysis_id, interview_session_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    const { data: mentoriaSession } = await supabase
      .from("mentoring_sessions")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "confirmed")
      .limit(1)
      .maybeSingle();

    onboardingSteps = getOnboardingJourney({
      hasProfile,
      jobApplication: pickCurrentJobApplication(jobApplications ?? []),
      hasMentoriaConfirmed: !!mentoriaSession,
      isMentoriaPlan: plan === "mentoria",
    });
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-16 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-display-md font-semibold text-fg">
            Olá, {displayName.split(" ")[0]}
          </h1>
          <p className="mt-1 text-body-sm text-fg-muted">Suas ferramentas de IA para a busca de vagas.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={isPaid ? "recommended" : "neutral"}>
            Plano {planLabel[plan]}
          </Badge>
          {isPaid && (
            <form action={openBillingPortal}>
              <Button type="submit" variant="ghost" size="sm" className="border-border">
                Gerenciar assinatura
              </Button>
            </form>
          )}
        </div>
      </div>

      {subscription && (
        <div className="mt-10">
          <GuidedJourney
            subscriptionId={subscription.id}
            steps={onboardingSteps}
            planLabel={planLabel[plan]}
            showIntroInitially={!subscription.onboarding_seen_at}
          />
        </div>
      )}

      {!isPaid && hasProfile && (
        <div className="mt-10">
          <FreePlanNudge />
        </div>
      )}

      <div className={cn("grid gap-6 sm:grid-cols-2 lg:grid-cols-4", subscription || !isPaid ? "mt-2" : "mt-10")}>
        {tools.map(({ icon: Icon, title, description, href, minPlan }) => {
          const locked = planRank[plan] < planRank[minPlan];
          // Toda ferramenta já liberada pro plano atual ganha destaque
          // sólido (não só a ausência de cadeado) — no Grátis só o
          // Currículo cai aqui, mas no Impulso/Mentoria isso cobre várias
          // ferramentas de uma vez. Achado do cliente em 2026-07-28: antes
          // isso era fixo em `minPlan === "gratis"`, então uma conta
          // Mentoria via só o Currículo destacado mesmo com as outras 4
          // ferramentas já liberadas.
          const highlightAvailable = !locked;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group relative flex flex-col rounded-lg border p-6 shadow-sm transition-ryze hover:-translate-y-0.5 hover:shadow-md",
                highlightAvailable
                  ? "border-accent-500/50 bg-accent-500/5 hover:border-accent-500"
                  : "border-border bg-bg-surface hover:border-accent-500/40"
              )}
            >
              <div className="mb-4 flex items-center justify-between">
                <span
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-md",
                    highlightAvailable
                      ? "bg-gradient-ryze text-white shadow-glow-sm"
                      : "bg-bg-surface-2 text-accent-600 dark:text-accent-400"
                  )}
                >
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                {locked ? (
                  <span className="flex items-center gap-1 text-caption text-fg-muted">
                    <Lock className="h-3.5 w-3.5" />
                    {minPlan === "mentoria" ? "Mentoria" : "Impulso+"}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-caption font-medium text-accent-600 dark:text-accent-400">
                    <Check className="h-3.5 w-3.5" />
                    Disponível
                  </span>
                )}
              </div>
              <h3 className="font-display text-heading-sm font-semibold text-fg">{title}</h3>
              <p className="mt-1 text-body-sm text-fg-muted">{description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
