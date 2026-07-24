import Link from "next/link";
import { CheckCircle2, MessageCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export function WhatsappCta({ whatsappLink }: { whatsappLink: string | null }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-border bg-bg-surface p-8 text-center">
      <CheckCircle2 className="h-10 w-10 text-accent-600 dark:text-accent-400" />
      <div>
        <h2 className="font-display text-heading-md font-semibold text-fg">
          Perfil recebido!
        </h2>
        <p className="mt-1 text-body-sm text-fg-muted">
          Sua área já está disponível — é lá que ficam as ferramentas de IA
          quando você quiser evoluir de plano. Enquanto isso, entre no nosso
          grupo de vagas:
        </p>
      </div>

      {whatsappLink ? (
        <Button asChild size="lg">
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-4 w-4" />
            Entrar no grupo do WhatsApp
          </a>
        </Button>
      ) : (
        <p className="flex items-center gap-2 rounded-md bg-bg-surface-2 px-4 py-3 text-body-sm text-fg-muted">
          <Clock className="h-4 w-4 shrink-0" />
          O link do grupo é enviado em breve por e-mail.
        </p>
      )}

      <div className="flex items-center gap-4">
        <Link href="/para-candidatos/painel" className="text-body-sm font-medium text-accent-600 dark:text-accent-400">
          Ir para sua área
        </Link>
        <Link href="/" className="text-body-sm font-medium text-fg-muted">
          Voltar para a Home
        </Link>
      </div>
    </div>
  );
}
