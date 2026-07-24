"use client";

import Link from "next/link";
import { useActionState, useState, useTransition } from "react";
import { AlertCircle, UploadCloud, FileCheck2, ArrowRight, RefreshCw, CheckSquare, Square } from "lucide-react";
import {
  analyzeLinkedin,
  reuseLinkedinAnalysis,
  toggleLinkedinNextStep,
  type LinkedinState,
  type NextStep,
} from "./actions";
import { FormField } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AiMarkdown } from "@/components/ui/ai-markdown";
import { cn } from "@/lib/utils";

const initialState: LinkedinState = { status: "idle" };

// Mesmo limite do servidor (painel/linkedin/actions.ts) — checar aqui evita
// mandar um arquivo grande demais pro servidor só pra receber um erro
// genérico de corpo de requisição excedido.
const MAX_FILE_SIZE_BYTES = 6 * 1024 * 1024;

interface LinkedinFormProps {
  existingAnalysis: string | null;
  existingScore: number | null;
  existingNextSteps: NextStep[] | null;
  existingAnalysisId: string | null;
  /** Presente só quando chegou pelo fluxo guiado (?vaga=). */
  jobApplicationId?: string;
  /** Vaga já tem uma análise vinculada (reaproveitada numa visita anterior
   * a esta mesma tela) — pula direto pro "próximo passo". */
  alreadyLinkedToJob?: boolean;
}

