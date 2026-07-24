import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { WhatsappCta } from "@/components/painel/whatsapp-cta";

export const metadata: Metadata = {
  title: "Grupo de vagas — Ryze",
  robots: { index: false, follow: false },
};

// Rota antiga da Fase 3 (formulário curto de entrada). O formulário em si foi
// substituído pelo "Preencher perfil" completo em /painel/curriculo — esta
// página agora só cobre o caso de quem já preencheu (mostra o link do
// WhatsApp de novo, útil se a pessoa perdeu o link) e redireciona quem ainda
// não preencheu para o fluxo novo, para não deixar links antigos quebrados.
export default async function ComecarPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/cadastro?plano=gratis");
  }

  const { data: existingProfile } = await supabase
    .from("candidate_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!existingProfile) {
    redirect("/para-candidatos/painel/curriculo");
  }

  const whatsappLink = process.env.NEXT_PUBLIC_WHATSAPP_GROUP_LINK || null;

  return (
    <div className="mx-auto flex max-w-lg flex-col px-5 py-16">
      <Link href="/" aria-label="Ryze — início" className="mx-auto">
        <Logo size="md" />
      </Link>
      <div className="mt-8">
        <WhatsappCta whatsappLink={whatsappLink} />
      </div>
    </div>
  );
}
