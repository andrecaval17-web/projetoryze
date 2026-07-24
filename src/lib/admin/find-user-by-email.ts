/**
 * ⚠️ O parâmetro `?email=` de `GET /auth/v1/admin/users` NÃO filtra
 * server-side neste projeto (confirmado testando direto: devolve TODOS os
 * usuários, ignorando o filtro). Busca a lista completa e filtra por
 * e-mail exato no código.
 *
 * `per_page=1000` cobre a base de usuários atual com folga; se a base
 * crescer muito além disso, isso precisa virar paginação de verdade.
 *
 * Extraído de admin/equipe/actions.ts pra ser reaproveitado pelo
 * cross-reference informativo do ATS (candidate_user_id em ats_applications).
 */
export async function findUserIdByEmail(email: string): Promise<string | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const res = await fetch(`${url}/auth/v1/admin/users?per_page=1000`, {
    headers: { apikey: key ?? "", Authorization: `Bearer ${key}` },
  });
  if (!res.ok) return null;
  const body = await res.json();
  const normalized = email.trim().toLowerCase();
  const match = (body.users ?? []).find(
    (u: { email?: string }) => u.email?.trim().toLowerCase() === normalized
  );
  return match?.id ?? null;
}
