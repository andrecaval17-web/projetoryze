"use client";

import { useState, useRef, useEffect, useCallback, useTransition, useSyncExternalStore } from "react";
import {
  Mic,
  Square,
  AlertCircle,
  Loader2,
  Play,
  FlagTriangleRight,
  ClipboardCheck,
  RotateCcw,
  CheckSquare,
  Square as SquareIcon,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { AiMarkdown } from "@/components/ui/ai-markdown";
import { toggleInterviewNextStep, type NextStep } from "./actions";
import { cn } from "@/lib/utils";

interface ChatMessage {
  role: "assistant" | "user";
  content: string;
  /** Só nas perguntas da IA (não no parecer final) — base64 do áudio TTS
   * gerado pelo servidor pra esta mensagem, ver /api/ai/interview. */
  audioBase64?: string;
}

// Base64 de um WAV silencioso mínimo (1 amostra) — usado só pra "destravar"
// o áudio dentro de um clique de verdade.
const SILENT_WAV_BASE64 = "UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";

// `data:` URI NUNCA — a CSP do site só libera `media-src 'self' blob:`
// (ver proxy.ts), sem `data:`, de propósito (mesmo raciocínio de manter a
// CSP o mais estreita possível de outros ajustes já feitos nela). Um
// `<audio src="data:...">` é bloqueado silenciosamente por isso: o elemento
// nunca carrega, `.play()` rejeita com "no supported source was found" —
// exatamente o sintoma reportado em produção (Edge). Convertendo pra
// `blob:` local em vez de alargar a CSP.
function base64ToBlobUrl(base64: string, mimeType: string): string {
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  return URL.createObjectURL(new Blob([bytes], { type: mimeType }));
}

// Elemento único fora da árvore do React, de propósito: se fosse um
// `useRef` renderizado dentro do componente, ele seria desmontado e um novo
// seria criado ao trocar de `!started` pra `started` (são dois `return`
// diferentes) — e alguns navegadores (Safari principalmente) só permitem
// autoplay depois de um `fetch` assíncrono se for exatamente o MESMO
// elemento que já tocou algo dentro de um clique de verdade antes. Guardando
// fora do React, o elemento sobrevive a qualquer re-render/remount do
// componente pelo resto da sessão.
let sharedInterviewAudio: HTMLAudioElement | null = null;
// Cada `.play()` gera uma blob URL nova — precisa revogar a anterior, senão
// vaza memória ao longo de uma entrevista com várias perguntas.
let lastInterviewBlobUrl: string | null = null;

function getSharedInterviewAudio(): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  if (!sharedInterviewAudio) sharedInterviewAudio = new Audio();
  return sharedInterviewAudio;
}

function setInterviewAudioSrc(audio: HTMLAudioElement, base64: string, mimeType: string) {
  if (lastInterviewBlobUrl) URL.revokeObjectURL(lastInterviewBlobUrl);
  lastInterviewBlobUrl = base64ToBlobUrl(base64, mimeType);
  audio.src = lastInterviewBlobUrl;
}

function unlockInterviewAudio() {
  const audio = getSharedInterviewAudio();
  if (!audio) return;
  setInterviewAudioSrc(audio, SILENT_WAV_BASE64, "audio/wav");
  audio.play().catch(() => {});
}

function playInterviewAudio(base64: string) {
  const audio = getSharedInterviewAudio();
  if (!audio) return;
  setInterviewAudioSrc(audio, base64, "audio/mpeg");
  audio.play().catch((err) => console.error("Interview TTS playback failed", err));
}

// A Web Speech API não tem tipos no lib.dom do TypeScript — declaramos só
// o mínimo que este componente usa.
// Valores possíveis de `error`: "no-speech" | "aborted" | "audio-capture" |
// "network" | "not-allowed" | "service-not-allowed" | "bad-grammar" |
// "language-not-supported".
interface SpeechRecognitionResultLike {
  isFinal: boolean;
  length: number;
  [index: number]: { transcript: string };
}
interface MinimalSpeechRecognitionEvent {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
}
interface MinimalSpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: MinimalSpeechRecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
}
type SpeechRecognitionCtor = new () => MinimalSpeechRecognition;

