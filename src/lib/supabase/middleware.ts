import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the Supabase auth token on every matched request and re-writes
 * the (possibly rotated) session cookie onto the response. Without this,
 * sessions silently expire mid-visit instead of auto-refreshing — this is
 * what makes "close/reopen the browser and still be logged in" work.
 */
/**
 * `requestHeaders` já vem com `x-nonce`/`Content-Security-Policy` setados
 * pelo proxy.ts (nonce por request, pra CSP liberar os scripts inline que o
 * próprio Next.js injeta pra streaming/hidratação — ver comentário em
 * proxy.ts). Precisa ser reaplicado em TODO `NextResponse.next({ request })`
 * daqui, inclusive o recriado dentro de `setAll`, senão a request que o
 * Server Component enxerga perde esses headers.
 */
export async function updateSession(request: NextRequest, requestHeaders: Headers) {
  let supabaseResponse = NextResponse.next({ request: { headers: requestHeaders } });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Sem credenciais configuradas, deixa a request seguir normalmente em vez
  // de derrubar o site inteiro (mesmo padrão de degradação graciosa usado
  // nos outros clientes Supabase do projeto).
  if (!url || !anonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(url, anonKey, {
    // Mesma flag de server.ts — os dois pontos que escrevem o cookie de
    // sessão precisam concordar, senão o refresh de token aqui sobrescreve
    // o cookie sem HttpOnly.
    cookieOptions: { httpOnly: true },
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request: { headers: requestHeaders } });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Necessário para de fato disparar a renovação do token — não remover.
  await supabase.auth.getUser();

  return supabaseResponse;
}
