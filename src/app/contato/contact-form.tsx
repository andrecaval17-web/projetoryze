"use client";

import { useActionState, useRef, useEffect } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { submitLead, type LeadFormState } from "./actions";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

const initialState: LeadFormState = { status: "idle" };

export function ContactForm({
  initialProduct,
  initialIntent,
}: {
  initialProduct?: string;
  initialIntent?: string;
}) {
  const [state, formAction, isPending] = useActionState(submitLead, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-5">
      {initialProduct && <input type="hidden" name="produto" value={initialProduct} />}
      {initialIntent && <input type="hidden" name="intencao" value={initialIntent} />}

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Nome completo" htmlFor="name" required>
          <Input id="name" name="name" placeholder="Seu nome" required />
        </FormField>
        <FormField label="E-mail" htmlFor="email" required>
          <Input id="email" name="email" type="email" placeholder="voce@email.com" required />
        </FormField>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Telefone" htmlFor="phone" helperText="Opcional">
          <Input id="phone" name="phone" type="tel" placeholder="(00) 00000-0000" />
        </FormField>
        <FormField label="Empresa" htmlFor="company" helperText="Opcional">
          <Input id="company" name="company" placeholder="Nome da empresa" />
        </FormField>
      </div>

      <FormField label="Área de interesse" htmlFor="type">
        <Select id="type" name="type" defaultValue={initialProduct ? "produtos" : "consultoria"}>
          <option value="consultoria">Consultoria em RH</option>
          <option value="produtos">Produtos de IA</option>
          <option value="candidato">Sou candidato</option>
          <option value="outro">Outro assunto</option>
        </Select>
      </FormField>

      <FormField label="Mensagem" htmlFor="message" helperText="Opcional">
        <Textarea id="message" name="message" placeholder="Como podemos ajudar?" />
      </FormField>

      <Checkbox
        id="consent"
        name="consent"
        required
        label="Concordo em ser contatado pela Ryze sobre este assunto."
      />

      {state.status === "success" && (
        <p className="flex items-center gap-2 rounded-md bg-accent-500/10 px-4 py-3 text-body-sm text-accent-600 dark:text-accent-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {state.message}
        </p>
      )}
      {state.status === "error" && (
        <p className="flex items-center gap-2 rounded-md bg-error/10 px-4 py-3 text-body-sm text-error">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {state.message}
        </p>
      )}

      <Button type="submit" size="lg" loading={isPending} className="w-full sm:w-auto">
        Enviar mensagem
      </Button>
    </form>
  );
}
