"use client";

import { useActionState } from "react";
import { CheckCircle2, AlertCircle, MessageCircle } from "lucide-react";
import { submitRecruitmentLead, type RecruitmentLeadState } from "./actions";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { WhatsappClickLink } from "@/components/whatsapp/whatsapp-click-link";
import { buildContactWhatsappHref } from "@/lib/whatsapp-number";

const initialState: RecruitmentLeadState = { status: "idle" };

const WHATSAPP_HREF = buildContactWhatsappHref("Recrutamento e Seleção");

export function RecruitmentLeadForm({ originPath }: { originPath?: string } = {}) {
  const [state, formAction, isPending] = useActionState(submitRecruitmentLead, initialState);

  if (state.status === "success") {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <p className="flex items-center gap-2 rounded-md bg-accent-500/10 px-4 py-3 text-body-sm text-accent-600 dark:text-accent-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {state.message}
        </p>
        <p className="text-body-sm text-fg-muted">
          Quer agilizar? Fale com a gente agora mesmo no WhatsApp.
        </p>
        <Button asChild size="lg">
          <WhatsappClickLink href={WHATSAPP_HREF} target="_blank" rel="noopener noreferrer" button="lead_form_success">
            <MessageCircle className="h-4 w-4" />
            Falar no WhatsApp
          </WhatsappClickLink>
        </Button>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {/* Honeypot: invisível e inalcançável por teclado pra um visitante
          real (nenhum label, fora da ordem de tab, fora da tela) — um bot
          que preenche todo input do formulário cai aqui. Ver actions.ts. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Site</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {originPath && <input type="hidden" name="origin_path" value={originPath} />}

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Nome completo" htmlFor="name" required>
          <Input id="name" name="name" placeholder="Seu nome" maxLength={120} required />
        </FormField>
        <FormField label="Empresa" htmlFor="company" required>
          <Input id="company" name="company" placeholder="Nome da empresa" maxLength={120} required />
        </FormField>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="WhatsApp" htmlFor="phone" required>
          <Input id="phone" name="phone" type="tel" placeholder="(00) 00000-0000" maxLength={30} required />
        </FormField>
        <FormField label="Cargo a contratar" htmlFor="role" required>
          <Input id="role" name="role" placeholder="Ex: Analista de RH" maxLength={120} required />
        </FormField>
      </div>

      <FormField label="Urgência da contratação" htmlFor="urgency" required>
        <Select id="urgency" name="urgency" defaultValue="" required>
          <option value="" disabled>
            Selecione
          </option>
          <option value="imediata">Imediata</option>
          <option value="ate_30_dias">Até 30 dias</option>
          <option value="pesquisando">Só pesquisando</option>
        </Select>
      </FormField>

      {state.status === "error" && (
        <p className="flex items-center gap-2 rounded-md bg-error/10 px-4 py-3 text-body-sm text-error">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {state.message}
        </p>
      )}

      <Button type="submit" size="lg" loading={isPending} className="w-full">
        Quero contratar mais rápido
      </Button>
    </form>
  );
}
