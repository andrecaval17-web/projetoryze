"use client";

import { useState } from "react";
import { MessageCircle, Download, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadResumePdf } from "@/lib/download-resume-pdf";
import type { ResumeData, ResumeTemplateSlug } from "@/lib/resume-schema";

interface WhatsappInviteBannerProps {
  whatsappLink: string | null;
  /** Quando informado, mostra "Baixar em PDF" ao lado de "Entrar no grupo" —
   * as duas recompensas do banner de sucesso juntas (achado #3 da segunda
   * leva da auditoria de UX de 2026-07-22: antes o botão de PDF ficava só lá
   * embaixo, depois do formulário inteiro de edição). */
  resumeData?: ResumeData;
  resumeTemplateSlug?: ResumeTemplateSlug;
}

/**
 * Mostrado só na resposta em que `maybeSendWhatsappInvite` (src/lib/
 * whatsapp-invite.ts) de fato disparou o convite pela primeira vez — nunca
 * de novo depois disso (o e-mail já cobre quem não vir esta tela).
 */
export function WhatsappInviteBanner({ whatsappLink, resumeData, resumeTemplateSlug }: WhatsappInviteBannerProps) {
  const [pdfState, setPdfState] = useState<"idle" | "generating" | "error">("idle");

  if (!whatsappLink) return null;

  async function handleDownloadPdf() {
    if (!resumeData || !resumeTemplateSlug) return;
    setPdfState("generating");
    try {
      await downloadResumePdf(resumeData, resumeTemplateSlug);
      setPdfState("idle");
    } catch (err) {
      console.error("PDF export failed", err);
      setPdfState("error");
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-accent-500/40 bg-accent-500/5 p-4">
      <div>
        <p className="text-body-sm font-medium text-fg">Currículo pronto!</p>
        <p className="text-caption text-fg-muted">
          Baixe agora e entre no grupo de vagas do WhatsApp — vagas novas todos os dias, grátis.
        </p>
        {pdfState === "error" && (
          <p className="mt-1 flex items-center gap-1.5 text-caption text-error">
            <AlertCircle className="h-3.5 w-3.5" /> Não foi possível gerar o PDF.
          </p>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2.5">
        {resumeData && resumeTemplateSlug && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleDownloadPdf}
            loading={pdfState === "generating"}
          >
            <Download className="h-3.5 w-3.5" />
            Baixar em PDF
          </Button>
        )}
        <Button asChild size="sm">
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-3.5 w-3.5" />
            Entrar no grupo
          </a>
        </Button>
      </div>
    </div>
  );
}
