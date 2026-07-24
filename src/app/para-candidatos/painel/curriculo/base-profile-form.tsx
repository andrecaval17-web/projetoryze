"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Sparkles,
  UploadCloud,
  FileCheck2,
  AlertCircle,
  Check,
  CheckCircle2,
  Circle,
  Lock,
  CloudUpload,
  RefreshCw,
} from "lucide-react";
import {
  emptyResumeData,
  emptyPeriod,
  type ResumeData,
  type ResumeExperience,
  type ResumeEducation,
} from "@/lib/resume-schema";
import {
  extractProfileFromText,
  extractProfileFromFile,
  saveBaseProfile,
  improveResumeText,
  type ExtractProfileState,
} from "./profile-actions";
import { RESUME_PREVIEW_COMPONENTS } from "@/components/resume-templates/preview";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { TagInput } from "@/components/ui/tag-input";
import { PeriodFields } from "./period-fields";
import { cn } from "@/lib/utils";

const initialExtractState: ExtractProfileState = { status: "idle" };
const PreviewComponent = RESUME_PREVIEW_COMPONENTS.basico;

interface BaseProfileFormProps {
  initialData: ResumeData | null;
  isPaid: boolean;
  /** Id do usuário autenticado quando a página carregou — ver comentário em profile-actions.ts. */
  expectedUserId: string;
  onSaved: (data: ResumeData, whatsappInviteJustSent: boolean) => void;
  onCancel: () => void;
}

