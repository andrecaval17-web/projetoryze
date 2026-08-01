"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Badge } from "@/components/ui/badge";
import { LoginForm } from "@/app/login/login-form";
import { SignupForm } from "@/app/cadastro/signup-form";
import type { CandidatePlan, BillingInterval } from "@/lib/plans";
import { cn } from "@/lib/utils";

type Tab = "entrar" | "criar-conta";

interface AuthTabsProps {
  initialTab: Tab;
  plan: CandidatePlan;
  /** Escolhido na página pública de planos (toggle mensal/anual) — carregado
   * até o cadastro pra fazer o checkout no intervalo certo. Default mensal
   * pras telas que não passam esse parâmetro (ex: /login). */
  interval?: BillingInterval;
}

const TAB_COPY: Record<Tab, { title: string; subtitle: string }> = {
  entrar: { title: "Entrar na sua conta", subtitle: "Acesse seu currículo, vagas e planos." },
  "criar-conta": { title: "Criar sua conta", subtitle: "Leva menos de um minuto." },
};

export function AuthTabs({ initialTab, plan, interval = "month" }: AuthTabsProps) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const isAnnual = interval === "year" && plan.annualPriceCents != null;
  const displayPrice = isAnnual ? plan.annualPrice : plan.price;
  const displayPeriod = isAnnual ? "/ano" : plan.period;
  // Preenchido quando a pessoa troca de aba a partir de um erro (e-mail já
  // cadastrado no cadastro, ou "não tem conta" no login) — carrega o e-mail
  // já digitado pra não fazer a pessoa redigitar.
  const [prefillEmail, setPrefillEmail] = useState("");

  function switchTo(next: Tab, email: string) {
    setPrefillEmail(email);
    setTab(next);
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-5 py-16">
      <Link href="/" aria-label="Ryze — início" className="mx-auto">
        <Logo size="md" />
      </Link>

      <div className="mt-8 text-center">
        <h1 className="font-display text-display-md font-semibold text-fg">{TAB_COPY[tab].title}</h1>
        {tab === "criar-conta" ? (
          <p className="mt-2 flex items-center justify-center gap-2 text-body-sm text-fg-muted">
            Plano selecionado:
            <Badge variant={plan.recommended ? "recommended" : "neutral"}>
              {plan.name}
              {plan.period ? ` · ${displayPrice}${displayPeriod}` : plan.priceCents === 0 ? " · grátis" : ""}
            </Badge>
          </p>
        ) : (
          <p className="mt-2 text-body-sm text-fg-muted">{TAB_COPY[tab].subtitle}</p>
        )}
      </div>

      <div role="tablist" className="mt-8 grid grid-cols-2 gap-1 rounded-md bg-bg-surface-2 p-1">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "entrar"}
          onClick={() => setTab("entrar")}
          className={cn(
            "rounded-[5px] px-4 py-2 text-body-sm font-medium transition-ryze",
            tab === "entrar" ? "bg-bg text-fg shadow-sm" : "text-fg-muted hover:text-fg"
          )}
        >
          Entrar
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "criar-conta"}
          onClick={() => setTab("criar-conta")}
          className={cn(
            "rounded-[5px] px-4 py-2 text-body-sm font-medium transition-ryze",
            tab === "criar-conta" ? "bg-bg text-fg shadow-sm" : "text-fg-muted hover:text-fg"
          )}
        >
          Criar conta
        </button>
      </div>

      <div className="mt-6">
        {tab === "entrar" ? (
          <LoginForm
            key={`login-${prefillEmail}`}
            prefillEmail={prefillEmail}
            onOfferSignup={(email) => switchTo("criar-conta", email)}
          />
        ) : (
          <SignupForm
            key={`signup-${prefillEmail}`}
            plan={plan.slug}
            interval={isAnnual ? "year" : "month"}
            prefillEmail={prefillEmail}
            onOfferLogin={(email) => switchTo("entrar", email)}
          />
        )}
      </div>
    </div>
  );
}
