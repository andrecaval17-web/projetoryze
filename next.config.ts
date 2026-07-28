import type { NextConfig } from "next";

// CSP + Permissions-Policy + X-Frame-Options moveram pra src/proxy.ts em
// 2026-07-20: a CSP estática daqui quebrou "Adaptar para vaga" (Currículo) e
// a captura de voz da Simulação de Entrevista em produção — bloqueava os
// scripts inline que o próprio Next.js injeta pra hidratação (não dá pra
// cobrir com hash fixo porque variam por request). Precisa de nonce, e nonce
// só pode ser gerado por request, no proxy — ver comentário lá.
const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Default do Next.js é 1MB — um PDF exportado do LinkedIn com foto de
      // perfil passa disso com facilidade. O limite de verdade pro
      // candidato é MAX_FILE_SIZE_BYTES em painel/linkedin/actions.ts (6MB);
      // aqui só damos margem pro corpo multipart/form-data inteiro.
      bodySizeLimit: "8mb",
    },
  },
  // pdf-parse (via pdfjs-dist) carrega seu "worker" via caminho de arquivo
  // resolvido em runtime (ver src/lib/pdf.ts) — o rastreamento de arquivos
  // da Vercel não enxerga isso sozinho porque não é um import/require
  // estático. Sem isso, funciona local mas quebra em produção. Toda rota
  // que chama extractPdfText() precisa do include — não só a de LinkedIn:
  // o upload de currículo real (importar PDF no perfil base) usa a MESMA
  // função e caiu nesse mesmo bug em produção por faltar aqui.
  outputFileTracingIncludes: {
    "/para-candidatos/painel/linkedin": [
      "./node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs",
    ],
    "/para-candidatos/painel/curriculo": [
      "./node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs",
    ],
    "/vagas/[slug]": ["./node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs"],
  },
  // Reformulação de /produtos em 2026-07-26: só a Academy e a Cultura têm
  // produto pronto. Educação Corporativa virou a landing dedicada da
  // Academy; Recrutamento com IA saiu do ar (produto ainda não está pronto)
  // e volta pro hub em vez de 404 em links já compartilhados.
  async redirects() {
    return [
      {
        source: "/produtos/educacao-corporativa",
        destination: "/produtos/academy",
        permanent: true,
      },
      {
        source: "/produtos/recrutamento-ia",
        destination: "/produtos",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
