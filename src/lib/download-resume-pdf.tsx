import type { ResumeData, ResumeTemplateSlug } from "@/lib/resume-schema";

function slugifyFileName(text: string): string {
  return (
    text
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "candidato"
  );
}

/**
 * Gera o PDF do currículo no navegador (sem round-trip pro servidor) e
 * dispara o download. Extraído de resume-editor.tsx pra ser reaproveitado
 * pelo botão rápido no banner de "currículo pronto" (whatsapp-invite-banner.tsx).
 */
export async function downloadResumePdf(data: ResumeData, templateSlug: ResumeTemplateSlug) {
  const { pdf } = await import("@react-pdf/renderer");
  const { RESUME_PDF_COMPONENTS } = await import("@/components/resume-templates/pdf");
  const PdfComponent = RESUME_PDF_COMPONENTS[templateSlug];
  const blob = await pdf(<PdfComponent data={data} />).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `curriculo-${slugifyFileName(data.nome)}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
