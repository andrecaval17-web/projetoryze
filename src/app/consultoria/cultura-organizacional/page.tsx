import type { Metadata } from "next";
import { Compass, Megaphone, Repeat, PenTool, Radar, Users2 } from "lucide-react";
import { ServicePageTemplate } from "@/components/sections/service-page-template";
import { CultureHero } from "@/components/sections/culture-hero";
import { buildPageMetadata } from "@/lib/seo";
import { buildContactWhatsappHref } from "@/lib/whatsapp-number";

export const metadata: Metadata = buildPageMetadata({
  title: "Cultura Organizacional — Ryze Consultoria",
  description:
    "A maioria das empresas mede clima, não cultura. Desenhamos, comunicamos e medimos a cultura — a forma como as coisas são feitas no dia a dia.",
  path: "/consultoria/cultura-organizacional",
});

export default function CulturaOrganizacionalPage() {
  return (
    <ServicePageTemplate
      eyebrow="Cultura Organizacional"
      title="Clima é o que se sente. Cultura é o que sustenta."
      subtitle="Clima é a ponta do iceberg. Cultura é a massa submersa — a forma como as coisas são feitas todo dia. É essa parte que a Ryze desenha, comunica e mede."
      hero={<CultureHero />}
      highlights={[
        { value: "desenhamos", label: "a cultura de quem ainda não tem uma definida" },
        { value: "comunicamos", label: "a cultura que existe mas não é disseminada" },
        { value: "medimos", label: "a percepção real da cultura no dia a dia" },
      ]}
      painTitle="Clima não é cultura — e confundir os dois custa caro"
      painPoints={[
        "A maioria das pesquisas de 'cultura' mede, na verdade, clima: a sensação do momento, não a forma como as coisas são feitas.",
        "Valores no site que ninguém reconhece no dia a dia — cultura declarada que não é a cultura praticada.",
        "Empresas que crescem rápido e diluem o que fazia o time funcionar bem.",
        "Nenhuma forma consistente de saber se as pessoas entendem e vivem a cultura ao longo do tempo.",
      ]}
      differentiatorsTitle="Como trabalhamos cultura de verdade"
      differentiators={[
        {
          icon: Compass,
          title: "Cultura é 'como fazemos as coisas aqui'",
          description:
            "Partimos da definição certa: cultura são os comportamentos, decisões e formas de trabalhar reais — não um mural de valores. Clima é a temperatura; cultura é o clima ao longo do tempo.",
        },
        {
          icon: PenTool,
          title: "Desenho de cultura para quem não tem",
          description:
            "Metodologia para definir, do zero, os comportamentos e princípios que devem guiar a empresa — conectados à estratégia, não a frases genéricas.",
        },
        {
          icon: Megaphone,
          title: "Comunicação para quem tem, mas não dissemina",
          description:
            "Muita empresa tem cultura, mas ela vive na cabeça dos fundadores. Criamos a comunicação que faz a cultura chegar, de forma clara, a todo o time.",
        },
        {
          icon: Radar,
          title: "Pesquisa periódica de percepção",
          description:
            "Metodologia de pesquisa trimestral, semestral ou anual para medir se as pessoas entendem e percebem a cultura no dia a dia — e agir onde há desvio.",
        },
        {
          icon: Repeat,
          title: "Cultura como processo contínuo",
          description:
            "Cultura não se decreta uma vez. Acompanhamos a evolução ao longo do tempo, ajustando comunicação e práticas conforme a empresa muda.",
        },
        {
          icon: Users2,
          title: "Liderança alinhada",
          description:
            "A cultura é vivida pela liderança primeiro. Trabalhamos com gestores para que decisões e comportamentos sejam consistentes entre as áreas.",
        },
      ]}
      methodologyTitle="Como desenhamos e sustentamos a cultura"
      methodologySteps={[
        { label: "Diagnóstico", description: "Cultura real vs. declarada" },
        { label: "Desenho", description: "Comportamentos-chave" },
        { label: "Comunicação", description: "Disseminação para o time" },
        { label: "Pesquisa", description: "Percepção periódica" },
        { label: "Ajuste", description: "Ação contínua sobre desvios" },
      ]}
      resultsTitle="Por que cultura forte vira resultado"
      resultsSubtitle="O que a pesquisa mostra sobre empresas com times realmente engajados na cultura."
      results={[
        {
          value: "23%",
          label: "mais lucratividade em unidades de negócio com times engajados",
          source: "Gallup",
        },
        {
          value: "18%",
          label: "mais produtividade em times altamente engajados",
          source: "Gallup",
        },
        {
          value: "78%",
          label: "menos absenteísmo em ambientes de alto engajamento",
          source: "Gallup",
        },
      ]}
      ctaLabel="Quer uma cultura que as pessoas realmente vivem?"
      ctaSubtitle="Fale com um especialista sobre o diagnóstico de cultura."
      ctaHref={buildContactWhatsappHref("Cultura Organizacional")}
    />
  );
}
