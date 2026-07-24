-- Tabela própria, não reaproveitando `leads`. Motivo: `leads` modela um
-- contato anônimo (empresa querendo consultoria/produtos, ou visitante do
-- formulário de contato) — não tem `user_id`, e campos como `company` não
-- fazem sentido para um candidato. O perfil do candidato PRECISA estar
-- vinculado à conta (auth.users) porque a Fase 4 vai ler esses dados de
-- volta para a IA gerar o currículo — misturar isso em `leads` obrigaria
-- a remendar a tabela de vendas com um propósito totalmente diferente.
--
-- Um perfil por usuário (não várias linhas): isto é a base/insumo bruto que
-- o candidato preenche uma vez. "Versões adaptadas por vaga" (recurso do
-- plano Impulso) é Fase 4 e vira sua própria tabela depois, sem mexer aqui.
create table if not exists public.candidate_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  experience_summary text not null,
  target_role text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.candidate_profiles enable row level security;

-- Ao contrário de `subscriptions` (só o webhook escreve), aqui é o próprio
-- candidato quem preenche e mantém seus dados — RLS trava cada linha ao
-- dono via auth.uid(), sem precisar de service_role para nada neste fluxo.
create policy "Users can view their own candidate profile"
  on public.candidate_profiles for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own candidate profile"
  on public.candidate_profiles for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own candidate profile"
  on public.candidate_profiles for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
