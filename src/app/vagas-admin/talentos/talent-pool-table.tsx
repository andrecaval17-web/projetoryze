"use client";

import { useMemo, useState, useTransition } from "react";
import { Sparkles, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { scoreTalentsForJob, sendTalentsToPipeline } from "./actions";

const SOURCE_LABELS: Record<string, string> = {
  cadastro: "Cadastro",
  candidatura_vaga: "Candidatura a vaga",
};

export interface TalentPoolRow {
  id: string;
  source: string;
  name: string;
  email: string;
  phone: string | null;
  target_role: string | null;
  skills: string[];
  summary: string | null;
  created_at: string;
}

export interface JobOption {
  id: string;
  title: string;
}

export function TalentPoolTable({ talents, jobs }: { talents: TalentPoolRow[]; jobs: JobOption[] }) {
  const [selectedJobId, setSelectedJobId] = useState<string>(jobs[0]?.id ?? "");
  const [scores, setScores] = useState<Map<string, { score: number; reasoning: string }>>(new Map());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isAnalyzing, startAnalyzing] = useTransition();
  const [isSending, startSending] = useTransition();

  const sortedTalents = useMemo(() => {
    if (scores.size === 0) return talents;
    return [...talents].sort((a, b) => (scores.get(b.id)?.score ?? -1) - (scores.get(a.id)?.score ?? -1));
  }, [talents, scores]);

  function toggleSelected(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelectedIds((prev) => (prev.size === talents.length ? new Set() : new Set(talents.map((t) => t.id))));
  }

  function handleAnalyze() {
    if (!selectedJobId) return;
    setFeedback(null);
    const ids = selectedIds.size > 0 ? Array.from(selectedIds) : talents.map((t) => t.id);
    startAnalyzing(async () => {
      const result = await scoreTalentsForJob(selectedJobId, ids);
      if (result.status === "error") {
        setFeedback({ type: "error", message: result.message ?? "Não foi possível avaliar os candidatos." });
        return;
      }
      const next = new Map(scores);
      for (const r of result.results ?? []) {
        next.set(r.id, { score: r.score, reasoning: r.reasoning });
      }
      setScores(next);
    });
  }

  function handleSend() {
    if (!selectedJobId || selectedIds.size === 0) return;
    setFeedback(null);
    const ids = Array.from(selectedIds);
    startSending(async () => {
      const result = await sendTalentsToPipeline(selectedJobId, ids);
      setFeedback({ type: result.status, message: result.message ?? "" });
      if (result.status === "success") setSelectedIds(new Set());
    });
  }

  const selectedJob = jobs.find((j) => j.id === selectedJobId);

  return (
    <div>
      <div className="mt-6 flex flex-wrap items-center gap-3 rounded-lg border border-border bg-bg-surface px-4 py-3">
        <Sparkles className="h-4 w-4 shrink-0 text-accent-600" />
        <span className="text-body-sm font-medium text-fg">Avaliar com IA para a vaga:</span>
        <Select
          value={selectedJobId}
          onChange={(e) => {
            setSelectedJobId(e.target.value);
            setScores(new Map());
          }}
          className="h-9 w-auto min-w-48 py-0 text-body-sm"
          aria-label="Vaga para avaliação"
        >
          {jobs.length === 0 && <option value="">Nenhuma vaga aberta</option>}
          {jobs.map((job) => (
            <option key={job.id} value={job.id}>
              {job.title}
            </option>
          ))}
        </Select>
        <Button type="button" size="sm" onClick={handleAnalyze} loading={isAnalyzing} disabled={!selectedJobId}>
          {selectedIds.size > 0 ? `Avaliar ${selectedIds.size} selecionado${selectedIds.size > 1 ? "s" : ""}` : "Avaliar todos"}
        </Button>
      </div>

      {selectedIds.size > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-3 rounded-lg border border-accent-500/40 bg-accent-500/10 px-4 py-3">
          <span className="text-body-sm font-medium text-fg">
            {selectedIds.size} selecionado{selectedIds.size > 1 ? "s" : ""}
          </span>
          <Button
            type="button"
            size="sm"
            onClick={handleSend}
            loading={isSending}
            disabled={!selectedJobId}
            className="inline-flex items-center gap-1.5"
          >
            <Send className="h-3.5 w-3.5" />
            Enviar para {selectedJob?.title ?? "a vaga"}
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())}>
            Cancelar seleção
          </Button>
        </div>
      )}

      {feedback && (
        <p
          className={cn(
            "mt-3 rounded-md px-4 py-2.5 text-body-sm",
            feedback.type === "success" ? "bg-accent-500/10 text-accent-600" : "bg-error/10 text-error"
          )}
        >
          {feedback.message}
        </p>
      )}

      <div className="mt-4 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-body-sm">
          <thead className="border-b border-border bg-bg-surface text-caption uppercase tracking-wide text-fg-muted">
            <tr>
              <th className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedIds.size > 0 && selectedIds.size === talents.length}
                  onChange={toggleSelectAll}
                  aria-label="Selecionar todos"
                  className="h-3.5 w-3.5 accent-accent-500"
                />
              </th>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">E-mail</th>
              <th className="px-4 py-3">Cargo desejado</th>
              <th className="px-4 py-3">Habilidades</th>
              <th className="px-4 py-3">Origem</th>
              {scores.size > 0 && <th className="px-4 py-3">Aderência (IA)</th>}
              <th className="px-4 py-3">Data</th>
            </tr>
          </thead>
          <tbody>
            {sortedTalents.map((t) => {
              const score = scores.get(t.id);
              return (
                <tr key={t.id} className="border-b border-border last:border-0 align-top">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(t.id)}
                      onChange={() => toggleSelected(t.id)}
                      aria-label={`Selecionar ${t.name}`}
                      className="h-3.5 w-3.5 accent-accent-500"
                    />
                  </td>
                  <td className="px-4 py-3 font-medium text-fg">{t.name}</td>
                  <td className="px-4 py-3 text-fg-muted">{t.email}</td>
                  <td className="px-4 py-3 text-fg-muted">{t.target_role || "—"}</td>
                  <td className="px-4 py-3">
                    {t.skills.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {t.skills.slice(0, 6).map((s) => (
                          <Badge key={s} variant="neutral">
                            {s}
                          </Badge>
                        ))}
                        {t.skills.length > 6 && <Badge variant="neutral">+{t.skills.length - 6}</Badge>}
                      </div>
                    ) : (
                      <span className="text-fg-muted">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={t.source === "candidatura_vaga" ? "accent-soft" : "neutral"}>
                      {SOURCE_LABELS[t.source] ?? t.source}
                    </Badge>
                  </td>
                  {scores.size > 0 && (
                    <td className="px-4 py-3">
                      {score ? (
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-caption font-semibold",
                            score.score >= 70 ? "bg-accent-500/15 text-accent-600" : "bg-bg-surface-2 text-fg-muted"
                          )}
                          title={score.reasoning}
                        >
                          {score.score}
                        </span>
                      ) : (
                        <span className="text-fg-muted">—</span>
                      )}
                    </td>
                  )}
                  <td className="px-4 py-3 whitespace-nowrap text-fg-muted">
                    {new Date(t.created_at).toLocaleDateString("pt-BR")}
                  </td>
                </tr>
              );
            })}
            {talents.length === 0 && (
              <tr>
                <td colSpan={scores.size > 0 ? 8 : 7} className="px-4 py-8 text-center text-fg-muted">
                  Nenhum registro encontrado com esses filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
