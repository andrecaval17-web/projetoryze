import { NextResponse } from "next/server";
import { getSupabaseServerClient, getCurrentUserPlan } from "@/lib/supabase/server";
import { getAiClient, AI_MODELS } from "@/lib/ai/client";
import { logAiUsage } from "@/lib/ai/usage";

// O SDK da OpenAI precisa do runtime Node.
export const runtime = "nodejs";

interface TranscriptMessage {
  role: "assistant" | "user";
  content: string;
}

interface NextStep {
  text: string;
  done: boolean;
}

interface ParsedFinalTurn {
  assessment: string;
  next_steps: string[];
}

function parseFinalTurnJson(content: string): ParsedFinalTurn {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    const cleaned = content.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
    parsed = JSON.parse(cleaned);
  }
  const obj = parsed as Partial<ParsedFinalTurn>;
  return {
    assessment: typeof obj.assessment === "string" ? obj.assessment : "",
    next_steps: Array.isArray(obj.next_steps) ? obj.next_steps.filter((s): s is string => typeof s === "string") : [],
  };
}

/**
 * Um turno da simulação de entrevista. Sem `sessionId` + sem `message`,
 * gera a pergunta de abertura (usado para iniciar a entrevista). Com os
 * dois, acrescenta a resposta do candidato ao histórico e devolve a
 * próxima pergunta/feedback da IA. A cada turno o transcript inteiro é
 * salvo em `interview_sessions` — nunca reescrito do zero.
 */
