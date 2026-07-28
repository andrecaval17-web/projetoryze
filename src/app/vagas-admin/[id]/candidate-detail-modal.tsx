"use client";

import { useEffect } from "react";
import { X, ExternalLink, FileDown } from "lucide-react";
import { Select } from "@/components/ui/select";
import { STAGES, type KanbanApplication } from "./kanban-board";
import type { ApplicationStatus } from "../actions";

interface CandidateDetailModalProps {
  application: KanbanApplication;
  onClose: () => void;
  onStatusChange: (applicationId: string, next: ApplicationStatus) => void;
}

export function CandidateDetailModal({ application, onClose, onStatusChange }: CandidateDetailModalProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-y-auto rounded-lg border border-border bg-bg-surface p-8 shadow-glow-md"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-5 top-5 text-fg-muted transition-ryze hover:text-fg"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start justify-between gap-4 pr-8">
          <div>
            <h2 className="font-display text-heading-lg font-semibold text-fg">{application.name}</h2>
            {application.candidateUserId && (
              <p className="mt-0.5 text-caption text-fg-muted">Também tem conta de candidato na Ryze</p>
            )}
          </div>
          {application.score !== null && (
            <div className="flex shrink-0 flex-col items-center rounded-lg bg-bg-surface-2 px-4 py-2 text-center">
              <span className="font-display text-display-sm font-bold leading-none text-accent-600">
                {application.score}
              </span>
              <span className="text-caption text-fg-muted">/ 100</span>
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-body-sm text-fg-muted">
          <span>{application.email}</span>
          {application.phone && <span>{application.phone}</span>}
          {application.linkedinUrl && (
            <a
              href={application.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-accent-600 hover:underline"
            >
              LinkedIn <ExternalLink className="h-3 w-3" />
            </a>
          )}
          {application.resumeUrl && (
            <a
              href={application.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-accent-600 hover:underline"
            >
              <FileDown className="h-3.5 w-3.5" /> Currículo (PDF)
            </a>
          )}
        </div>

        <div className="mt-5">
          <label className="text-body-sm font-medium text-fg">Etapa do pipeline</label>
          <Select
            value={application.pipelineStatus}
            onChange={(e) => onStatusChange(application.id, e.target.value as ApplicationStatus)}
            className="mt-1.5 max-w-xs"
            aria-label="Etapa do pipeline"
          >
            {STAGES.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </Select>
        </div>

        {application.scoreReasoning && (
          <div className="mt-6">
            <h3 className="font-display text-heading-sm font-semibold text-fg">Análise de aderência</h3>
            <p className="mt-2 text-body-md leading-relaxed text-fg">{application.scoreReasoning}</p>
          </div>
        )}

        {application.answers.length > 0 && (
          <div className="mt-6">
            <h3 className="font-display text-heading-sm font-semibold text-fg">Respostas</h3>
            <dl className="mt-3 flex flex-col gap-4">
              {application.answers.map((item, index) => (
                <div key={index}>
                  <dt className="text-body-sm font-medium text-fg">{item.question}</dt>
                  <dd className="mt-1 text-body-sm leading-relaxed text-fg-muted">{item.answer}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}
