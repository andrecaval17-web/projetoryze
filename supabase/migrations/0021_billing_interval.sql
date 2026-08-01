-- Planos anuais (20% de desconto) pra Impulso/Mentoria — proposta aprovada
-- em 2026-08-01. Sem essa coluna, mensal e anual ficam indistinguíveis no
-- banco (o Stripe já sabe o intervalo pelo próprio Price, mas nada aqui
-- refletia isso). Default 'month' porque toda assinatura já existente antes
-- desta coluna é mensal de verdade (só existiam Price IDs mensais até agora).
alter table public.subscriptions
  add column billing_interval text not null default 'month' check (billing_interval in ('month', 'year'));
