-- Fase 5: painel administrativo.
--
-- admin_users NÃO tem policy de insert/update/delete pra `authenticated`
-- de propósito — igual ao padrão já usado em `subscriptions`/`ai_usage_log`:
-- quem escreve é sempre o backend via service_role (o seed manual do
-- primeiro owner, feito direto no SQL, e o fluxo de convite em
-- /admin/equipe), nunca o cliente diretamente. A única policy é de
-- leitura da própria linha — é o que `requireAdmin()` usa pra checar
-- sessão respeitando RLS antes de trocar pro cliente service_role.
create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'admin')),
  invited_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

create policy "Admins can view their own admin_users row"
  on public.admin_users for select
  to authenticated
  using (auth.uid() = user_id);

-- Status do funil de leads (consultoria/produtos/contato) — usado pelo
-- painel admin pra acompanhamento manual. Sem policy de update pra
-- `authenticated`: a troca de status é sempre via Server Action admin
-- (service_role, depois de requireAdmin()), nunca direto pelo cliente.
alter table public.leads
  add column if not exists status text not null default 'novo'
    check (status in ('novo', 'contatado', 'convertido', 'descartado'));
