"use client";

import Link from "next/link";
import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Sparkles, AlertCircle, FileText, Briefcase, Check, Trash2 } from "lucide-react";
import { generateAdaptedResume, updateResumeVersion, deleteResumeVersion, type ResumeState } from "./actions";
import { saveBaseProfile } from "./profile-actions";
import { BaseProfileForm } from "./base-profile-form";
import { ResumeEditor } from "./resume-editor";
import { ResumeThumbnail } from "@/components/resume-templates/thumbnail";
import { WhatsappInviteBanner } from "@/components/painel/whatsapp-invite-banner";
import { getJobFlowSteps, getJobFlowNextHref } from "@/lib/guided-flow";
import { type ResumeData, type ResumeTemplateSlug } from "@/lib/resume-schema";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ResumeVersionRow {
  id: string;
  job_title: string | null;
  job_description: string;
  template_slug: ResumeTemplateSlug;
  resume_data: ResumeData;
  created_at: string;
}

/** O "envelope" do fluxo guiado pra uma vaga — ver 0010_job_applications.sql. */
export interface JobApplicationRow {
  id: string;
  resume_version_id: string | null;
  linkedin_analysis_id: string | null;
  interview_session_id: string | null;
}

interface CurriculoWorkspaceProps {
  isPaid: boolean;
  profileData: ResumeData | null;
  versions: ResumeVersionRow[];
  jobApplications: JobApplicationRow[];
  whatsappLink: string | null;
  /** Id do usuário autenticado no momento em que a página carregou — usado
   * pra detectar sessão obsoleta antes de gravar (ver comentário em
   * profile-actions.ts sobre o incidente que isso corrige). */
  userId: string;
}

type View = "hub" | "perfil" | "gratis" | "adaptar" | "editor";

interface EditorTarget {
  resumeId: string | null;
  data: ResumeData;
  templateSlug: ResumeTemplateSlug;
  /** Só setado logo depois de UMA geração nova (não ao reabrir do
   * histórico) — dispara o convite pro próximo passo do fluxo guiado. */
  freshJobApplicationId?: string;
}

const initialAdaptState: ResumeState = { status: "idle" };