function getSpeechCtor() {
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition;
}

// Suporte a voz não muda em runtime, então não há evento real para assinar
// — só existe para satisfazer a assinatura do hook.
function subscribeToSpeechSupport() {
  return () => {};
}
function getSpeechSupportSnapshot() {
  return !!getSpeechCtor();
}
// No servidor não há `window`; assumir "sem suporte" aqui é o valor seguro
// — o hook corrige para o valor real assim que hidrata no navegador, sem
// gerar aviso de mismatch (é para isso que `getServerSnapshot` existe).
function getSpeechSupportServerSnapshot() {
  return false;
}

// Erros que realmente impedem gravar (permissão/hardware) — qualquer outro
// erro em modo contínuo é tratado como transitório e a gravação tenta
// retomar sozinha (ver `onend`), pra não perder o resto da resposta.
const FATAL_SPEECH_ERRORS = new Set(["not-allowed", "service-not-allowed", "audio-capture"]);

interface InterviewChatProps {
  /** Pré-preenche "pra qual vaga treinar" quando aberto pelo fluxo guiado
   * (?vaga=) — ainda editável, o candidato pode ajustar antes de começar. */
  initialJobContext?: string;
  /** Presente só no fluxo guiado — liga esta sessão à vaga no servidor. */
  jobApplicationId?: string;
}

