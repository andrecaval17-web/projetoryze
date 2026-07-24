import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Chamado "middleware" até o Next.js 15; renomeado para "proxy" a partir do
// Next.js 16 (mesma funcionalidade, arquivo/nome de export diferentes).

const isDev = process.env.NODE_ENV === "development";

// CSP por nonce, gerado a cada request — necessário porque o próprio
// Next.js App Router injeta vários <script> inline no HTML pra entregar o
// payload de streaming dos Server Components (`self.__next_f.push(...)`),
// além do único script inline nosso (tema, em layout.tsx). Uma CSP estática
// com hash cobre só o NOSSO script; os do framework variam por request
// (carregam dados reais da página) e não têm hash fixo possível — foi
// exatamente isso que quebrou "Adaptar para vaga" e a Simulação de
// Entrevista em produção em 2026-07-20: script-src sem nonce/unsafe-inline
// bloqueou os scripts de hidratação do próprio Next.js, então a página
// inteira ficava sem nenhuma interatividade client-side (React nunca
// hidratava), mesmo sem erro visível pro candidato — os dois sintomas
// reportados (botão que não reage, e o hook de suporte a voz preso no
// valor de fallback do servidor) são a mesma causa: hidratação nunca
// acontece.
// `wasm-unsafe-eval` (não confundir com `unsafe-eval`, que libera eval()/
// Function() arbitrário — não é isso) é exigido pelo motor de layout do
// @react-pdf/renderer (Yoga, compilado em WebAssembly, usado no botão
// "Baixar em PDF" de resume-editor.tsx). Sem essa palavra-chave,
// WebAssembly.instantiate() é bloqueado pela CSP e a exportação de PDF
// falha em produção — bug real encontrado e corrigido em 2026-07-20,
// confirmado pelo erro exato no console do browser antes de corrigir:
// "CompileError: WebAssembly.instantiate(): ... violates ... because
// 'unsafe-eval' is not an allowed source of script".
function buildCspHeader(nonce: string) {
  return `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'wasm-unsafe-eval'${isDev ? " 'unsafe-eval'" : ""};
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: blob:;
    font-src 'self';
    connect-src 'self'${isDev ? " ws://localhost:* http://localhost:*" : ""};
    frame-src https://cal.com;
    media-src 'self' blob:;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `
    .replace(/\s{2,}/g, " ")
    .trim();
}

export async function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const cspHeader = buildCspHeader(nonce);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", cspHeader);
  // Repassado pro Navbar (Server Component) decidir o variant certo — ver
  // comentário em navbar.tsx sobre por que isso não dá pra resolver com
  // usePathname() (o Navbar lê a sessão do usuário no servidor).
  requestHeaders.set("x-pathname", request.nextUrl.pathname);

  const response = await updateSession(request, requestHeaders);

  response.headers.set("Content-Security-Policy", cspHeader);
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), geolocation=(), microphone=(self), payment=()");

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