export function CurriculoWorkspace({
  isPaid,
  profileData: initialProfileData,
  versions,
  jobApplications,
  whatsappLink,
  userId,
}: CurriculoWorkspaceProps) {
  const router = useRouter();
  // Este é o único formulário de entrada do candidato agora — quem chega
  // sem perfil nenhum já cai direto na aba de preenchimento, não no hub.
  const [view, setView] = useState<View>(initialProfileData ? "hub" : "perfil");
  const [profileData, setProfileData] = useState<ResumeData | null>(initialProfileData);
  const [editorTarget, setEditorTarget] = useState<EditorTarget | null>(null);
  // Capturado uma vez, no valor inicial da prop — controla se o PRIMEIRO
  // salvamento do perfil deve pular o hub e ir direto pro currículo
  // (equivalente ao que o antigo /para-candidatos/comecar fazia).
  const [cameInWithoutProfile] = useState(() => !initialProfileData);
  // true só na resposta que efetivamente disparou o convite pro WhatsApp
  // (perfil salvo pela primeira vez, plano Grátis) — controla o banner na
  // tela "gratis". Resetado sempre que essa tela é reaberta fora desse
  // fluxo, pra não reaparecer em visitas seguintes.
  const [whatsappInviteJustSent, setWhatsappInviteJustSent] = useState(false);

  const [adaptState, adaptAction, adaptPending] = useActionState(generateAdaptedResume, initialAdaptState);
  const [lastHandledResumeId, setLastHandledResumeId] = useState<string | null>(null);

  // Exclusão de versão adaptada: confirmação inline no próprio card (em vez
  // de modal — não há um componente de Dialog no design system ainda, e
  // isso evita criar um só pra este caso). `deletedIds` remove da lista na
  // hora (otimista); `router.refresh()` sincroniza com o servidor em
  // paralelo.
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, startDelete] = useTransition();

  function handleDeleteVersion(resumeId: string) {
    setDeleteError(null);
    startDelete(async () => {
      const result = await deleteResumeVersion(resumeId);
      if (result.status === "success") {
        setDeletedIds((prev) => new Set(prev).add(resumeId));
        setConfirmDeleteId(null);
        router.refresh();
      } else {
        setDeleteError(result.message ?? "Não foi possível excluir esta versão.");
      }
    });
  }

  // As telas trocadas aqui têm alturas bem diferentes (formulário longo vs.
  // resumo curto) — sem isso, o navegador simplesmente prende o `scrollY` no
  // novo máximo ao trocar pra uma tela mais curta, deixando o candidato no
  // meio/fim da página (perto do rodapé) em vez do topo da tela nova.
  function changeView(next: View) {
    setView(next);
    window.scrollTo(0, 0);
  }

  if (
    adaptState.status === "success" &&
    adaptState.resumeId &&
    adaptState.data &&
    adaptState.templateSlug &&
    adaptState.resumeId !== lastHandledResumeId
  ) {
    setLastHandledResumeId(adaptState.resumeId);
    setEditorTarget({
      resumeId: adaptState.resumeId,
      data: adaptState.data,
      templateSlug: adaptState.templateSlug,
      freshJobApplicationId: adaptState.jobApplicationId,
    });
    changeView("editor");
  }

  function backToHub() {
    setWhatsappInviteJustSent(false);
    changeView("hub");
    router.refresh();
  }

  if (view === "perfil") {
    return (
      <div className="flex flex-col gap-6">
        {!cameInWithoutProfile && <BackButton onClick={backToHub} label="Voltar" />}
        <BaseProfileForm
          initialData={profileData}
          isPaid={isPaid}
          expectedUserId={userId}
          onCancel={backToHub}
          onSaved={(data, whatsappInviteJustSent) => {
            setProfileData(data);
            if (cameInWithoutProfile && !isPaid) {
              // Salvar o perfil JÁ é ter um currículo pronto pra ver no
              // Grátis (tela "gratis" renderiza direto de `profileData`) —
              // pula o hub e vai direto pra lá.
              setWhatsappInviteJustSent(whatsappInviteJustSent);
              changeView("gratis");
            } else {
              changeView("hub");
              router.refresh();
            }
          }}
        />
      </div>
    );
  }

  if (view === "gratis" && profileData) {
    return (
      <div className="flex flex-col gap-6">
        <BackButton onClick={backToHub} label="Voltar" />
        {whatsappInviteJustSent && (
          <WhatsappInviteBanner whatsappLink={whatsappLink} resumeData={profileData} resumeTemplateSlug="basico" />
        )}
        <ResumeEditor
          initialData={profileData}
          initialTemplate="basico"
          isPaid={false}
          onSave={async (data) => {
            const result = await saveBaseProfile(data, userId, true);
            if (result.status === "success") {
              setProfileData(data);
              if (result.whatsappInviteJustSent) setWhatsappInviteJustSent(true);
            }
            return result;
          }}
        />
      </div>
    );
  }

  if (view === "adaptar") {
    return (
      <div className="flex flex-col gap-6">
        <BackButton onClick={backToHub} label="Voltar" />
        <div>
          <h2 className="font-display text-heading-md font-semibold text-fg">Adaptar para uma vaga</h2>
          <p className="mt-1 text-body-sm text-fg-muted">
            A IA usa seu perfil base e a vaga informada para montar uma versão adaptada. Depois de gerado, você
            escolhe o modelo visual já vendo o resultado.
          </p>
        </div>

        <form action={adaptAction} className="flex flex-col gap-5">
          {/* O modelo visual só é escolhido DEPOIS de gerar, na tela do editor — nesse
              momento ainda não existe preview pra mostrar, então a escolha seria às
              cegas. Um modelo pago razoável é usado como ponto de partida. */}
          <input type="hidden" name="template_slug" value="moderno" />
          <input type="hidden" name="expected_user_id" value={userId} />

          <FormField label="Título da vaga" htmlFor="job_title" required>
            <Input id="job_title" name="job_title" placeholder="Ex: Analista de Recrutamento Sênior" required />
          </FormField>

          <FormField
            label="Descrição da vaga"
            htmlFor="job_description"
            helperText="Cole o texto completo do anúncio da vaga."
            required
          >
            <Textarea
              id="job_description"
              name="job_description"
              rows={8}
              placeholder="Cole aqui a descrição da vaga..."
              required
            />
          </FormField>

          {adaptState.status === "error" && (
            <p className="flex items-center gap-2 rounded-md bg-error/10 px-4 py-3 text-body-sm text-error">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {adaptState.message}
            </p>
          )}

          <Button type="submit" size="lg" loading={adaptPending} className="w-full sm:w-auto">
            <Sparkles className="h-4 w-4" />
            Gerar currículo adaptado
          </Button>
        </form>
      </div>
    );
  }

  if (view === "editor" && editorTarget) {
    return (
      <div className="flex flex-col gap-6">
        <BackButton onClick={backToHub} label="Voltar" />
        {editorTarget.freshJobApplicationId && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-accent-500/40 bg-accent-500/5 p-4">
            <p className="text-body-sm text-fg">
              Currículo pronto! Continue o fluxo guiado pra esta vaga com a Análise de LinkedIn.
            </p>
            <Button asChild size="sm">
              <Link href={`/para-candidatos/painel/linkedin?vaga=${editorTarget.freshJobApplicationId}`}>
                Continuar
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        )}
        {editorTarget.freshJobApplicationId && adaptState.whatsappInviteJustSent && (
          <WhatsappInviteBanner whatsappLink={whatsappLink} />
        )}
        <ResumeEditor
          key={editorTarget.resumeId ?? "new"}
          initialData={editorTarget.data}
          initialTemplate={editorTarget.templateSlug}
          isPaid={isPaid}
          onSave={async (data, templateSlug) => {
            if (!editorTarget.resumeId) return { status: "error" };
            return updateResumeVersion(editorTarget.resumeId, data, templateSlug);
          }}
        />
      </div>
    );
  }

  // Hub
  const hasProfile = !!profileData;

  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-lg border border-border bg-bg-surface p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-heading-sm font-semibold text-fg">Seu perfil base</h2>
            <p className="mt-1 text-body-sm text-fg-muted">
              {hasProfile
                ? "Dados pessoais, experiências, formação e habilidades — a fonte de verdade para qualquer currículo gerado."
                : "Preencha seus dados uma vez e reaproveite em qualquer currículo."}
            </p>
          </div>
          <Button type="button" variant={hasProfile ? "secondary" : "primary"} onClick={() => changeView("perfil")}>
            {hasProfile ? "Editar perfil" : "Preencher perfil"}
          </Button>
        </div>
        {hasProfile && (
          <p className="mt-3 flex items-center gap-1.5 text-caption text-fg-muted">
            <Check className="h-3.5 w-3.5 text-accent-600 dark:text-accent-400" /> Perfil preenchido
          </p>
        )}
      </div>

      {!isPaid ? (
        <ActionCard
          icon={FileText}
          title="Baixar meu currículo"
          description="Preview no modelo Básico, edição e exportação em PDF."
          buttonLabel="Ver e baixar"
          disabled={!hasProfile}
          disabledHint="Preencha seu perfil base primeiro."
          onClick={() => {
            setWhatsappInviteJustSent(false);
            changeView("gratis");
          }}
        />
      ) : (
        <ActionCard
          icon={Briefcase}
          title="Adaptar para uma vaga"
          description="Cole o título e a descrição da vaga — a IA monta uma versão adaptada do seu currículo, com os 5 modelos visuais disponíveis."
          buttonLabel="Adaptar para vaga"
          disabled={!hasProfile}
          disabledHint="Preencha seu perfil base primeiro."
          onClick={() => changeView("adaptar")}
        />
      )}

      {isPaid && versions.filter((v) => !deletedIds.has(v.id)).length > 0 && (
        <div>
          <h2 className="mb-4 font-display text-heading-sm font-semibold text-fg">Histórico por vaga</h2>
          {deleteError && (
            <p className="mb-3 flex items-center gap-2 rounded-md bg-error/10 px-4 py-3 text-body-sm text-error">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {deleteError}
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {versions
              .filter((v) => !deletedIds.has(v.id))
              .map((v) =>
                confirmDeleteId === v.id ? (
                  <div
                    key={v.id}
                    className="flex flex-col items-center justify-center gap-3 rounded-lg border border-error/40 bg-error/5 p-4 text-center"
                  >
                    <AlertCircle className="h-5 w-5 shrink-0 text-error" />
                    <p className="text-body-sm text-fg">
                      Excluir a versão <span className="font-medium">{v.job_title || "sem título"}</span>? Essa ação
                      não pode ser desfeita.
                    </p>
                    <div className="flex gap-2">
                      <Button type="button" variant="ghost" size="sm" onClick={() => setConfirmDeleteId(null)}>
                        Cancelar
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        loading={isDeleting}
                        onClick={() => handleDeleteVersion(v.id)}
                        className="bg-error text-white hover:bg-error/90 hover:brightness-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    key={v.id}
                    className="group relative flex flex-col items-center gap-3 rounded-lg border border-border bg-bg-surface p-4 transition-ryze hover:border-accent-500/40"
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteError(null);
                        setConfirmDeleteId(v.id);
                      }}
                      aria-label="Excluir versão"
                      // 44px de área de toque (achado P1 da auditoria de
                      // responsividade mobile, 2026-07-23) — antes eram
                      // 26x26px. `group-hover` nunca dispara em touch, então
                      // fica sempre visível abaixo de `sm`; acima disso
                      // volta a só aparecer no hover, como era.
                      className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-md text-fg-muted opacity-100 transition-ryze hover:bg-error/10 hover:text-error focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditorTarget({ resumeId: v.id, data: v.resume_data, templateSlug: v.template_slug });
                        changeView("editor");
                      }}
                      className="flex w-full flex-col items-center gap-3 text-left"
                    >
                      <ResumeThumbnail data={v.resume_data} templateSlug={v.template_slug} />
                      <div className="w-full">
                        <p className="text-body-sm font-medium text-fg">{v.job_title || "Vaga sem título"}</p>
                        <p className="mt-0.5 text-caption text-fg-muted">
                          {new Date(v.created_at).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </button>
                    <JobFlowDots
                      jobApplication={jobApplications.find((j) => j.resume_version_id === v.id) ?? null}
                    />
                  </div>
                )
              )}
          </div>
        </div>
      )}
    </div>
  );
}

