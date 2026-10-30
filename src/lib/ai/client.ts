import OpenAI from "openai";

/**
 * Camada ÚNICA de acesso a modelos de IA. Toda chamada de IA do site passa
 * por aqui — nenhum outro arquivo deve importar `openai` diretamente ou
 * saber qual provedor está por trás. Trocar de provedor é mudança só neste
 * arquivo.
 *
 * Histórico de provedor (documentado porque já mudou três vezes):
 * Anthropic (plano original) → OpenAI (decisão do cliente) → Gemini (troca
 * temporária, tier gratuito, só para testes) → OpenAI de novo, agora com
 * chave PAGA (decisão definitiva do cliente).
 *
 * ⚠️ A chave (`OPENAI_API_KEY`) é sensível: nunca expor no client, nunca
 * commitar (fica só em `.env.local`, git-ignorado, e nas env vars da
 * Vercel). Ver HANDOFF.md para o histórico completo e status de segurança.
 */
export function getAiClient() {
  const key = process.env.OPENAI_API_KEY;

  if (!key) {
    throw new Error("IA não está configurada: defina OPENAI_API_KEY em .env.local");
  }

  return new OpenAI({ apiKey: key });
}

/**
 * Um modelo por tarefa, mas as 3 apontam pra `gpt-5.4-mini` — o tier "mini"
 * da geração atual (confirmado disponível e funcional nesta chave via
 * `GET /v1/models` + chamada real, incluindo `response_format:
 * json_object` usado pelo currículo). Nenhuma das 3 tarefas exige
 * raciocínio de ponta: currículo e análise de LinkedIn são reorganizar/
 * comentar texto que o próprio candidato forneceu (não inventar do zero),
 * e a entrevista segue um roteiro de perguntas com um prompt de sistema
 * bem definido — o tier "mini" entrega qualidade de escrita em PT-BR
 * suficiente por uma fração do custo do modelo cheio (`gpt-5.4`), e é mais
 * robusto que o tier "nano" pra manter nuance/coerência num texto mais
 * longo como o currículo. Se a qualidade não for suficiente em produção,
 * o primeiro passo é testar `gpt-5.4` (sem "-mini") antes de diferenciar
 * modelo por tarefa.
 */
export const AI_MODELS = {
  linkedinAnalysis: "gpt-5.4-mini",
  resumeGeneration: "gpt-5.4-mini",
  resumeExtraction: "gpt-5.4-mini",
  resumeImprove: "gpt-5.4-mini",
  interview: "gpt-5.4-mini",
  /**
   * Régua de aderência do ATS (src/lib/ats/scoring.ts + submitApplication) —
   * tarefa própria, não reaproveita `linkedinAnalysis`. O ideal seria o tier
   * cheio (`gpt-5.4`, sem "-mini"): julgar permanência/aderência de carreira
   * pra decidir quem avança pesa mais caro errar do que reescrever um
   * currículo. Mas este ambiente de dev não teve acesso de rede à API da
   * OpenAI pra confirmar via `GET /v1/models` + chamada real se `gpt-5.4`
   * (cheio) está disponível nesta chave, do jeito que o comentário acima
   * documenta pra `gpt-5.4-mini` — por isso fica em `gpt-5.4-mini` até
   * alguém com acesso à chave confirmar o cheio e trocar aqui.
   */
  atsScoring: "gpt-5.4-mini",
  /** Voz das perguntas da Simulação de Entrevista (texto → áudio) — tier
   * "mini" também aqui, mesmo raciocínio de custo dos modelos de texto acima. */
  interviewVoice: "gpt-4o-mini-tts",
} as const;
