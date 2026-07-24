import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function BackToPanel() {
  return (
    <Link
      href="/para-candidatos/painel"
      className="inline-flex items-center gap-1.5 text-body-sm font-medium text-fg-muted transition-ryze hover:text-fg"
    >
      <ArrowLeft className="h-3.5 w-3.5" /> Voltar para sua área
    </Link>
  );
}
