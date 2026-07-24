-- Faltava policy de delete em resume_versions — candidato não conseguia
-- excluir currículos adaptados antigos (só existiam select/insert/update).
-- Não mexe em candidate_profiles (perfil base): é uma tabela separada, uma
-- linha por usuário, sem policy de delete de propósito (o perfil base nunca
-- deve ser apagável pelo candidato, só sobrescrito).
create policy "Users can delete their own resume versions"
  on public.resume_versions for delete
  to authenticated
  using (auth.uid() = user_id);
