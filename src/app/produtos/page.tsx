import type { Metadata } from "next";
import Link from "next/link";
import { BrainCircuit, GraduationCap } from "lucide-react";
import { ProductsHero } from "@/components/sections/products-hero";
import { ProductCard } from "@/components/ui/product-card";
import { CtaBand } from "@/components/sections/cta-band";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Produtos de IA — Ryze",
  description: "Recrutamento com IA e educação corporativa personalizada — tecnologia que acelera o seu RH.",
};

export default function ProdutosPage() {
  return (
    <>
      <ProductsHero
        eyebrow="Produtos de IA"
        title={
          <>
            Tecnologia que <span className="text-gradient-ryze">acelera</span> o seu RH
          </>
        }
        subtitle="Ferramentas de inteligência artificial que fazem o trabalho pesado — para o seu time focar em decisão, não em planilha."
        primaryCta={
          <Button asChild size="lg">
            <Link href="/contato">Ver demonstração ao vivo</Link>
          </Button>
        }
      />

      <section className="mx-auto max-w-5xl px-5 py-16 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2">
          <ProductCard
            icon={BrainCircuit}
            title="Recrutamento com IA"
            description="Hunting e análise automática de candidatos com inteligência artificial — do sourcing ao ranking por match."
            href="/produtos/recrutamento-ia"
          />
          <ProductCard
            icon={GraduationCap}
            title="Educação Corporativa"
            description="Trilhas de aprendizagem personalizadas por IA, desenhadas a partir dos gaps reais de cada time."
            href="/produtos/educacao-corporativa"
          />
        </div>
      </section>

      <CtaBand
        title="Quer ver a IA da Ryze em ação no seu RH?"
        subtitle="Agende uma conversa e veja uma demonstração ao vivo."
        ctaLabel="Falar com um consultor"
        ctaHref="/contato"
        tone="dark"
      />
    </>
  );
}
