import { WhatsappIcon } from "@/components/ui/social-icons";
import { WHATSAPP_NUMBER } from "@/lib/whatsapp-number";

const WHATSAPP_MESSAGE = "Olá, preciso de ajuda com o site da Ryze";

export function WhatsappButton() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-ryze hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
    >
      <WhatsappIcon className="h-7 w-7" />
    </a>
  );
}
