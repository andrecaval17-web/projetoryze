import type { ResumeData } from "@/lib/resume-schema";
import { emptyResumeData } from "@/lib/resume-schema";

/**
 * Gera o PDF do currículo no servidor (Node), pro caso de uma entrada do
 * banco de talentos sem currículo enviado (`source: 'cadastro'`) precisar
 * virar uma candidatura de verdade num processo seletivo. Sempre usa o
 * template "basico" — é o único disponível pra quem nunca pagou.
 *
 * `pdf(...).toBuffer()` do @react-pdf/renderer devolve um Node Readable, não
 * um Buffer de fato — precisa coletar os chunks manualmente.
 */
export async function generateResumePdfBuffer(data: ResumeData): Promise<Buffer> {
  const { pdf } = await import("@react-pdf/renderer");
  const { RESUME_PDF_COMPONENTS } = await import("@/components/resume-templates/pdf");
  const PdfComponent = RESUME_PDF_COMPONENTS.basico;
  const stream = await pdf(<PdfComponent data={data} />).toBuffer();

  const chunks: Buffer[] = [];
  return new Promise<Buffer>((resolve, reject) => {
    stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}

/**
 * Constrói um `ResumeData` mínimo a partir de uma linha do banco de
 * talentos — usado quando não há `candidate_profiles.profile_data`
 * disponível (ex: candidato se cadastrou mas nunca chegou a salvar o
 * perfil). O PDF gerado fica bem enxuto, mas é o suficiente pra dar entrada
 * numa vaga.
 */
export function buildResumeDataFromTalentPool(row: {
  name: string;
  email: string;
  phone: string | null;
  linkedin_url?: string | null;
  target_role: string | null;
  skills: string[];
  summary: string | null;
}): ResumeData {
  return {
    ...emptyResumeData,
    nome: row.name,
    titulo: row.target_role || "",
    resumo: row.summary || "",
    contato: {
      email: row.email,
      telefone: row.phone || "",
      linkedin: row.linkedin_url || "",
    },
    habilidades: row.skills,
  };
}
