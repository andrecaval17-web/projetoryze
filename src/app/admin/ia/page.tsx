import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getLast30DaysRange } from "@/lib/admin/date-ranges";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export const metadata = { title: "Custo de IA — Admin Ryze" };

const FEATURE_LABELS: Record<string, string> = {
  resume: "Currículo",
  linkedin: "LinkedIn",
  interview: "Entrevista",
  ats: "Vagas (ATS)",
};

/** Provedor é inferido do prefixo do nome do modelo — a tabela não guarda
 * o provedor separadamente (ver ai_usage_log em 0004). Cobre o histórico
 * desta conta (OpenAI, e Gemini de quando era o provedor temporário) e
 * deixa margem pra um provedor futuro (ex: Grok) sem precisar migrar dado. */
function providerFromModel(model: string): string {
  if (model.startsWith("gpt-") || model.startsWith("o1") || model.startsWith("o3") || model.startsWith("o4")) {
    return "OpenAI";
  }
  if (model.startsWith("gemini-")) return "Google Gemini";
  if (model.startsWith("grok-")) return "xAI Grok";
  return "Outro";
}

export default async function AdminIaPage() {
  const supabase = getSupabaseAdminClient();
  const { start, end } = getLast30DaysRange();

  const { data: rows } = await supabase
    .from("ai_usage_log")
    .select("feature, model, prompt_tokens, completion_tokens, total_tokens, created_at")
    .gte("created_at", start.toISOString())
    .lte("created_at", end.toISOString());

  interface Aggregate {
    provider: string;
    feature: string;
    calls: number;
    totalTokens: number;
  }

  const aggregates = new Map<string, Aggregate>();
  for (const row of rows ?? []) {
    const provider = providerFromModel(row.model);
    const key = `${provider}::${row.feature}`;
    const existing = aggregates.get(key) ?? { provider, feature: row.feature, calls: 0, totalTokens: 0 };
    existing.calls += 1;
    existing.totalTokens += row.total_tokens ?? 0;
    aggregates.set(key, existing);
  }

  const sorted = Array.from(aggregates.values()).sort((a, b) => b.calls - a.calls);
  const totalCalls = sorted.reduce((sum, a) => sum + a.calls, 0);
  const totalTokens = sorted.reduce((sum, a) => sum + a.totalTokens, 0);
  const maxCalls = Math.max(...sorted.map((a) => a.calls), 1);

  return (
    <div>
      <h1 className="font-display text-display-md font-semibold text-fg">Custo de IA</h1>
      <p className="mt-1 text-body-sm text-fg-muted">Últimos 30 dias, por provedor e funcionalidade.</p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-heading-sm">Total de chamadas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-display-sm font-semibold text-fg">{totalCalls}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-heading-sm">Total de tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-display-sm font-semibold text-fg">
              {totalTokens.toLocaleString("pt-BR")}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 flex flex-col gap-3">
        {sorted.map((agg) => (
          <div key={`${agg.provider}::${agg.feature}`} className="rounded-lg border border-border bg-bg-surface p-4">
            <div className="flex items-center justify-between text-body-sm">
              <span className="font-medium text-fg">
                {agg.provider} · {FEATURE_LABELS[agg.feature] ?? agg.feature}
              </span>
              <span className="text-fg-muted">
                {agg.calls} chamadas · {agg.totalTokens.toLocaleString("pt-BR")} tokens
              </span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-bg-surface-2">
              <div
                className="h-full rounded-full bg-gradient-ryze"
                style={{ width: `${Math.max((agg.calls / maxCalls) * 100, 4)}%` }}
              />
            </div>
          </div>
        ))}
        {sorted.length === 0 && (
          <p className="rounded-lg border border-border bg-bg-surface p-8 text-center text-body-sm text-fg-muted">
            Nenhuma chamada de IA nos últimos 30 dias.
          </p>
        )}
      </div>
    </div>
  );
}