export function LinkedinForm({
  existingAnalysis,
  existingScore,
  existingNextSteps,
  existingAnalysisId,
  jobApplicationId,
  alreadyLinkedToJob,
}: LinkedinFormProps) {
  const [state, formAction, isPending] = useActionState(analyzeLinkedin, initialState);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isReusing, startReuse] = useTransition();
  const [reuseError, setReuseError] = useState<string | null>(null);

  // No fluxo guiado, com análise existente e ainda não vinculada a esta
  // vaga: pergunta "usar essa ou refazer" antes de mostrar o upload —
  // reanalisar o mesmo PDF a cada vaga nova seria trabalho repetido à toa
  // (a análise avalia o perfil, não é específica da vaga).
  const [choosingReuse, setChoosingReuse] = useState(
    !!jobApplicationId && !!existingAnalysis && !alreadyLinkedToJob
  );
  const [reused, setReused] = useState(false);

  // Checklist marcável — parte do estado local pra dar feedback imediato
  // ao marcar/desmarcar. Sincronizado com o resultado de uma análise nova
  // ajustando o estado durante a própria renderização (comparando com o
  // `state` da renderização anterior) em vez de um useEffect — é o padrão
  // recomendado pelo React pra "adaptar estado quando uma prop/estado
  // externo muda", e evita o cascading render de setState dentro de efeito.
  const [analysisId, setAnalysisId] = useState<string | null>(existingAnalysisId);
  const [nextSteps, setNextSteps] = useState<NextStep[]>(existingNextSteps ?? []);
  const [isToggling, startToggle] = useTransition();
  const [prevState, setPrevState] = useState(state);

  if (state !== prevState) {
    setPrevState(state);
    if (state.status === "success") {
      setAnalysisId(state.analysisId ?? null);
      setNextSteps(state.nextSteps ?? []);
    }
  }

  const analysisToShow = state.status === "success" ? state.analysis : existingAnalysis;
  const scoreToShow = state.status === "success" ? state.score : existingScore;
  const showNextStepCta =
    !!jobApplicationId && (reused || alreadyLinkedToJob || (state.status === "success" && !!state.jobApplicationId));

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setFileName(null);
      setFileError(null);
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setFileName(null);
      setFileError("O PDF é grande demais (máximo 6 MB). Tente exportar novamente ou reduzir o arquivo.");
      e.target.value = "";
      return;
    }
    setFileName(file.name);
    setFileError(null);
  }

  function handleReuse() {
    if (!jobApplicationId) return;
    setReuseError(null);
    startReuse(async () => {
      const result = await reuseLinkedinAnalysis(jobApplicationId);
      if (result.status === "success") {
        setReused(true);
        setChoosingReuse(false);
      } else {
        setReuseError(result.message ?? "Não foi possível reaproveitar a análise.");
      }
    });
  }

  function handleToggleStep(index: number) {
    if (!analysisId) return;
    setNextSteps((prev) => prev.map((s, i) => (i === index ? { ...s, done: !s.done } : s)));
    startToggle(async () => {
      const result = await toggleLinkedinNextStep(analysisId, index);
      if (result.status === "error") {
        // Reverte o otimismo se o servidor recusou.
        setNextSteps((prev) => prev.map((s, i) => (i === index ? { ...s, done: !s.done } : s)));
      }
    });
  }

  if (choosingReuse) {
    return (
      <div className="rounded-lg border border-accent-500/40 bg-bg-surface p-6 shadow-glow-sm">
        <h2 className="font-display text-heading-sm font-semibold text-fg">Você já tem uma análise de LinkedIn</h2>
        <p className="mt-2 text-body-sm text-fg-muted">
          Ela avalia seu perfil em geral, não uma vaga específica — pode reaproveitar pra esta vaga ou enviar o PDF
          de novo se atualizou o perfil recentemente.
        </p>
        {reuseError && (
          <p className="mt-3 flex items-center gap-2 rounded-md bg-error/10 px-4 py-3 text-body-sm text-error">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {reuseError}
          </p>
        )}
        <div className="mt-5 flex flex-wrap gap-3">
          <Button type="button" loading={isReusing} onClick={handleReuse}>
            Usar essa análise
          </Button>
          <Button type="button" variant="secondary" onClick={() => setChoosingReuse(false)}>
            <RefreshCw className="h-3.5 w-3.5" />
            Refazer com um PDF novo
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      {!reused && (
        <form action={formAction} className="flex flex-col gap-5">
          {jobApplicationId && <input type="hidden" name="job_application_id" value={jobApplicationId} />}
          <FormField
            label="PDF do seu perfil do LinkedIn"
            htmlFor="pdf"
            helperText="No LinkedIn: seu Perfil → botão 'Mais' → 'Salvar como PDF'."
            required
          >
            <label
              htmlFor="pdf"
              className="flex cursor-pointer flex-col items-center gap-2 rounded-md border border-dashed border-border-strong bg-bg px-4 py-8 text-center transition-ryze hover:border-accent-500/50 hover:bg-bg-surface"
            >
              {fileName ? (
                <>
                  <FileCheck2 className="h-6 w-6 text-accent-600 dark:text-accent-400" />
                  <span className="text-body-sm text-fg">{fileName}</span>
                </>
              ) : (
                <>
                  <UploadCloud className="h-6 w-6 text-fg-muted" />
                  <span className="text-body-sm text-fg-muted">Clique para escolher o PDF</span>
                </>
              )}
            </label>
            <input
              id="pdf"
              name="pdf"
              type="file"
              accept="application/pdf"
              required
              className="sr-only"
              onChange={handleFileChange}
            />
          </FormField>

          {(fileError || state.status === "error") && (
            <p className="flex items-center gap-2 rounded-md bg-error/10 px-4 py-3 text-body-sm text-error">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {fileError ?? state.message}
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            loading={isPending}
            disabled={!!fileError}
            className="w-full sm:w-auto"
          >
            Analisar perfil
          </Button>
        </form>
      )}

      {analysisToShow && (
        <div className="rounded-lg border border-accent-500/40 bg-bg-surface p-6 shadow-glow-sm">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-heading-sm font-semibold text-fg">
              {reused ? "Análise reaproveitada" : state.status === "success" ? "Análise" : "Última análise"}
            </h2>
            {typeof scoreToShow === "number" && scoreToShow > 0 && (
              <Badge variant={scoreToShow >= 70 ? "recommended" : "neutral"}>Nota: {scoreToShow}/100</Badge>
            )}
          </div>
          <AiMarkdown content={analysisToShow} />
        </div>
      )}

      {nextSteps.length > 0 && (
        <div className="rounded-lg border border-border bg-bg-surface p-6">
          <h2 className="mb-1 font-display text-heading-sm font-semibold text-fg">Próximos passos</h2>
          <p className="mb-4 text-body-sm text-fg-muted">Marque conforme for aplicando cada melhoria.</p>
          <ul className="flex flex-col gap-2.5">
            {nextSteps.map((step, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => handleToggleStep(i)}
                  disabled={isToggling || !analysisId}
                  className="flex w-full items-start gap-2.5 rounded-md p-2 text-left transition-ryze hover:bg-bg-surface-2 disabled:cursor-not-allowed"
                >
                  {step.done ? (
                    <CheckSquare className="mt-0.5 h-4 w-4 shrink-0 text-accent-600 dark:text-accent-400" />
                  ) : (
                    <Square className="mt-0.5 h-4 w-4 shrink-0 text-fg-muted" />
                  )}
                  <span className={cn("text-body-sm", step.done ? "text-fg-muted line-through" : "text-fg")}>
                    {step.text}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {showNextStepCta && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-accent-500/40 bg-accent-500/5 p-4">
          <p className="text-body-sm text-fg">Continue o fluxo guiado com a Simulação de Entrevista pra esta vaga.</p>
          <Button asChild size="sm">
            <Link href={`/para-candidatos/painel/entrevista?vaga=${jobApplicationId}`}>
              Continuar
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
