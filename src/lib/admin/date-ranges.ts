/** Mês corrente (dia 1 ao último dia) — usado pelas métricas "neste mês" do dashboard. */
export function getCurrentMonthRange(reference: Date = new Date()): { start: Date; end: Date } {
  const start = new Date(reference.getFullYear(), reference.getMonth(), 1, 0, 0, 0, 0);
  const end = new Date(reference.getFullYear(), reference.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

/** Janela móvel de 30 dias — usada pelo painel de custo de IA. */
export function getLast30DaysRange(reference: Date = new Date()): { start: Date; end: Date } {
  const end = reference;
  const start = new Date(reference);
  start.setDate(start.getDate() - 30);
  return { start, end };
}

/**
 * `Date.now()`/`new Date()` chamado direto no corpo de um componente é
 * flagado pelo lint (`react-hooks/purity`) mesmo em Server Components —
 * por isso a comparação de "é futuro" vira uma função à parte em vez de
 * inline na página.
 */
export function isFutureDate(iso: string): boolean {
  return new Date(iso).getTime() > Date.now();
}