/** Progresso compacto (3 pontinhos) do fluxo guiado num card do histórico —
 * `null` quando a versão foi gerada antes da migration do fluxo guiado
 * (sem job_application vinculado), aí não mostra nada em vez de um estado
 * enganoso. */
function JobFlowDots({ jobApplication }: { jobApplication: JobApplicationRow | null }) {
  if (!jobApplication) return null;

  const steps = getJobFlowSteps(jobApplication);
  const allDone = steps.every((s) => s.done);
  const nextHref = getJobFlowNextHref(jobApplication);

  return (
    <div className="flex w-full flex-col items-center gap-1.5 border-t border-border pt-3">
      <div className="flex items-center gap-1.5">
        {steps.map((s) => (
          <span
            key={s.label}
            title={s.label}
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              s.done ? "bg-accent-500" : "bg-border-strong"
            )}
          />
        ))}
      </div>
      {!allDone && nextHref && (
        <Link
          href={nextHref}
          onClick={(e) => e.stopPropagation()}
          className="text-caption font-medium text-accent-600 transition-ryze hover:underline dark:text-accent-400"
        >
          Continuar fluxo guiado
        </Link>
      )}
    </div>
  );
}

function BackButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <Button type="button" variant="ghost" size="sm" className="self-start" onClick={onClick}>
      <ArrowLeft className="h-3.5 w-3.5" /> {label}
    </Button>
  );
}

function ActionCard({
  icon: Icon,
  title,
  description,
  buttonLabel,
  disabled,
  disabledHint,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  buttonLabel: string;
  disabled: boolean;
  disabledHint: string;
  onClick: () => void;
}) {
  return (
    <div className="rounded-lg border border-accent-500/40 bg-bg-surface p-6 shadow-glow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-bg-surface-2 text-accent-600 dark:text-accent-400">
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-display text-heading-sm font-semibold text-fg">{title}</h2>
            <p className="mt-1 text-body-sm text-fg-muted">{description}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <Button type="button" onClick={onClick} disabled={disabled}>
            {buttonLabel}
          </Button>
          {disabled && <span className="text-caption text-fg-muted">{disabledHint}</span>}
        </div>
      </div>
    </div>
  );
}
