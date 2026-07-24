import path from "node:path";
import { pathToFileURL } from "node:url";
import { ensureDomMatrixPolyfill } from "./dommatrix-polyfill";

const MAX_EXTRACTED_CHARS = 12000;

let workerConfigured = false;

/**
 * `pdf-parse` (via pdfjs-dist) tenta carregar seu "worker" com um `import()`
 * dinâmico resolvido em runtime. Rodando direto no Node isso funciona, mas
 * dentro do bundle do Next.js/Turbopack o caminho é reescrito para dentro de
 * `.next/dev/server/chunks/...`, onde o arquivo não existe — falha com
 * "Setting up fake worker failed: Cannot find module ...pdf.worker.mjs".
 * Apontar explicitamente pra localização real do arquivo em node_modules
 * (fora do grafo de bundling do Turbopack) resolve isso. Precisa rodar antes
 * de qualquer `new PDFParse(...)`.
 *
 * Também precisa do polyfill de `DOMMatrix` (ver dommatrix-polyfill.ts)
 * instalado ANTES do primeiro `import("pdf-parse")` — pdfjs-dist referencia
 * `DOMMatrix` em código de módulo executado no carregamento, não só ao
 * renderizar, e isso quebra especificamente no bundle de produção da Vercel
 * (não em `next dev` nem rodando o pacote puro no Node).
 */
async function ensureWorkerConfigured() {
  if (workerConfigured) return;
  await ensureDomMatrixPolyfill();
  const { PDFParse } = await import("pdf-parse");
  const workerPath = path.join(
    process.cwd(),
    "node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs"
  );
  PDFParse.setWorker(pathToFileURL(workerPath).href);
  workerConfigured = true;
}

export async function extractPdfText(data: Uint8Array): Promise<string> {
  await ensureWorkerConfigured();
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data });
  try {
    const result = await parser.getText();
    return result.text.trim().slice(0, MAX_EXTRACTED_CHARS);
  } finally {
    await parser.destroy();
  }
}

export async function extractDocxText(data: Uint8Array): Promise<string> {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ buffer: Buffer.from(data) });
  return result.value.trim().slice(0, MAX_EXTRACTED_CHARS);
}
