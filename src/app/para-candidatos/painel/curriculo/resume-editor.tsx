"use client";

import { useState, useTransition } from "react";
import { Download, Plus, Trash2, Check, AlertCircle, RefreshCw } from "lucide-react";
import {
  RESUME_TEMPLATES,
  emptyPeriod,
  type ResumeData,
  type ResumeTemplateSlug,
  type ResumeExperience,
  type ResumeEducation,
} from "@/lib/resume-schema";
import { RESUME_PREVIEW_COMPONENTS } from "@/components/resume-templates/preview";
import { downloadResumePdf } from "@/lib/download-resume-pdf";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { TagInput } from "@/components/ui/tag-input";
import { PeriodFields } from "./period-fields";
import { cn } from "@/lib/utils";

interface ResumeEditorProps {
  initialData: ResumeData;
  initialTemplate: ResumeTemplateSlug;
  isPaid: boolean;
  /** Persiste os dados — cada tela chamadora decide o destino (candidate_profiles.profile_data ou resume_versions).
   * `session_mismatch` é o mesmo sinal de sessão obsoleta de `saveBaseProfile` (ver profile-actions.ts) —
   * precisa chegar até aqui com a mensagem intacta, senão o candidato só vê um bloqueio sem explicação. */
  onSave: (
    data: ResumeData,
    templateSlug: ResumeTemplateSlug
  ) => Promise<{ status: "idle" | "success" | "error" | "session_mismatch"; message?: string }>;
}

