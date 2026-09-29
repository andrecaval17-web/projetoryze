import Link from "next/link";
import { LinkedinIcon, InstagramIcon } from "@/components/ui/social-icons";
import { Logo } from "@/components/brand/logo";
import { FoldDivider } from "@/components/brand/fold-divider";
import { buildContactWhatsappHref } from "@/lib/whatsapp-number";

const columns = [
  {
    title: "Consultoria",
    links: [
      { label: "Recrutamento e Seleção", href: "/consultoria/recrutamento-e-selecao" },
      { label: "Cultura Organizacional", href: "/consultoria/cultura-organizacional" },
      { label: "Remuneração Estratégica", href: "/consultoria/cargos-e-salarios" },
      { label: "Treinamento e Desenvolvimento", href: "/consultoria/treinamento-e-desenvolvimento" },
    ],
  },
  {
    title: "Produtos",
    links: [
      { label: "Ryze Academy", href: "/produtos/academy" },
      { label: "Cultura & Engajamento", href: "/produtos/cultura" },
    ],
  },
  {
    title: "Candidatos",
    links: [
      { label: "Planos", href: "/para-candidatos" },
      { label: "Entrar", href: "/login" },
      { label: "Criar conta", href: "/cadastro" },
    ],
  },
  {
    title: "Empresa",
    links: [
      { label: "Sobre", href: "/sobre" },
      // Redireciona pro WhatsApp em vez do formulário /contato (que ficava
      // registrando lead sem notificar ninguém) — mesmo padrão das CTAs
      // "Falar com um especialista" em 2026-08-12.
      { label: "Contato", href: buildContactWhatsappHref("os serviços da Ryze") },
      { label: "Termos de Uso", href: "/termos" },
      { label: "Política de Privacidade", href: "/privacidade" },
      { label: "Política de Cancelamento e Reembolso", href: "/politica-cancelamento" },
    ],
  },
];

export function Footer() {
  return (
    // Same forced-dark treatment as the navbar: graphite bookends the page
    // on every load, independent of the visitor's light/dark preference.
    <footer className="dark mt-24 bg-ink">
      <FoldDivider />
      <div className="mx-auto max-w-6xl px-5 py-14 lg:px-8">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="mb-3 text-label font-semibold uppercase tracking-wide text-fg-muted">
                {col.title}
              </h3>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link) => {
                  const isExternal = link.href.startsWith("http");
                  return (
                    <li key={link.href}>
                      {isExternal ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-body-sm text-fg transition-ryze hover:text-accent-600 dark:hover:text-accent-400"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className="text-body-sm text-fg transition-ryze hover:text-accent-600 dark:hover:text-accent-400"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-6 border-t border-border pt-8 sm:flex-row sm:items-center">
          <Logo size="sm" showTagline tone="dark-bg" />

          <div className="flex items-center gap-4">
            <a
              href="https://www.linkedin.com/company/ryze-consultoria/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Ryze no LinkedIn"
              className="text-fg-muted transition-ryze hover:text-accent-600 dark:hover:text-accent-400"
            >
              <LinkedinIcon className="h-5 w-5" />
            </a>
            <a
              href="https://www.instagram.com/ryze.rh"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Ryze no Instagram"
              className="text-fg-muted transition-ryze hover:text-accent-600 dark:hover:text-accent-400"
            >
              <InstagramIcon className="h-5 w-5" />
            </a>
          </div>
        </div>

        <p className="mt-8 text-caption text-fg-muted">
          © {new Date().getFullYear()} Ryze Consultoria em Recursos Humanos. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
