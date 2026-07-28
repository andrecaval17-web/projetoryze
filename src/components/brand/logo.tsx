import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  /**
   * "auto" (padrão) troca de variante com o tema ambiente do site (wordmark
   * escuro no claro, claro no escuro) — para contextos onde o fundo em volta
   * do logo não é forçado, como a tela de cadastro/login. "dark-bg" fixa a
   * variante de wordmark clara, para lugares com fundo escuro forçado
   * (navbar e footer, ambos `.dark bg-ink` independente do tema do site).
   */
  tone?: "auto" | "dark-bg";
}

// Proporção real dos arquivos em public/brand/ryze-logo*.png (874×426).
const LOGO_ASPECT = 874 / 426;

const sizes = {
  sm: 28,
  md: 36,
  lg: 56,
};

export function Logo({ className, size = "md", showTagline = false, tone = "auto" }: LogoProps) {
  const height = sizes[size];
  const width = Math.round(height * LOGO_ASPECT);
  const style = { height, width };

  return (
    <div className={cn("inline-flex flex-col", className)}>
      {tone === "dark-bg" ? (
        <Image
          src="/brand/ryze-logo-light.png"
          alt="Ryze"
          width={width}
          height={height}
          priority
          className="object-contain"
          style={style}
        />
      ) : (
        <>
          <Image
            src="/brand/ryze-logo.png"
            alt="Ryze"
            width={width}
            height={height}
            priority
            className="object-contain dark:hidden"
            style={style}
          />
          <Image
            src="/brand/ryze-logo-light.png"
            alt="Ryze"
            width={width}
            height={height}
            priority
            className="hidden object-contain dark:block"
            style={style}
          />
        </>
      )}
      {showTagline && (
        <span className="mt-1 text-caption uppercase tracking-wide text-fg-muted">
          Consultoria em Recursos Humanos
        </span>
      )}
    </div>
  );
}
