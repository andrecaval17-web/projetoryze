"use client";

import { useMemo, useState, useTransition } from "react";
import { updateApplicationStatus, type ApplicationStatus } from "../actions";
import { Select } from "@/components/ui/select";
import { CandidateDetailModal } from "./candidate-detail-modal";
import { cn } from "@/lib/utils";

export interface AnswerItem {
  question: string;
  answer: string;
}

export interface KanbanApplication {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  linkedinUrl: string | null;
  resumeUrl: string | null;
  score: number | null;
  scoreReasoning: string | null;
  pipelineStatus: ApplicationStatus;
  createdAt: string;
  candidateUserId: string | null;
  answers: AnswerItem[];
}

export const STAGES: { key: ApplicationStatus; label: string }[] = [
  { key: "triagem", label: "Triagem" },
  { key: "contato", label: "Contato" },
  { key: "entrevista_ryze", label: "Entrevista Ryze" },
  { key: "entrevista_rh", label: "Entrevista RH" },
  { key: "contratado", label: "Contratado" },
  { key: "rejeitado", label: "Rejeitado" },
];

export function KanbanBoard({
  jobId,
  applications: initialApplications,
}: {
  jobId: string;
  applications: KanbanApplication[];
}) {
  // Estado local otimista — a troca de coluna precisa parecer instantânea;
  // `revalidatePath` na Server Action já mantém o servidor consistente, mas
  // não vale a pena esperar o round-trip só pra mover o card na tela.
  const [applications, setApplications] = useState(initialApplications);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function handleStatusChange(applicationId: string, next: ApplicationStatus) {
    setApplications((prev) =>
      prev.map((a) => (a.id === applicationId ? { ...a, pipelineStatus: next } : a))
    );
    startTransition(async () => {
      await updateApplicationStatus(applicationId, jobId, next);
    });
  }

  const columns = useMemo(
    () => STAGES.map((stage) => ({ ...stage, items: applications.filter((a) => a.pipelineStatus === stage.key) })),
    [applications]
  );

  const selected = applications.find((a) => a.id === selectedId) ?? null;

  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((col) => (
          <div
            key={col.key}
            className="flex w-72 shrink-0 flex-col rounded-xl border border-border bg-bg-surface"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="font-display text-body-sm font-semibold text-fg">{col.label}</span>
              <span className="rounded-full bg-bg-surface-2 px-2 py-0.5 text-caption font-medium text-fg-muted">
                {col.items.length}
              </span>
            </div>
            <div className="flex flex-1 flex-col gap-2.5 p-3">
              {col.items.map((app) => (
                <div
                  key={app.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedId(app.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") setSelectedId(app.id);
                  }}
                  className="cursor-pointer rounded-lg border border-border bg-bg p-3 text-left transition-ryze hover:border-accent-500/50 hover:shadow-glow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-body-sm font-medium text-fg">{app.name}</span>
                    {app.score !== null && (
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2 py-0.5 text-caption font-semibold",
                          app.score >= 70
                            ? "bg-accent-500/15 text-accent-600 dark:text-accent-400"
                            : "bg-bg-surface-2 text-fg-muted"
                        )}
                      >
                        {app.score}
                      </span>
                    )}
                  </div>
                  <div className="mt-2.5" onClick={(e) => e.stopPropagation()}>
                    <Select
                      value={app.pipelineStatus}
                      onChange={(e) => handleStatusChange(app.id, e.target.value as ApplicationStatus)}
                      className="h-8 py-0 text-caption"
                      aria-label={`Etapa de ${app.name}`}
                    >
                      {STAGES.map((s) => (
                        <option key={s.key} value={s.key}>
                          {s.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
              ))}
              {col.items.length === 0 && (
                <p className="px-1 py-6 text-center text-caption text-fg-muted">Nenhum candidato</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <CandidateDetailModal
          application={selected}
          onClose={() => setSelectedId(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </>
  );
}