export function ResumeEditor({ initialData, initialTemplate, isPaid, onSave }: ResumeEditorProps) {
  const [data, setData] = useState<ResumeData>(initialData);
  const [templateSlug, setTemplateSlug] = useState<ResumeTemplateSlug>(initialTemplate);
  const [saveState, setSaveState] = useState<"idle" | "saved" | "error" | "session_mismatch">("idle");
  const [saveMessage, setSaveMessage] = useState<string | undefined>();
  const [isSaving, startSave] = useTransition();
  const [pdfState, setPdfState] = useState<"idle" | "generating" | "error">("idle");

  const availableTemplates = isPaid ? RESUME_TEMPLATES : RESUME_TEMPLATES.filter((t) => !t.paidOnly);
  const PreviewComponent = RESUME_PREVIEW_COMPONENTS[templateSlug];

  function updateField<K extends keyof ResumeData>(key: K, value: ResumeData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
    setSaveState("idle");
  }

  function updateContato(field: keyof ResumeData["contato"], value: string) {
    setData((prev) => ({ ...prev, contato: { ...prev.contato, [field]: value } }));
    setSaveState("idle");
  }

  function updateExperience<K extends keyof ResumeExperience>(index: number, field: K, value: ResumeExperience[K]) {
    setData((prev) => ({
      ...prev,
      experiencias: prev.experiencias.map((exp, i) => (i === index ? { ...exp, [field]: value } : exp)),
    }));
    setSaveState("idle");
  }

  function addExperience() {
    setData((prev) => ({
      ...prev,
      experiencias: [...prev.experiencias, { cargo: "", empresa: "", periodo: { ...emptyPeriod }, descricao: "" }],
    }));
  }

  function removeExperience(index: number) {
    setData((prev) => ({ ...prev, experiencias: prev.experiencias.filter((_, i) => i !== index) }));
    setSaveState("idle");
  }

  function updateEducation<K extends keyof ResumeEducation>(index: number, field: K, value: ResumeEducation[K]) {
    setData((prev) => ({
      ...prev,
      formacao: prev.formacao.map((f, i) => (i === index ? { ...f, [field]: value } : f)),
    }));
    setSaveState("idle");
  }

  function addEducation() {
    setData((prev) => ({
      ...prev,
      formacao: [...prev.formacao, { curso: "", instituicao: "", periodo: { ...emptyPeriod } }],
    }));
  }

  function removeEducation(index: number) {
    setData((prev) => ({ ...prev, formacao: prev.formacao.filter((_, i) => i !== index) }));
    setSaveState("idle");
  }

  function handleSave() {
    startSave(async () => {
      const result = await onSave(data, templateSlug);
      setSaveState(
        result.status === "success" ? "saved" : result.status === "session_mismatch" ? "session_mismatch" : "error"
      );
      setSaveMessage(result.message);
    });
  }

  async function handleDownloadPdf() {
    setPdfState("generating");
    try {
      await downloadResumePdf(data, templateSlug);
      setPdfState("idle");
    } catch (err) {
      console.error("PDF export failed", err);
      setPdfState("error");
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="flex flex-col gap-6">
        {availableTemplates.length > 1 && (
          <div>
            <Label>Modelo visual</Label>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {availableTemplates.map((t) => (
                <button
                  key={t.slug}
                  type="button"
                  onClick={() => {
                    setTemplateSlug(t.slug);
                    setSaveState("idle");
                  }}
                  className={cn(
                    "rounded-md border px-3 py-2 text-left text-body-sm transition-ryze",
                    templateSlug === t.slug
                      ? "border-accent-500 bg-accent-500/10 text-fg"
                      : "border-border bg-bg-surface text-fg-muted hover:border-accent-500/40"
                  )}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="nome">Nome</Label>
            <Input id="nome" value={data.nome} onChange={(e) => updateField("nome", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="titulo">Título profissional</Label>
            <Input id="titulo" value={data.titulo} onChange={(e) => updateField("titulo", e.target.value)} />
          </div>
        </div>

        <div>
          <Label htmlFor="resumo">Resumo</Label>
          <Textarea
            id="resumo"
            rows={3}
            value={data.resumo}
            onChange={(e) => updateField("resumo", e.target.value)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="contato-email">E-mail</Label>
            <Input
              id="contato-email"
              value={data.contato.email}
              onChange={(e) => updateContato("email", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="contato-telefone">Telefone</Label>
            <Input
              id="contato-telefone"
              value={data.contato.telefone}
              onChange={(e) => updateContato("telefone", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="contato-linkedin">LinkedIn</Label>
            <Input
              id="contato-linkedin"
              value={data.contato.linkedin}
              onChange={(e) => updateContato("linkedin", e.target.value)}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label>Experiência</Label>
            <Button type="button" variant="ghost" size="sm" onClick={addExperience}>
              <Plus className="h-3.5 w-3.5" /> Adicionar
            </Button>
          </div>
          <div className="flex flex-col gap-4">
            {data.experiencias.map((exp, i) => (
              <div key={i} className="rounded-md border border-border p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="grid flex-1 gap-3 sm:grid-cols-2">
                    <Input
                      placeholder="Cargo"
                      value={exp.cargo}
                      onChange={(e) => updateExperience(i, "cargo", e.target.value)}
                    />
                    <Input
                      placeholder="Empresa"
                      value={exp.empresa}
                      onChange={(e) => updateExperience(i, "empresa", e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeExperience(i)}
                    aria-label="Remover experiência"
                    className="mt-1 text-fg-muted transition-ryze hover:text-error"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-3">
                  <PeriodFields value={exp.periodo} onChange={(p) => updateExperience(i, "periodo", p)} />
                </div>
                <Textarea
                  className="mt-3"
                  rows={2}
                  placeholder="Descrição"
                  value={exp.descricao}
                  onChange={(e) => updateExperience(i, "descricao", e.target.value)}
                />
              </div>
            ))}
            {data.experiencias.length === 0 && (
              <p className="text-body-sm text-fg-muted">Nenhuma experiência adicionada.</p>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label>Formação</Label>
            <Button type="button" variant="ghost" size="sm" onClick={addEducation}>
              <Plus className="h-3.5 w-3.5" /> Adicionar
            </Button>
          </div>
          <div className="flex flex-col gap-3">
            {data.formacao.map((f, i) => (
              <div key={i} className="rounded-md border border-border p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="grid flex-1 gap-3 sm:grid-cols-2">
                    <Input
                      placeholder="Curso"
                      value={f.curso}
                      onChange={(e) => updateEducation(i, "curso", e.target.value)}
                    />
                    <Input
                      placeholder="Instituição"
                      value={f.instituicao}
                      onChange={(e) => updateEducation(i, "instituicao", e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeEducation(i)}
                    aria-label="Remover formação"
                    className="mt-1 text-fg-muted transition-ryze hover:text-error"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-3">
                  <PeriodFields value={f.periodo} onChange={(p) => updateEducation(i, "periodo", p)} />
                </div>
              </div>
            ))}
            {data.formacao.length === 0 && (
              <p className="text-body-sm text-fg-muted">Nenhuma formação adicionada.</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="habilidades">Habilidades</Label>
          <TagInput
            id="habilidades"
            value={data.habilidades}
            onChange={(tags) => updateField("habilidades", tags)}
            placeholder="Digite e pressione Enter..."
          />
        </div>

        <div>
          <Label htmlFor="idiomas">Idiomas</Label>
          <TagInput
            id="idiomas"
            value={data.idiomas}
            onChange={(tags) => updateField("idiomas", tags)}
            placeholder="Ex: Inglês avançado"
          />
        </div>

        {saveState === "session_mismatch" && (
          <div className="flex flex-col items-start gap-3 rounded-lg border border-error/40 bg-error/10 p-4">
            <p className="flex items-center gap-2 text-body-sm text-error">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {saveMessage ??
                "Outra conta foi acessada em outra aba deste navegador. Pra não salvar dados na conta errada, recarregue esta página antes de continuar."}
            </p>
            <Button type="button" size="sm" variant="secondary" onClick={() => window.location.reload()}>
              <RefreshCw className="h-3.5 w-3.5" />
              Recarregar página
            </Button>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" onClick={handleSave} loading={isSaving} disabled={saveState === "session_mismatch"}>
            {saveState === "saved" && !isSaving ? <Check className="h-4 w-4" /> : null}
            Salvar alterações
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={handleDownloadPdf}
            loading={pdfState === "generating"}
          >
            <Download className="h-4 w-4" />
            Baixar em PDF
          </Button>
          {saveState === "error" && (
            <span className="flex items-center gap-1.5 text-body-sm text-error">
              <AlertCircle className="h-4 w-4" /> {saveMessage ?? "Não foi possível salvar."}
            </span>
          )}
          {pdfState === "error" && (
            <span className="flex items-center gap-1.5 text-body-sm text-error">
              <AlertCircle className="h-4 w-4" /> Não foi possível gerar o PDF.
            </span>
          )}
        </div>
      </div>

      <div className="lg:sticky lg:top-8 lg:self-start">
        <p className="mb-3 text-body-sm text-fg-muted">Pré-visualização</p>
        <div className="overflow-x-auto rounded-md bg-bg-surface-2 p-4">
          <PreviewComponent data={data} />
        </div>
      </div>
    </div>
  );
}
