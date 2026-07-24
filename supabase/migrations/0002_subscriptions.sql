-- Uma linha por assinatura Stripe, não uma coluna de "plano atual" em
-- profiles. Motivo: o Stripe já modela assinatura como uma entidade própria
-- (com seu próprio ciclo de vida via webhooks: criada, atualizada,
-- cancelada), e `stripe_subscription_id` é a chave natural pra fazer upsert
-- direto a partir dos eventos, sem precisar cruzar por e-mail. Também deixa
-- espaço pra histórico (ex: downgrade Mentoria -> Impulso vira uma nova
-- linha, não sobrescreve a anterior) — útil pro painel admin da Fase 5.
--
-- O plano Grátis não gera assinatura no Stripe, então não tem linha aqui:
-- "sem assinatura ativa" já significa Grátis por padrão na lógica da app.
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan text not null check (plan in ('impulso', 'mentoria')),
  status text not null check (
    status in (
      'active', 'trialing', 'past_due', 'canceled',
      'incomplete', 'incomplete_expired', 'unpaid', 'paused'
    )
  ),
  stripe_customer_id text not null,
  stripe_subscription_id text not null unique,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subscriptions_user_id_idx on public.subscriptions (user_id);

alter table public.subscriptions enable row level security;

-- Leitura: o próprio usuário vê sua assinatura (base do controle de acesso
-- do painel na Fase 4). Escrita: só o webhook do Stripe, usando a
-- service_role key (que ignora RLS) — por isso não há policy de
-- insert/update para anon/authenticated aqui, de propósito.
create policy "Users can read their own subscription"
  on public.subscriptions
  for select
  to authenticated
  using (auth.uid() = user_id);
