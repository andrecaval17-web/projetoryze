-- Guia de onboarding do candidato pago (Impulso/Mentoria) — mostrado na
-- primeira vez que a pessoa entra na área logada depois de assinar OU fazer
-- upgrade. Reaproveita um comportamento que já existe: toda troca de plano
-- (assinatura nova ou upgrade) já cria uma linha NOVA em `subscriptions`
-- (ver comentário em 0002_subscriptions.sql) — renovação do mesmo plano
-- atualiza a linha existente. Isso já é exatamente o sinal de "primeira vez
-- neste plano" que a introdução precisa, sem precisar comparar plano
-- antigo x novo à parte.
alter table public.subscriptions
  add column if not exists onboarding_seen_at timestamptz;

-- Sem policy de update aqui de propósito (mesma decisão do resto da
-- tabela — ver 0002_subscriptions.sql): a gravação desta coluna passa por
-- um Server Action que confirma o usuário autenticado e usa a service role
-- só pra essa coluna, em vez de abrir escrita geral em `subscriptions` pro
-- client (que também tem `stripe_customer_id`/`status` etc.).
