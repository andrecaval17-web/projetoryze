-- Currículo com IA reformulado: perfil base estruturado (Bloco 1), fonte de
-- verdade única reaproveitada tanto pelo fluxo Grátis quanto pela adaptação
-- por vaga (Bloco 2, planos pagos). Usa o MESMO shape de `resume_versions
-- .resume_data` (ver src/lib/resume-schema.ts) — não é uma tabela nova
-- porque é "1 por candidato", igual ao resto de `candidate_profiles`.
--
-- As colunas antigas (full_name, email, phone, experience_summary,
-- target_role) continuam existindo por compatibilidade: `/para-candidatos
-- /comecar` (gate de acesso ao painel + liberação do grupo do WhatsApp)
-- ainda escreve nelas e não tem relação com o currículo.
alter table public.candidate_profiles
  add column if not exists profile_data jsonb;