export function BaseProfileForm({ initialData, isPaid, expectedUserId, onSaved, onCancel }: BaseProfileFormProps) {
  const [data, setData] = useState<ResumeData>(initialData ?? emptyResumeData);
  const [showImport, setShowImport] = useState(false);
  const [importMode, setImportMode] = useState<"texto" | "arquivo">("texto");
  const [importNotice, setImportNotice] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const [saveState, setSaveState] = useState<"idle" | "saved" | "error">("idle");
  const [isSaving, startSave] = useTransition();

  // Detecta sessão obsoleta: se, sem recarregar esta aba, outra conta for
  // acessada em outra aba do mesmo navegador (cookie é compartilhado entre
  // abas da mesma origem), `saveBaseProfile` passa a rejeitar qualquer
  // salvamento vindo daqui — inclusive o rascunho automático — em vez de
  // gravar silenciosamente os dados desta aba na conta agora ativa.
  // Corrige um vazamento real de dados entre contas, reproduzido e
  // confirmado em 2026-07-18 (ver HANDOFF.md).
  const [sessionMismatch, setSessionMismatch] = useState(false);

  // Rascunho automático: reaproveita o mesmo `saveBaseProfile` do botão
  // "Salvar perfil" (é um upsert, sempre seguro repetir) — não chama
  // `onSaved`, então não troca de tela nem interrompe quem está digitando,
  // só evita perder o que já foi preenchido se a aba fechar antes de um
  // salvamento manual.
  const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);
  const dataRef = useRef(data);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (sessionMismatch) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      setAutoSaveStatus("saving");
      saveBaseProfile(data, expectedUserId).then((result) => {
        if (result.status === "session_mismatch") {
          setSessionMismatch(true);
          setAutoSaveStatus("idle");
          return;
        }
        setAutoSaveStatus(result.status === "success" ? "saved" : "idle");
      });
    }, 2500);
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [data, expectedUserId, sessionMismatch]);

  // Segunda rede de segurança: se a pessoa trocar de aba ou fechar o
  // navegador antes do debounce acima disparar, salva na hora — a troca de
  // visibilidade é o sinal mais confiável disponível pra isso (diferente de
  // `beforeunload`, que não garante que uma chamada assíncrona termine).
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.hidden && !isFirstRender.current) {
        saveBaseProfile(dataRef.current, expectedUserId).then((result) => {
          if (result.status === "session_mismatch") setSessionMismatch(true);
        });
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [expectedUserId]);

  const progressItems = [
    {
      label: "Dados pessoais",
      done: !!(data.nome.trim() && (data.contato.email.trim() || data.contato.telefone.trim())),
    },
    { label: "Experiências", done: data.experiencias.length > 0 },
    { label: "Formação", done: data.formacao.length > 0 },
    { label: "Habilidades e idiomas", done: data.habilidades.length > 0 || data.idiomas.length > 0 },
  ];
  const completedCount = progressItems.filter((i) => i.done).length;
  const progressPct = Math.round((completedCount / progressItems.length) * 100);

  const [textState, textAction, textPending] = useActionState(extractProfileFromText, initialExtractState);
  const [fileState, fileAction, filePending] = useActionState(extractProfileFromFile, initialExtractState);

  const [improvingField, setImprovingField] = useState<string | null>(null);
  const [, startImprove] = useTransition();

  function applyExtracted(extracted: ResumeData) {
    setData(extracted);
    setShowImport(false);
    setImportNotice(true);
  }

  // `applyExtracted` fecha o painel de importação (`showImport → false`), que
  // também serve de guarda pra não disparar de novo no próximo render — mesmo
  // padrão de "consumir um resultado de useActionState uma vez" já usado em
  // resume-workspace.tsx (`lastHandledResumeId`).
  if (showImport && importMode === "texto" && textState.status === "success" && textState.data) {
    applyExtracted(textState.data);
  }
  if (showImport && importMode === "arquivo" && fileState.status === "success" && fileState.data) {
    applyExtracted(fileState.data);
  }

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

  function moveExperience(index: number, direction: -1 | 1) {
    setData((prev) => {
      const next = [...prev.experiencias];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return { ...prev, experiencias: next };
    });
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

  function handleImproveResumo() {
    setImprovingField("resumo");
    startImprove(async () => {
      const result = await improveResumeText("resumo", data.resumo, { titulo: data.titulo });
      if (result.status === "success") {
        updateField("resumo", result.text);
      }
      setImprovingField(null);
    });
  }

  function handleImproveExperience(index: number) {
    const fieldId = `exp-${index}`;
    setImprovingField(fieldId);
    startImprove(async () => {
      const exp = data.experiencias[index];
      const result = await improveResumeText("experiencia", exp.descricao, {
        cargo: exp.cargo,
        empresa: exp.empresa,
      });
      if (result.status === "success") {
        updateExperience(index, "descricao", result.text);
      }
      setImprovingField(null);
    });
  }

  function handleSave() {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    startSave(async () => {
      const result = await saveBaseProfile(data, expectedUserId, true);
      if (result.status === "success") {
        setSaveState("saved");
        setAutoSaveStatus("idle");
        onSaved(data, result.whatsappInviteJustSent ?? false);
      } else if (result.status === "session_mismatch") {
        setSessionMismatch(true);
      } else {
        setSaveState("error");
      }
    });
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFileName(e.target.files?.[0]?.name ?? null);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="flex flex-col gap-6">
        <div className="rounded-lg border border-border bg-bg-surface p-5">
          <button
            type="button"
            onClick={() => setShowImport((v) => !v)}
            className="text-body-sm font-medium text-accent-600 underline-offset-2 hover:underline dark:text-accent-400"
          >
            Já tem um currículo pronto? Preencha automaticamente
          </button>

          {showImport && (
            <div className="mt-4 flex flex-col gap-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setImportMode("texto")}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-caption font-medium transition-ryze",
                    importMode === "texto" ? "bg-accent-500/15 text-accent-600 dark:text-accent-400" : "text-fg-muted"
                  )}
                >
                  Colar texto
                </button>
                <button
                  type="button"
                  onClick={() => setImportMode("arquivo")}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-caption font-medium transition-ryze",
                    importMode === "arquivo" ? "bg-accent-500/15 text-accent-600 dark:text-accent-400" : "text-fg-muted"
                  )}
                >
                  Enviar arquivo
                </button>
              </div>

              {importMode === "texto" ? (
                <form action={textAction} className="flex flex-col gap-3">
                  <Textarea
                    name="pasted_text"
                    rows={6}
                    placeholder="Cole aqui o texto do seu currículo atual..."
                    required
                  />
                  {textState.status === "error" && (
                    <p className="flex items-center gap-2 text-body-sm text-error">
                      <AlertCircle className="h-4 w-4 shrink-0" /> {textState.message}
                    </p>
                  )}
                  <Button type="submit" size="sm" loading={textPending} className="self-start">
                    <Sparkles className="h-3.5 w-3.5" /> Preencher com IA
                  </Button>
                </form>
              ) : (
                <form action={fileAction} className="flex flex-col gap-3">
                  <label
                    htmlFor="resume_file"
                    className="flex cursor-pointer flex-col items-center gap-2 rounded-md border border-dashed border-border-strong bg-bg px-4 py-6 text-center transition-ryze hover:border-accent-500/50"
                  >
                    {fileName ? (
                      <>
                        <FileCheck2 className="h-5 w-5 text-accent-600 dark:text-accent-400" />
                        <span className="text-body-sm text-fg">{fileName}</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="h-5 w-5 text-fg-muted" />
                        <span className="text-body-sm text-fg-muted">PDF ou Word (.docx), até 6 MB</span>
                      </>
                    )}
                  </label>
                  <input
                    id="resume_file"
                    name="resume_file"
                    type="file"
                    accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    required
                    className="sr-only"
                    onChange={handleFileChange}
                  />
                  {fileState.status === "error" && (
                    <p className="flex items-center gap-2 text-body-sm text-error">
                      <AlertCircle className="h-4 w-4 shrink-0" /> {fileState.message}
                    </p>
                  )}
                  <Button type="submit" size="sm" loading={filePending} className="self-start">
                    <Sparkles className="h-3.5 w-3.5" /> Preencher com IA
                  </Button>
                </form>
              )}
            </div>
          )}
        </div>

        {importNotice && (
          <p className="flex items-center gap-2 rounded-md bg-accent-500/10 px-4 py-3 text-body-sm text-fg">
            <Check className="h-4 w-4 shrink-0 text-accent-600 dark:text-accent-400" />
            Dados preenchidos pela IA — revise cada seção antes de salvar.
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Nome" htmlFor="nome">
            <Input id="nome" value={data.nome} onChange={(e) => updateField("nome", e.target.value)} />
          </FormField>
          <FormField label="Título profissional" htmlFor="titulo">
            <Input
              id="titulo"
              placeholder="Ex: Analista de Recrutamento e Seleção"
              value={data.titulo}
              onChange={(e) => updateField("titulo", e.target.value)}
            />
          </FormField>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="resumo">Resumo profissional</Label>
            <ImproveButton
              isPaid={isPaid}
              loading={improvingField === "resumo"}
              disabled={!data.resumo.trim()}
              onClick={handleImproveResumo}
            />
          </div>
          <Textarea
            id="resumo"
            rows={4}
            value={data.resumo}
            onChange={(e) => updateField("resumo", e.target.value)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <FormField label="E-mail" htmlFor="contato-email">
            <Input
              id="contato-email"
              value={data.contato.email}
              onChange={(e) => updateContato("email", e.target.value)}
            />
          </FormField>
          <FormField label="Telefone" htmlFor="contato-telefone">
            <Input
              id="contato-telefone"
              value={data.contato.telefone}
              onChange={(e) => updateContato("telefone", e.target.value)}
            />
          </FormField>
          <FormField label="LinkedIn" htmlFor="contato-linkedin">
            <Input
              id="contato-linkedin"
              value={data.contato.linkedin}
              onChange={(e) => updateContato("linkedin", e.target.value)}
            />
          </FormField>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label>Experiências profissionais</Label>
            <Button type="button" variant="ghost" size="sm" onClick={addExperience}>
              <Plus className="h-3.5 w-3.5" /> Adicionar
            </Button>
          </div>
          <div className="mt-3 flex flex-col gap-4">
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
                  <div className="mt-1 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveExperience(i, -1)}
                      disabled={i === 0}
                      aria-label="Mover para cima"
                      className="text-fg-muted transition-ryze hover:text-fg disabled:opacity-30"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveExperience(i, 1)}
                      disabled={i === data.experiencias.length - 1}
                      aria-label="Mover para baixo"
                      className="text-fg-muted transition-ryze hover:text-fg disabled:opacity-30"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeExperience(i)}
                      aria-label="Remover experiência"
                      className="text-fg-muted transition-ryze hover:text-error"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-3">
                  <PeriodFields value={exp.periodo} onChange={(p) => updateExperience(i, "periodo", p)} />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-caption text-fg-muted">Descrição</span>
                  <ImproveButton
                    isPaid={isPaid}
                    loading={improvingField === `exp-${i}`}
                    disabled={!exp.descricao.trim()}
                    onClick={() => handleImproveExperience(i)}
                  />
                </div>
                <Textarea
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
            <Label>Formação acadêmica</Label>
            <Button type="button" variant="ghost" size="sm" onClick={addEducation}>
              <Plus className="h-3.5 w-3.5" /> Adicionar
            </Button>
          </div>
          <div className="mt-3 flex flex-col gap-3">
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
          <p className="mb-2 text-caption text-fg-muted">
            Pressione Enter ou vírgula para adicionar cada item (ex: &quot;Excel avançado&quot;).
          </p>
          <TagInput
            id="habilidades"
            value={data.habilidades}
            onChange={(tags) => updateField("habilidades", tags)}
            placeholder="Digite e pressione Enter..."
          />
        </div>

        <div>
          <Label htmlFor="idiomas">Idiomas</Label>
          <p className="mb-2 text-caption text-fg-muted">
            Pressione Enter ou vírgula para adicionar cada item (ex: &quot;Inglês fluente&quot;).
          </p>
          <TagInput
            id="idiomas"
            value={data.idiomas}
            onChange={(tags) => updateField("idiomas", tags)}
            placeholder="Digite e pressione Enter..."
          />
        </div>

        {sessionMismatch && (
          <div className="flex flex-col items-start gap-3 rounded-lg border border-error/40 bg-error/10 p-4">
            <p className="flex items-center gap-2 text-body-sm text-error">
              <AlertCircle className="h-4 w-4 shrink-0" />
              Outra conta foi acessada em outra aba deste navegador. Pra não salvar dados na conta errada, recarregue
              esta página antes de continuar — o que você digitou aqui não será perdido se você copiar antes de
              recarregar.
            </p>
            <Button type="button" size="sm" variant="secondary" onClick={() => window.location.reload()}>
              <RefreshCw className="h-3.5 w-3.5" />
              Recarregar página
            </Button>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
          <Button type="button" onClick={handleSave} loading={isSaving} disabled={sessionMismatch}>
            {saveState === "saved" && !isSaving ? <Check className="h-4 w-4" /> : null}
            Salvar perfil
          </Button>
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
          {saveState === "error" && (
            <span className="flex items-center gap-1.5 text-body-sm text-error">
              <AlertCircle className="h-4 w-4" /> Não foi possível salvar.
            </span>
          )}
          {saveState !== "error" && !sessionMismatch && autoSaveStatus !== "idle" && (
            <span className="flex items-center gap-1.5 text-caption text-fg-muted">
              <CloudUpload className="h-3.5 w-3.5" />
              {autoSaveStatus === "saving" ? "Salvando rascunho..." : "Rascunho salvo automaticamente"}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:sticky lg:top-8 lg:self-start">
        <div className="rounded-lg border border-border bg-bg-surface p-5">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-body-sm font-medium text-fg">Progresso do perfil</span>
            <span className="text-caption text-fg-muted">
              {completedCount}/{progressItems.length}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-bg-surface-2">
            <div
              className="h-full rounded-full bg-gradient-ryze transition-[width] duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <ul className="mt-3 flex flex-col gap-1.5">
            {progressItems.map((item) => (
              <li key={item.label} className="flex items-center gap-2 text-body-sm">
                {item.done ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-accent-600 dark:text-accent-400" />
                ) : (
                  <Circle className="h-4 w-4 shrink-0 text-fg-muted" />
                )}
                <span className={item.done ? "text-fg" : "text-fg-muted"}>{item.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-3 text-body-sm text-fg-muted">Pré-visualização</p>
          <div className="overflow-x-auto rounded-md bg-bg-surface-2 p-4">
            <PreviewComponent data={data} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ImproveButton({
  isPaid,
  loading,
  disabled,
  onClick,
}: {
  isPaid: boolean;
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  if (!isPaid) {
    return (
      <span
        className="flex items-center gap-1 text-caption text-fg-muted"
        title="Melhorar com IA é um recurso dos planos Impulso e Mentoria"
      >
        <Lock className="h-3.5 w-3.5" /> Melhorar com IA · Impulso+
      </span>
    );
  }

  return (
    <Button type="button" variant="ghost" size="sm" onClick={onClick} loading={loading} disabled={disabled}>
      <Sparkles className="h-3.5 w-3.5" /> Melhorar com IA
    </Button>
  );
}
