import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/auth";
import { RequestLinkForm } from "./request-link-form";

export const metadata: Metadata = { title: "Gerar link de Abertura de Vaga — Ryze" };

export default async function NovaAberturaPage() {
  await requireAdmin();

  return (
    <div>
      <h1 className="font-display text-heading-lg font-semibold text-fg">Gerar link de Abertura de Vaga</h1>
      <p className="mt-1 text-body-sm text-fg-muted">
        Cada link é de uso único — vale pra uma única solicitação, pra uma empresa específica.
      </p>
      <div className="mt-6 max-w-2xl">
        <RequestLinkForm />
      </div>
    </div>
  );
}
