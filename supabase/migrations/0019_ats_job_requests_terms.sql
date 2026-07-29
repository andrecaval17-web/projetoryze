-- Aceite do Termo de Compromisso no formulário público de Abertura de
-- Vaga — pedido do cliente em 2026-07-29. Sem assinatura física: o
-- timestamp de quando o checkbox foi marcado e o formulário enviado é o
-- único registro do aceite. Nullable porque solicitações antigas (antes
-- desta coluna existir) nunca tiveram esse aceite.
alter table public.ats_job_requests
  add column terms_accepted_at timestamptz;
