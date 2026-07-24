/**
 * Ciclo de agendamento da Mentoria = mês corrente (dia 1 ao último dia),
 * não a data de início da assinatura. Escolha deliberada: o ciclo por mês
 * corrente é simples de calcular corretamente (sem depender de ler
 * `subscriptions.created_at`/`current_period_start` do Stripe a cada
 * checagem) e alinhado com como o negócio já pensa o benefício ("1 sessão
 * por mês"). A contagem usa `scheduled_at` da sessão (a data da sessão em
 * si), não a data em que foi marcada — ou seja, o que conta é em qual mês
 * a sessão VAI ACONTECER, não em qual mês o candidato clicou em agendar.
 */
export function getCurrentCycleRange(reference: Date = new Date()): { start: Date; end: Date } {
  const start = new Date(reference.getFullYear(), reference.getMonth(), 1, 0, 0, 0, 0);
  const end = new Date(reference.getFullYear(), reference.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
}