export function InterviewChat({ initialJobContext, jobApplicationId }: InterviewChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const [jobContext, setJobContext] = useState(initialJobContext ?? "");
  const [isRecording, setIsRecording] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Preenchido só quando o servidor sinaliza `finished: true` (botão de
  // encerrar ou limite automático de perguntas) — mantido fora de
  // `messages` de propósito, pra virar um painel visualmente separado em
  // vez de mais uma bolha no meio da conversa.
  const [finalAssessment, setFinalAssessment] = useState<string | null>(null);
  const [nextSteps, setNextSteps] = useState<NextStep[]>([]);
  const [isToggling, startToggle] = useTransition();
  const speechSupported = useSyncExternalStore(
    subscribeToSpeechSupport,
    getSpeechSupportSnapshot,
    getSpeechSupportServerSnapshot
  );

  const recognitionRef = useRef<MinimalSpeechRecognition | null>(null);
  // Acumula os trechos finais reconhecidos ao longo de possíveis reinícios
  // automáticos — só é lido/enviado quando o candidato clica em "Parar".
  const transcriptRef = useRef("");
  const stoppedByUserRef = useRef(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // `scrollTo` no próprio container (em vez de `scrollIntoView` num filho)
    // rola só essa caixa — `scrollIntoView` sobe por todos os ancestrais
    // roláveis, incluindo a página inteira, pra tentar alinhar o alvo,
    // que era a causa da página inteira pulando pro final a cada mensagem.
    chatContainerRef.current?.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendTurn = useCallback(
    async (message?: string, options?: { endRequested?: boolean }) => {
      setIsPending(true);
      setError(null);
      try {
        const res = await fetch("/api/ai/interview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            message,
            jobContext,
            jobApplicationId,
            endRequested: options?.endRequested === true,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Falha ao continuar a entrevista.");

        setSessionId(data.sessionId);
        if (data.finished) {
          if (message) {
            setMessages((prev) => [...prev, { role: "user" as const, content: message }]);
          }
          setFinalAssessment(data.message);
          setNextSteps(data.nextSteps ?? []);
        } else {
          setMessages((prev) => [
            ...prev,
            ...(message ? [{ role: "user" as const, content: message }] : []),
            { role: "assistant" as const, content: data.message, audioBase64: data.audio },
          ]);
          if (data.audio) playInterviewAudio(data.audio);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro inesperado.");
      } finally {
        setIsPending(false);
      }
    },
    [sessionId, jobContext, jobApplicationId]
  );

  function handleStart() {
    unlockInterviewAudio();
    setStarted(true);
    sendTurn();
  }

  function handleEndInterview() {
    if (isRecording) {
      // Descarta o que já foi transcrito nesta gravação — encerrar é uma
      // ação explícita e imediata, não faz sentido enviar uma resposta
      // parcial junto.
      stoppedByUserRef.current = true;
      transcriptRef.current = "";
      recognitionRef.current?.stop();
      setIsRecording(false);
    }
    sendTurn(undefined, { endRequested: true });
  }

  function handleRestart() {
    setMessages([]);
    setSessionId(null);
    setStarted(false);
    setFinalAssessment(null);
    setNextSteps([]);
    setError(null);
  }

  function handleToggleStep(index: number) {
    if (!sessionId) return;
    setNextSteps((prev) => prev.map((s, i) => (i === index ? { ...s, done: !s.done } : s)));
    startToggle(async () => {
      const result = await toggleInterviewNextStep(sessionId, index);
      if (result.status === "error") {
        // Reverte o otimismo se o servidor recusou.
        setNextSteps((prev) => prev.map((s, i) => (i === index ? { ...s, done: !s.done } : s)));
      }
    });
  }

  function handleRecord() {
    const Ctor = getSpeechCtor();
    if (!Ctor) return;

    transcriptRef.current = "";
    stoppedByUserRef.current = false;

    const recognition = new Ctor();
    recognition.lang = "pt-BR";
    // `continuous: true` é o que evita o corte prematuro por uma pausa curta
    // de silêncio — sem isso, o reconhecimento nativo do navegador encerra
    // sozinho na primeira pausa natural da fala do candidato.
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          const piece = result[0]?.transcript?.trim();
          if (piece) {
            transcriptRef.current = transcriptRef.current ? `${transcriptRef.current} ${piece}` : piece;
          }
        }
      }
    };

    recognition.onerror = (event) => {
      if (FATAL_SPEECH_ERRORS.has(event.error)) {
        stoppedByUserRef.current = true; // impede o onend de tentar reiniciar
        switch (event.error) {
          case "not-allowed":
          case "service-not-allowed":
            setError("Permita o acesso ao microfone nas configurações do navegador para gravar sua resposta.");
            break;
          case "audio-capture":
            setError("Não encontramos um microfone. Verifique se há um conectado e habilitado.");
            break;
        }
        transcriptRef.current = "";
      }
      // Outros erros ("no-speech", "network", "aborted"...) são tratados
      // como transitórios — o `onend` decide se reinicia sozinho.
    };

    // Dispara sempre que o reconhecimento para, seja porque o navegador
    // encerrou sozinho (silêncio, timeout interno) ou porque o candidato
    // clicou em "Parar". Só finaliza/envia no segundo caso — no primeiro,
    // reinicia automaticamente pra não perder o resto da resposta.
    recognition.onend = () => {
      if (!stoppedByUserRef.current) {
        try {
          recognition.start();
          return;
        } catch (err) {
          console.error("Failed to auto-restart speech recognition", err);
        }
      }
      setIsRecording(false);
      const finalText = transcriptRef.current.trim();
      transcriptRef.current = "";
      if (finalText) sendTurn(finalText);
    };

    recognitionRef.current = recognition;
    setIsRecording(true);
    recognition.start();
  }

  function handleStopRecording() {
    stoppedByUserRef.current = true;
    recognitionRef.current?.stop();
  }

  if (!speechSupported) {
    return (
      <p className="flex items-center gap-2 rounded-md bg-error/10 px-4 py-3 text-body-sm text-error">
        <AlertCircle className="h-4 w-4 shrink-0" />
        Seu navegador não suporta entrada por voz. Tente Chrome ou Edge.
      </p>
    );
  }

  if (!started) {
    return (
      <div className="flex flex-col items-center gap-5 rounded-lg border border-border bg-bg-surface p-10 text-center">
        <p className="text-body-md text-fg-muted">
          A IA faz as perguntas em voz e por texto — você responde falando. Prepare-se e comece quando quiser.
        </p>
        <div className="w-full max-w-sm text-left">
          <FormField
            label="Para qual vaga você quer treinar?"
            htmlFor="job_context"
            helperText="Opcional — ajuda a IA a fazer perguntas mais direcionadas."
          >
            <Input
              id="job_context"
              value={jobContext}
              onChange={(e) => setJobContext(e.target.value)}
              placeholder="Ex: Analista de Recrutamento e Seleção Sênior"
            />
          </FormField>
        </div>
        <Button size="lg" onClick={handleStart} loading={isPending}>
          <Play className="h-4 w-4" />
          Começar entrevista
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {finalAssessment && (
        <div className="rounded-lg border-2 border-accent-500 bg-accent-500/5 p-6">
          <div className="mb-3 flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 shrink-0 text-accent-600" />
            <h2 className="font-display text-heading-sm font-semibold text-fg">Parecer final</h2>
          </div>
          <AiMarkdown content={finalAssessment} />

          {nextSteps.length > 0 && (
            <div className="mt-4 rounded-lg border border-border bg-bg-surface-2 p-4">
              <h3 className="mb-1 text-body-sm font-semibold text-fg">Próximos passos</h3>
              <p className="mb-3 text-caption text-fg-muted">Marque conforme for aplicando cada dica.</p>
              <ul className="flex flex-col gap-2">
                {nextSteps.map((step, i) => (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() => handleToggleStep(i)}
                      disabled={isToggling}
                      className="flex w-full items-start gap-2.5 rounded-md p-1.5 text-left transition-ryze hover:bg-bg-surface disabled:cursor-not-allowed"
                    >
                      {step.done ? (
                        <CheckSquare className="mt-0.5 h-4 w-4 shrink-0 text-accent-600 dark:text-accent-400" />
                      ) : (
                        <SquareIcon className="mt-0.5 h-4 w-4 shrink-0 text-fg-muted" />
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

          <Button className="mt-4" variant="secondary" onClick={handleRestart}>
            <RotateCcw className="h-4 w-4" />
            Começar nova entrevista
          </Button>
        </div>
      )}

      <div
        ref={chatContainerRef}
        className="flex max-h-[28rem] flex-col gap-3 overflow-y-auto rounded-lg border border-border bg-bg-surface p-5"
      >
        {messages.map((m, i) => (
          <div
            key={i}
            className={
              m.role === "assistant"
                ? "max-w-[85%] self-start rounded-lg rounded-bl-none bg-bg-surface-2 px-4 py-2.5 text-body-sm text-fg"
                : "max-w-[85%] self-end rounded-lg rounded-br-none bg-gradient-ryze px-4 py-2.5 text-body-sm text-white"
            }
          >
            {m.role === "assistant" ? (
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <AiMarkdown content={m.content} />
                </div>
                {m.audioBase64 && (
                  <button
                    type="button"
                    onClick={() => playInterviewAudio(m.audioBase64!)}
                    aria-label="Ouvir pergunta de novo"
                    title="Ouvir de novo"
                    className="mt-0.5 shrink-0 text-fg-muted transition-ryze hover:text-accent-600 dark:hover:text-accent-400"
                  >
                    <Volume2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ) : (
              m.content
            )}
          </div>
        ))}
        {isPending && (
          <div className="flex items-center gap-2 self-start text-body-sm text-fg-muted">
            <Loader2 className="h-4 w-4 animate-spin" /> A entrevistadora está digitando...
          </div>
        )}
      </div>

      {error && (
        <p className="flex items-center gap-2 rounded-md bg-error/10 px-4 py-3 text-body-sm text-error">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </p>
      )}

      {!finalAssessment && (
        // Empilhado em telas estreitas — achado P0 da auditoria de
        // responsividade mobile (2026-07-23): os dois botões lado a lado
        // não cabiam em 375-390px de largura e ficavam cortados nas duas
        // bordas.
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          {isRecording ? (
            <Button size="lg" variant="secondary" onClick={handleStopRecording} className="w-full sm:w-auto">
              <Square className="h-4 w-4" />
              Parar gravação
            </Button>
          ) : (
            <Button size="lg" onClick={handleRecord} disabled={isPending} className="w-full sm:w-auto">
              <Mic className="h-4 w-4" />
              Gravar resposta
            </Button>
          )}
          <Button
            size="lg"
            variant="ghost"
            onClick={handleEndInterview}
            disabled={isPending}
            className="w-full sm:w-auto"
          >
            <FlagTriangleRight className="h-4 w-4" />
            Encerrar entrevista
          </Button>
        </div>
      )}
    </div>
  );
}
