import type { Metadata } from "next";
import { headers } from "next/headers";
import { Space_Grotesk, Inter } from "next/font/google";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { WhatsappButton } from "@/components/layout/whatsapp-button";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: "Ryze — Consultoria em Recursos Humanos",
  description:
    "Ryze une consultoria de RH e inteligência artificial para acelerar recrutamento, cultura organizacional e recolocação de carreira.",
};

// Light is the default brand experience — dark only applies if the visitor
// has explicitly switched to it before (system preference is not consulted).
const themeInitScript = `
(function () {
  try {
    if (localStorage.getItem('ryze-theme') === 'dark') {
      document.documentElement.classList.add('dark');
    }
  } catch (e) {}
})();
`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Setado pelo proxy.ts a cada request — precisa bater com o nonce que vai
  // na CSP, senão o browser bloqueia este script também.
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html
      lang="pt-BR"
      className={`${spaceGrotesk.variable} ${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Navegadores não refletem o valor real de `nonce` como atributo
            (por segurança, pra não vazar via outerHTML) — o React compara
            o atributo renderizado no servidor ("") contra a propriedade
            real no client e sempre acusa mismatch aqui, mesmo com tudo
            funcionando. suppressHydrationWarning evita o falso positivo. */}
        <script nonce={nonce} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col bg-bg text-fg">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsappButton />
      </body>
    </html>
  );
}