export async function POST(req: Request) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const plan = await getCurrentUserPlan();
  if (plan !== "impulso" && plan !== "mentoria") {
    return NextResponse.json(
      { error: "Recurso exclusivo dos planos Impulso e Mentoria." },
      { status: 403 }
    );
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }

  const sessionId = typeof body.sessionId === "string" ? body.sessionId : undefined;
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const jobContext = typeof body.jobContext === "string" ? body.jobContext.trim() : "";
  // Presente só quando a entrevista foi aberta pelo fluxo guiado
  // (?vaga=<job_application_id>) — liga esta sessão à vaga, pra "Sua área"
  // saber que a Etapa 3 foi iniciada pra ela.
  const jobApplicationId = typeof body.jobApplicationId === "string" ? body.jobApplicationId : undefined;
  // Candidato clicou em "Encerrar entrevista" — pede o parecer final agora,
  // independente de quantas perguntas já foram feitas.
  const endRequested = body.endRequested === true;

  const { data: profile } = await supabase
    .from("candidate_profiles")
    .select("target_role, experience_summary")
    .eq("user_id", user.id)
    .maybeSingle();

  let transcript: TranscriptMessage[] = [];
  let currentSessionId = sessionId;

  if (currentSessionId) {
    const { data: session, error } = await supabase
      .from("interview_sessions")
      .select("transcript")
      .eq("id", currentSessionId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (error || !session) {
      return NextResponse.json({ error: "Sessão de entrevista não encontrada." }, { status: 404 });
    }
    transcript = (session.transcript as TranscriptMessage[]) ?? [];
  }

  // Quantas perguntas a IA já fez antes deste turno — decide o encerramento
  // automático de forma determinística no servidor, em vez de confiar que o
  // modelo vai seguir a instrução de parar sozinho no prompt.
  const questionsAskedSoFar = transcript.filter((m) => m.role === "assistant").length;
  const QUESTION_LIMIT = 6;
  const shouldFinish = endRequested || questionsAskedSoFar >= QUESTION_LIMIT;

  if (message) {
    transcript.push({ role: "user", content: message });
  } else if (transcript.length === 0) {
    // A Gemini rejeita uma chamada com só mensagem "system" e nenhum
    // "user" (erro "contents is not specified") — diferente da OpenAI, que
    // aceita isso normalmente. No primeiro turno (começar a entrevista,
    // sem resposta do candidato ainda) precisamos de uma mensagem "user"
    // mínima para a IA ter o que responder.
    transcript.push({ role: "user", content: "Pode começar a entrevista." });
  }

  // O candidato pode informar a vaga/área específica que quer treinar nesta
  // sessão (campo antes de começar) — prioriza isso sobre o cargo-alvo
  // salvo no perfil base, que é mais genérico e pode estar desatualizado.
  const roleContext = jobContext || profile?.target_role || "não informado";

  let reply: string;
  let nextStepsList: string[] = [];

  try {
    const openai = getAiClient();

    if (shouldFinish) {
      // Turno de encerramento: pede JSON estruturado (parecer + checklist
      // separado) em vez de markdown solto — o checklist precisa de campo
      // próprio pra virar itens marcáveis (ver 0011_evolution_panel.sql),
      // não dá pra extrair de forma confiável de dentro de um bloco de
      // markdown livre.
      const systemPrompt = `Você é um entrevistador de RH encerrando, em português do Brasil, uma simulação de entrevista de emprego para a vaga/área "${roleContext}". Contexto do candidato (fornecido por ele mesmo): ${profile?.experience_summary ?? "não informado"}.

A entrevista está terminando agora. NÃO faça mais nenhuma pergunta.

Responda SOMENTE com um objeto JSON válido (sem markdown, sem \`\`\`, sem texto antes ou depois), seguindo EXATAMENTE este formato:
{
  "assessment": string (markdown com: um título curto "## Parecer da entrevista", uma avaliação geral breve do desempenho do candidato ao longo da conversa, pontos fortes observados (lista) e pontos de melhoria (lista). Tom profissional e encorajador. Se o candidato encerrou muito cedo, reconheça isso brevemente em vez de inventar avaliação sobre o que não houve.),
  "next_steps": [string] (2 a 3 dicas práticas e acionáveis para a próxima entrevista real, cada uma uma frase curta e direta)
}`;

      const completion = await openai.chat.completions.create({
        model: AI_MODELS.interview,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          ...transcript.map((m) => ({ role: m.role, content: m.content })),
        ],
      });

      const content = completion.choices[0]?.message?.content ?? "";
      if (!content) throw new Error("OpenAI returned an empty completion");
      const parsed = parseFinalTurnJson(content);
      reply = parsed.assessment;
      nextStepsList = parsed.next_steps;

      await logAiUsage(user.id, "interview", AI_MODELS.interview, completion.usage);
    } else {
      const systemPrompt = `Você é um entrevistador de RH conduzindo, em português do Brasil, uma simulação de entrevista de emprego para a vaga/área "${roleContext}". Contexto do candidato (fornecido por ele mesmo): ${profile?.experience_summary ?? "não informado"}.

Regras:
- Faça sempre UMA pergunta por vez, nunca várias juntas.
- Antes da próxima pergunta, dê um retorno breve (1-2 frases) sobre a resposta anterior, se houver uma.
- Tom profissional e encorajador, como uma entrevista real, sem ser repetitivo.
- Depois de aproximadamente 5 a 6 perguntas, encerre a simulação com um feedback final resumido em vez de fazer mais uma pergunta.`;

      const completion = await openai.chat.completions.create({
        model: AI_MODELS.interview,
        messages: [
          { role: "system", content: systemPrompt },
          ...transcript.map((m) => ({ role: m.role, content: m.content })),
        ],
      });

      reply = completion.choices[0]?.message?.content ?? "";
      if (!reply) throw new Error("OpenAI returned an empty completion");

      await logAiUsage(user.id, "interview", AI_MODELS.interview, completion.usage);
    }
  } catch (err) {
    console.error("Interview turn failed", err);
    return NextResponse.json(
      { error: "Não foi possível continuar a entrevista agora. Tente novamente." },
      { status: 500 }
    );
  }

  transcript.push({ role: "assistant", content: reply });

  // Voz da pergunta — só nos turnos normais (não no parecer final, que é um
  // relatório longo em markdown pra LER, não pra ouvir). Falha aqui nunca
  // derruba o turno: o candidato já tem a pergunta em texto de qualquer
  // forma, o áudio é um complemento.
  let audioBase64: string | undefined;
  if (!shouldFinish) {
    try {
      const openai = getAiClient();
      const speech = await openai.audio.speech.create({
        model: AI_MODELS.interviewVoice,
        voice: "alloy",
        input: reply,
      });
      const buffer = Buffer.from(await speech.arrayBuffer());
      audioBase64 = buffer.toString("base64");
    } catch (err) {
      console.error("Interview TTS failed", err);
    }
  }

  const nextSteps: NextStep[] = nextStepsList.map((text) => ({ text, done: false }));

  try {
    if (currentSessionId) {
      const update: Record<string, unknown> = {
        transcript,
        finished: shouldFinish,
        updated_at: new Date().toISOString(),
      };
      if (shouldFinish) {
        update.final_assessment = reply;
        update.next_steps = nextSteps;
      }
      await supabase
        .from("interview_sessions")
        .update(update)
        .eq("id", currentSessionId)
        .eq("user_id", user.id);
    } else {
      const { data: inserted, error } = await supabase
        .from("interview_sessions")
        .insert({
          user_id: user.id,
          transcript,
          job_application_id: jobApplicationId ?? null,
          job_context: jobContext || null,
          finished: shouldFinish,
          final_assessment: shouldFinish ? reply : null,
          next_steps: shouldFinish ? nextSteps : null,
        })
        .select("id")
        .single();
      if (error) throw error;
      currentSessionId = inserted.id;

      // Só liga no momento da criação — não precisa reatualizar a cada
      // turno depois disso, o vínculo não muda mais pro resto da sessão.
      if (jobApplicationId) {
        await supabase
          .from("job_applications")
          .update({ interview_session_id: currentSessionId, updated_at: new Date().toISOString() })
          .eq("id", jobApplicationId)
          .eq("user_id", user.id);
      }
    }
  } catch (err) {
    console.error("Failed to persist interview session", err);
  }

  return NextResponse.json({
    sessionId: currentSessionId,
    message: reply,
    finished: shouldFinish,
    audio: audioBase64,
    nextSteps: shouldFinish ? nextSteps : undefined,
  });
}
